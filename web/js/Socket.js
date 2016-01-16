console.log("Sockets Loaded");
var groupNumber = 99999;
var socket = io('http://192.168.15.73:8000/');


function socket_guestLogin(){
	socket.emit("guestLogin",{});
}
function socket_actualLogin(){
	socket.emit("actualLogin",{});
}

function socket_sendGame(gameObj){
	console.log("emitting sendGame");
	socket.emit('sendGame', gameObj);
}

function socket_createRoom(username){
	console.log("emitting createRoom");
	socket.emit("setupGroup",{playerName:username});
	socket.on('setupGroupSuccess', function (data) {
		console.log(data.groupNumber);
	});
	socket.on('setupGroupFail', function (data) {
		console.log(data.message);
	});
}

function socket_getQuestion(groupNumber, name, cat){
	console.log("emitting wantQuestion");
	socket.emit("playQuestion",{groupNumber:groupNumber, playerName:name, category: cat});
}

socket.on("setupGroupSuccess",function(msg){
	console.log("TRIGGERED: setupSuccess");
	console.log(msg);
	groupNumber = msg.groupNumber;
});

socket.on("playQuestionSuccess",function(msg){
	console.log("TRIGGERED: qSuccess");
	console.log(msg);
	guessItem = msg.foodName +" "+msg.servingSize;
	loadImage(msg.image);
	answer = msg.answer;
	openQuestion();
})

socket.on("playQuestionFail",function(msg){
	console.log("FAILED");
	console.log(msg.message);
})

socket.on("groupInviteNotify",function(msg){
	console.log("I heard something!");
	var pName = msg.playerName;
	var myName = lobby.playerName.text;
	if(myName !== pName){
		return;
	}

	ongoingGames.visible = true;
	

	if(pName === "Guest_1337"){
		ongoingGames.person.text = "aparagas";
	}else{
		ongoingGames.person.text = "Guest_1337";
	}

})

function socket_sendInvite(){
	socket.emit("setupGroupInvite",{playerName: lobby.playerName.text, invitedPlayersList: ["aparagas"], groupNumber:groupNumber});
}