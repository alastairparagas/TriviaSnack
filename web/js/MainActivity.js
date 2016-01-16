console.log("MainActivity Loaded");

//StartScreen Elements
var startScreen = exportRoot.startScreen;
var logInBtn = startScreen.LogInBtn;
var guestBtn = startScreen.PlayBtn;
var focusActivity = startScreen;


//Lobby Elements
var lobby = exportRoot.Lobby;
var playerName = lobby.playerName;
var newGameBtn = lobby.newGame;
var ongoingGames = lobby.ongoingGames;
ongoingGames.visible = false;

//GameSettings Elements
var gameSettings = exportRoot.gameSettings;
var singBtn = gameSettings.singBtn;
var multBtn = gameSettings.multBtn;
var startSingBtn = gameSettings.startSingBtn;
var startMultBtn = gameSettings.startMultiBtn;
var addPBtn = gameSettings.addPlayerBtn
var exitBtn = gameSettings.exitBtn;
var comp1 = gameSettings.comp1;
var comp2 = gameSettings.comp2;
var comp3 = gameSettings.comp3;
var comp4 = gameSettings.comp4;
var addCompBtn = gameSettings.addCompBtn;
var comps = [comp1,comp2,comp3,comp4];
var playerAdd_input = null;


//Game Elemenets
var Game = exportRoot.game;
var spinner = Game.spinner;
var wheel = spinner.wheel;
var questBox = Game.questBox;
var results = questBox.results;
var wheelVel = 0;
var spinValid = false;
var item = "Banana";
var round = 1;

var Opps = [];
var yourName = "Guest_1337";

var p_texts = [Game.player1, Game.player2, Game.player3, Game.player4];
for(var i=0; i<p_texts.length; i++){
	p_texts[i].text = "";
}

var kcal_txt = Game.kcal; 
var carb_txt = Game.carb; 
var prot_txt = Game.prot; 
var sodi_txt = Game.sodi; 
var sug_txt = Game.sug; 
var fat_txt = Game.fat; 
var chol_txt = Game.chol; 

var threshes = [400,60,10,480,25,13,60];
var startThreshes = [400,60,10,480,25,13,60];
var thresh_txt = [kcal_txt, carb_txt, prot_txt, sodi_txt, sug_txt, fat_txt, chol_txt ];

var guessItem = "Nothing";
var cat = "Nothing";
var serv = "KCals";
var answer = "69";
var cati = 0;
var diff = 0;

for(var i=0; i< threshes.length; i++){
	thresh_txt[i].text = threshes[i];
}

for(var i=0; i<comps.length; i++){
	comps[i].visible = false;
}


var onlineImg = new Image();

//loadImage("https://s-media-cache-ak0.pinimg.com/236x/13/dc/9a/13dc9a4d6a5485c941c6bf3e020942a3.jpg");
 function loadImage(url){
	onlineImg.src = url;
  	onlineImg.onload = handleImageLoad;
 }
 var greenRect = null;

 function handleImageLoad(event) {
	    greenRect = new createjs.Bitmap(onlineImg);
	    stage.addChild(greenRect);
	    greenRect.x = 1080/2 - onlineImg.width/2;
	    greenRect.y = 225;
	    greenRect.height = 230;
	    stage.update();
 }

 function removeImage(){
 	stage.removeChild(greenRect);
 	stage.update();
 }

function onClick(btn, callback, release){

	btn.addEventListener("mousedown",function(){
		if(!release){
			callback();
			return;
		}
		//console.log("mouseDown");
		if(btn.button){
			//console.log("valid");
			btn.button.gotoAndStop(1);
		}else{
			btn.gotoAndStop(1);
		}
	})
	btn.addEventListener("pressup",function(){
		if(btn.button){
			btn.button.gotoAndStop(0);
		}else{
			btn.gotoAndStop(0);
		}
		callback();
	});
}

function init_startScreen(){
	onClick(guestBtn,function(){
		console.log("Entering as Guest");
		switchActivity(lobby);
		socket_guestLogin();
	},true);

	logInBtn.addEventListener("click",function(){
		console.log("Entering as aparagas");
		lobby.playerName.text = "aparagas";
		socket_actualLogin();
		lobby.loginThing.visible = false;
		switchActivity(lobby);
	});
}

function init_lobby(){
	onClick(newGameBtn, function(){
		console.log("Opening Game Settings");
		openGameSettings();
	}, false);
}

function switchActivity(activity){
	//TODO: make this work
	createjs.Tween.get(focusActivity).to({
				x: -1200,

	}, 1000,createjs.Ease.quadInOut);

}

function openGameSettings(){
	createjs.Tween.get(gameSettings).to({
				alpha: 1,

	}, 700,createjs.Ease.quadInOut);
	singBtn.gotoAndStop(1);
	addCompBtn.visible = false;

	onClick(multBtn, function(){
		multBtn.gotoAndStop(1);
		singBtn.gotoAndStop(0);
		addCompBtn.visible=true;
		startSingBtn.visible = false;
	},false);

	
	onClick(singBtn,function(){
		singBtn.gotoAndStop(1);
		multBtn.gotoAndStop(0);
		addCompBtn.visible=false;
		startSingBtn.visible = true;
	},false);
	
	onClick(startSingBtn, function(){
		console.log("Starting Single Player Game");
	},true);

	onClick(addCompBtn , function(){
		openAddOpponentTab();
	},true);

	onClick(startMultBtn, function(){
		socket_createRoom(yourName);
		openGame();
	},true);
}


function wheelFunc(){
	if(!spinValid){
			wheelVel = 30+Math.random()*30;
			spinValid = true;
	}
}
function openGame(){


	closeInput();
	gameSettings.alpha = 0;
	gameSettings.x = 535;
	singBtn.gotoAndStop(1);
	multBtn.gotoAndStop(0);
	createjs.Tween.get(Game).to({
				x: 550,

	}, 700,createjs.Ease.quadInOut)

	spinner.addEventListener("click",wheelFunc);
}


function closeGame(){
	socket_sendInvite();
	spinner.removeEventListener("click",wheelFunc);
	createjs.Tween.get(Game).to({
				x: -550,

	}, 700,createjs.Ease.quadInOut);
}


createjs.Ticker.addEventListener("tick", tick);
function tick() { 
	wheel.rotation += wheelVel;
	wheelVel*=.97;
	if(wheelVel>0 && wheelVel<.05){
		wheelVel = 0;
		genQuestion(wheel.rotation);
	}
}

function genQuestion(rot){

	rot = rot%360;

	console.log("rotation: "+rot);
	if(rot<25 || rot > 335){
		//pink
		cat = "cholesterol";
		serv = "mg";
		questBox.bgColor.gotoAndStop(6);
		cati = 6;
		//questBox.question.text = "What's the amount of cholesterol of: "+guessItem;
	}else if(rot < 76){
		cat = "fat";
		serv = "cals";
		questBox.bgColor.gotoAndStop(5);
		cati = 5;
		//questBox.question.text = "What's the amount of calories of: "+guessItem;
		//purple
	}else if(rot < 127){
		cat = "sugar";
		serv = "g";
		questBox.bgColor.gotoAndStop(4);
		cati = 4;
		//questBox.question.text = "What's the amount of carbs of: "+guessItem;
		//blue
	}else if(rot < 178){
		cat = "sodium";
		serv = "g";
		questBox.bgColor.gotoAndStop(3);
		cati = 3;
		//questBox.question.text = "What's the amount of protein of: "+guessItem;
		//green
	}else if(rot < 229){
		cat = "protein";
		serv = "mg";
		questBox.bgColor.gotoAndStop(2);
		cati = 2;
		//questBox.question.text = "What's the amount of sodium of: "+guessItem;
		//yello
	}else if(rot < 280){
		cat = "wheat";
		serv = "g";
		questBox.bgColor.gotoAndStop(1);
		cati = 1;
		//questBox.question.text = "What's the amount of sugar in of: "+guessItem;
		//orange
	}else{
		cat = "calories";
		serv = "g";
		questBox.bgColor.gotoAndStop(0);
		cati = 0;
		//questBox.question.text = "What's the amount of fat in of: "+guessItem;
		//red
	}
	console.log("cat: "+cat);
	socket_getQuestion(groupNumber,yourName,cat);
}

function openQuestion(){
	questBox.question.text = "What's the amount of "+cat+"("+serv+") of: "+guessItem; 
	createjs.Tween.get(questBox).to({
				y: 1100,

	}, 700,createjs.Ease.quadInOut).call(makeGuessInput);
}

function makeGuessInput(){
	playerAdd_input = document.createElement("INPUT");
	playerAdd_input.style.position = "absolute";
	playerAdd_input.style.top = "" + 1000 + "px";
	playerAdd_input.style.left = "" + 200 + "px";
	playerAdd_input.style.fontSize = "" + 115 + "px";
	playerAdd_input.style.textAlign = "center";
	playerAdd_input.placeholder = "Amount";
	playerAdd_input.style.borderRadius = "15px";
	playerAdd_input.style.width ="690px"
	document.body.appendChild(playerAdd_input);

	playerAdd_input.addEventListener("keydown",function(k){
		if(k.keyCode === 13){
			results.yourGuess.amount.text = ""+playerAdd_input.value+serv;
			results.actualAmount.amount.text = ""+answer+serv;
			diff = Math.abs(parseInt(playerAdd_input.value) - parseInt(answer)); 
			results.diffAmount.amount.text = ""+diff;
			console.log("dif: "+diff);

			if(diff>(parseInt(answer)*.20)){
				results.afterComment.gotoAndStop(0);
			}else if(diff>(parseInt(answer)*.15)){
				results.afterComment.gotoAndStop(1);
			}else if(diff>(parseInt(answer)*.10)){
				results.afterComment.gotoAndStop(2);
			}else if(diff>(parseInt(answer)*.5)){
				results.afterComment.gotoAndStop(3);
			}else{
				results.afterComment.gotoAndStop(4);
			}
			results.play();
			closeInput();
		}
	});
}

function backToWheel(){
	removeImage();
	var goal = (parseInt(answer)*.05);
	console.log("diff: "+diff);
	console.log("goal: "+goal);
	console.log("cati: "+cati);
	setTimeout(function(){
		changeStack(diff,thresh_txt[cati]);
	},1000);
	

	if(diff<=goal){
		round = 5;
	}
	//TODO: check if victory
	createjs.Tween.get(questBox).to({
				y: 2900,

	}, 700,createjs.Ease.quadInOut).call(createAddOppInput).call(function(){
		spinValid = false;
		results.gotoAndStop(1);
		round++;
		if(round>5){
			closeGame();
		}else{
			Game.rounds.text = "Round "+round+"/5";
		}

	});
	
}



function openAddOpponentTab(){
	console.log("opening oppTab");
	createjs.Tween.get(gameSettings).to({
				x: -560,

	}, 700,createjs.Ease.quadInOut).call(createAddOppInput);
}

function closeInput(){
	document.body.removeChild(playerAdd_input);
}

function createAddOppInput(){
	if(playerAdd_input == null){
		playerAdd_input = document.createElement("INPUT");
		playerAdd_input.style.position = "absolute";
		playerAdd_input.style.top = "" + 575 + "px";
		playerAdd_input.style.left = "" + 80 + "px";
		playerAdd_input.style.fontSize = "" + 115 + "px";
		playerAdd_input.style.textAlign = "center";
		playerAdd_input.placeholder = "PlayerName";
		playerAdd_input.style.borderRadius = "15px";
		playerAdd_input.style.width ="690px"
		document.body.appendChild(playerAdd_input);

		onClick(addCompBtn,function(){
			addOpp(playerAdd_input.value);
		}, true);

		playerAdd_input.addEventListener("keydown",function(k){
			if(k.keyCode === 13){
				addOpp(playerAdd_input.value);
			}
		})
	}
}

function addOpp(name){
	console.log(name);
	if(name!==""){
			console.log("breaker");
			comps[Opps.length].OppName.text = name;
			comps[Opps.length].visible = true;
			Opps.push(name);
			console.log("fucker joe");
			playerAdd_input.value = "";
		}
}

function init(){
	init_startScreen();
	init_lobby();
	gameSettings.alpha = 0;
}
init();




var stackingChips = false;
//var endingAmount = 300;
function changeStack(amount,textfield){
	stackingChips = true;

	if(amount >3){
		textfield.scaleX=1.3;
		textfield.scaleY=1.3;
		createjs.Tween.get(textfield).to({
					scaleX: 1,
					scaleY: 1
		}, 1500, createjs.Ease.quadInOut);
	}

	//textfield.text = ""+(parseInt(textfield.text) - amount);
	 var og = parseInt(textfield.text);
	 createjs.Ticker.addEventListener("tick", downTick);
	 var orig_amount = amount;
 	 function downTick(event) {
     	amount-=1;
    	//echo(" money"," og_amount: "+orig_amount+"  gains: "+gains +" amount: "+amount);
       	if(amount<=0){
       		stackingChips = false;
       		createjs.Ticker.removeEventListener("tick", downTick)
       	}
       	if(amount>0){
       		stackingChips = true;
       		textfield.text=""+(og-orig_amount+amount-1);
       		textfield.alpha = .3+((og-orig_amount+amount-1)/startThreshes[cati])*.7;
       	}
 	}


}