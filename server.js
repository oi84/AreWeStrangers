var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client/',express.static(__dirname + '/client/'));
//below is port number
serv.listen(2000);
console.log("server started")

var Player = function(code){
	var self={
		code:code,
		currentroom: 0,
		name: "",
		turn: 0,
		//number: "" + Math.floor(10000 * Math.random()) + Math.floor(1000 * Math.random()) + Math.floor(100 * Math.random()) + Math.floor(10 * Math.random());
	}
	return self;
}

var Game = function(id){
	var self={
		id:id,
		level: 1,
		counter:0,
		qarray:{},
	}
	return self;
}

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ROOM_LIST = {};
var GAME_LIST = {};
var LEVEL_1 = [
	'Do you think I\'m mainly cooking, or getting take out?',
	'Do you think that I\'ve ever been in love?',
	'What\'s the first thing you noticed about me?',
	'On a scale of 1-10, how messy do you think my room is? 1 being the cleanest 10 complete disaster, explain.',
	'Do you think plants thrive or die in my care? Explain.',
	'Do I look like more of a creative or analytical type? Explain.',
	'What do you think I\'ve been binge watching lately? ',
	'What do you think has been my go to snack during this time?',
	'What time do you think I\'ve been waking up these days?',
	'What was your first impression of me?',
	'What do you think I do/want to do for a living?',
	'What about me is the most strange/unfamiliar to you?',
	'What is the worst assumption someone has made about you?',
	'What does my style tell you about me?',
	'Do you think I was popular in school? Explain.',
	'What does my phone wallpaper say about me?',
	'What do you think I\'m most likely to splurge on?',
	'Finish the sentence: Just by looking at you, I\'d think ____.',
	'Do I look kind? Explain.',
	'WILDCARD: Create your own question.',
	'What\'s your favorite song that comes to your mind on the top of your head?',
	'Do you think I\'ve ever been fired from a job? If so, what for?',
	'What does my Instagram tell you about me?',
	'WILDCARD: Both players, write down your number one goal for the next month. Compare.',
]

var LEVEL_2 =[
	'What are you most excited for today? Big or small.',
	'WILDCARD: Both players, share your phone screen time.',
	'What\'s been your happiest memory this past year?',
	'Have you changed your mind about anything recently?',
	'What has been your earliest recollection of happiness?',
	'What lesson took you the longest to learn?',
	'Are you lying to yourself about anything?',
	'What questions are you trying to answer most in your life right now?',
	'When was the last time you surprised yourself?',
	'What title would you give this chapter in your life?',
	'What do you crave more of?',
	'Finish the sentence: Strangers would describe me as ______, but only friends know that I am _______',
	'What\'s the worst pain you have ever been in that wasn\'t physical?',
	'Has a stranger ever changed your life?',
	'What would your younger self not believe about your life today?',
	'What are you more afraid of: failure or success and why?',
	'What is a dream you let go of?',
	'If you could get to know someone in your life on a deeper level who would it be and why?',
	'What\'s your mom\'s name and what is the most beautiful thing about her?',
	'What part of your life works? What part of your life hurts?',
	'How can you become a better person?',
	'Do you think the image you have of yourself matches the image other people see you as?',
	'Are you missing anyone right now? Do you think they miss you too?',
	'What fast food restaurant do you think I\'m most likely to drive through? What\'s my order?',
	'When you are asked how are you, how often do you answer truthfully?',
	'How are you, really?',
	'What\'s the most unexplainable thing that happened to you?',
	'What\'s your father\'s name? Tell me one thing about him.',
	'If you could have it your way: who would you be with? Where would you be? What would you be doing?',
	'Describe your perfect day!',
	'WILDCARD: Both players, write a note to your younger selves (1 minute). Share it with each other.',
	'What advice would you give your younger self?',
	'How old do you feel?',
	'Is there an image of yourself you try to project in first impressions that you wish you could let go of?',
	'What did the people who raised you teach you about love?',
	'What are you passionate about?',
	'What are you not currently giving enough time to?',
	'WILDCARD: Text a friend you admire. Let them know why you appreicate them.',
	'What is your most toxic trait you can admit to?',
	'What have you been taking for granted lately?',
	'What about yourself is hard to admit?',
	'Who in your life can you be most vulnerable with?',
	'Think of someone you look up to. Why did this person come to mind?',
	'What do you think my main love language is?',
	'Finish the sentence: Dear people who raised me, thank you for ______.',
	'WILDCARD: Starting contest! First to blink has to answer a question from the other player.',
]

var LEVEL_3 = [
	'What about me surprised you?',
	'Based on what you know about me, do you have a Netflix recommendation?',
	'What do you think our most important similarities are?',
	'If you could give me one piece of advice, what would it be?',
	'What would be the perfect gift for me?',
	'How would you describe me to a stranger?',
	'What do I need to hear right now?',
	'Based on what you\'ve learned about me, does my social media portray me accurately?',
	'What is a lesson you will take away from our conversation?',
	'What can I help you with?',
	'What do you think do I fear the most?',
	'What about me is the hardest for you to understand?',
	'What parts of yourself do you see in me?',
	'How does one earn your vulnerability?',
	'What do you recommend I should let go of?',
	'What has this conversation taught you about yourself?',
	'What do you think my defining characteristic is?',
	'What question were you most afraid to answer?',
	'Why do you think we met?',
	'When this game is over, what will be something you will remember about me?',
	'What do you think my weakness is?',
	'How do our personalities compliment each other?',
	'What do you think I should know about myself that perhaps I\'m unaware of?',
	'What would make you feel closer to me?',
	'In one word, describe how you feel right now.',
	'Do you believe everyone has a calling? If so, do you think I\'ve found mine?',
	'What answer of mine made you light up?',
	'What\'s the most attractive quality about me that isn\'t physical?',
	'Am I what you expected me to be?',
	'If you made a playlist for me, what 3 songs would be on it?',
]

var io = require('socket.io') (serv, {});
io.on('connection', function(socket){
	var code = Math.floor(1000 + Math.random() * 9000);
	SOCKET_LIST[code] = socket;
	
	var player = Player(code);
	PLAYER_LIST[code] = player;
	var game;

	socket.on('disconnect', function(){
		var roomcode = player.currentroom;
		delete SOCKET_LIST[socket.code];
		delete PLAYER_LIST[socket.code];
		if(player.code == roomcode){
			socket.in(roomcode).emit('interrupt');
			delete ROOM_LIST[roomcode];
			delete GAME_LIST[roomcode];
		}
		else {
			ROOM_LIST[roomcode]--;
			socket.in(roomcode).emit('interruptowner');
		}
		socket.disconnect(roomcode);
	});

	socket.on('createroomjs', function(data){
		player.name = data.name;
		player.currentroom = code;
		player.turn = 1;
		socket.join(code);
		ROOM_LIST[code] = 1;
		socket.emit('createlobby',{
			code: code,
			full: 0,
			name: data.name,
		});
	});

	socket.on('joinRoom', function(data){
		var helper = data.code;
		var room = ROOM_LIST[helper];
		var temp = SOCKET_LIST[helper];
		if(room == 1){
			ROOM_LIST[helper]++;
			socket.name = data.name;
			player.name = data.name;
			socket.currentroom = helper;
			player.currentroom = helper;
			socket.turn = 0;
			player.turn = 0;
			socket.join(socket.currentroom);
			socket.emit('createlobby',{
				code:helper,
				full: 1,
				name: PLAYER_LIST[helper].name + " " + data.name,
			});
			socket.in(socket.currentroom).emit('createstartbutton',{
				full: 1,
				name: data.name,
			});
		}
		else if(room == 2){
			socket.emit('full');
		}
		else{
			socket.emit('noroom');
		}
	});

	socket.on('startGame', function(data){
		var code = data.id;
		game = Game(code);
		GAME_LIST[code] = game;
		var number = Math.floor(Math.random() * LEVEL_1.length);
		var q = LEVEL_1[number];
		game.qarray[0] = number;
		game.counter++;
		socket.emit('creategamestart',{
			level: "Level 1 : Perception",
			counter: "Question " + game.counter + "/20",
			question: q,
			button: "Next Question",
			code: code,
		});
		socket.in(code).emit('createforotherstart',{
			level: "Level 1 : Perception",
			counter: "Question " + game.counter + "/20",
			question: q,
			code: code,
		});
	});

	socket.on('next', function(data){
		var roomcodehelper = data.code;
		var currentgame = GAME_LIST[roomcodehelper];
		var questionbank;
		var count = currentgame.counter;
		var buttontext;
		//if level is over
		if(count == 19){
			if(currentgame.level == 3){
				buttontext = "Finish";
			}
			else{
				buttontext = "Go Deeper";
			}
		}
		else{
			buttontext = "Next Question";
		}
		if(count == 20){
			currentgame.level++;
			currentgame.qarray = {};
			currentgame.counter = 0;
			count = 0;
		}
		if(currentgame.level == 4){
			io.sockets.in(roomcodehelper).emit('end',{
				code: roomcodehelper,
			});
		}
		else{
			//change questionbank based on level
			var levelstring;
			if(currentgame.level == 1){
				questionbank = LEVEL_1;
				levelstring = "Level 1: Perception";
			}
			else if(currentgame.level == 2){
				questionbank = LEVEL_2;
				levelstring = "Level 2: Connection";
			}
			else if(currentgame.level == 3){
				questionbank = LEVEL_3;
				levelstring = "Level 3: Reception";
			}
			var level = currentgame.level;
			var array = currentgame.qarray;
			var number;
			//check if we've already done question before
			while(true){
				var check = true;
				number = Math.floor(Math.random() * questionbank.length);
				for(var i = 0; i < count; i++){
					if(array[i] == number){
						check = false;
					}
				}
				if(check == true){
					break;
				}
				else{
					continue;
				}
			}
			var question = questionbank[number];
			currentgame.qarray[count] = number;
			currentgame.counter++;
			socket.emit('createforother',{
				level: levelstring,
				counter: "Question " + currentgame.counter + "/20",
				question: question,
				button: buttontext,
			});
			socket.in(roomcodehelper).emit('creategame',{
				level: levelstring,
				counter: "Question " + currentgame.counter + "/20",
				question: question,
				button: buttontext,
			});
		}
	});

	socket.on('send', function(data){
		var x = data.message;
		var y = data.code;
		console.log(x);
		socket.to(y).emit('receivemessage', {
			message: x,
		});
	});
});