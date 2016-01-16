// Load Environment File at first! IMPORTANT
var nodeEnvFile = require('node-env-file');
nodeEnvFile(__dirname + '/.env');

var express = require('express'), 
    http = require('http'),
    NutriGuessApp = express(),
    NutriGuessAppServer = NutriGuessApp.listen(process.env.PORT_NUMBER),
    socketIo = require('socket.io').listen(NutriGuessAppServer),

    nutritionInfo = require('./nutritionInfo'),
    generateRandomDigits = require('./generateRandomDigits'),
    defaultScoreState = require('./defaultScoreState'),

    foodList = ["Burger", "Grape", "Banana", "Cookie", "Spaghetti", 
                "Vanilla Ice Cream", "Doritos", "Apple fruit", 
                "Fried Chicken", "Strawberry", "Corn on the cob"],

    /**
    * groupList - list of group games currently occuring, 
    *   identified by a group number key and object value:
    * {
    *   started: false
    *   players: {
    *       someGuest1: {
    *           calories: 400,
    *           fat: 67
    *       }
    *       someGuest2: anotherIntScore
    *   }
    * }
    * Where a guest's score on a specific category defaults to 
    *   20% of the daily nutritional value and is deducted at 
    *   each play.
    */
    groupList = {},

    /**
    * playersList - list of players in the system, 
    *   identified by a player name and object value:
    * {
    *   invitations: [someGroup1, someGroup2]
    * }
    */
    playersList = {};



/**
* CORS header
*/
NutriGuessApp.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
                  'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
                  'X-Requested-With, Faggotry, content-type, authorization, accept, origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();	
    }
});


/**
* Server has detected a client connection
*/
socketIo.on('connection', function (socket) {

    socket.emit('serverConnection');
    console.log('CONNECTED --->');
    
    
    /**
    * Actual login
    */
    socket.on('actualLogin', function () {
        playersList.aparagas = {
            invitations: []
        };
        socket.emit('actualLoginSuccess', {
           playerName: "aparagas" 
        });
        
        console.log('ACTUAL LOGIN --->');
    });

    /**
    * Client wants to setup a guest game (no login)
    */
    socket.on('guestLogin', function () {    
        // Generate guest name and notify client about 
        // generated client name
        var guestName = generateRandomDigits(4);
        while (guestName in playersList) {
            guestName = generateRandomDigits;
        }
        playersList["Guest_" + guestName] = {
            invitations: []
        };
        socket.emit('guestLoginSuccess', {
            playerName: "Guest_" + guestName
        });

        console.log('GUEST LOGIN --->');
    });


    /**
    * Client wants to setup a group
    */
    socket.on('setupGroup', function (data) {
        var groupNumber = generateRandomDigits(3),
            playerName = data.playerName;

        // Player does not exist
        if (!(playerName in playersList)) {
            socket.emit('setupGroupFail', {
                message: "Player " + playerName + " does not exist!"
            });
            return;
        }

        while (groupNumber in groupList) {
            groupNumber = generateRandomDigits(3);
        }
        // Create a group with the generated group number
        groupList[groupNumber] = {
            players: {},
            started: false
        }; 
        groupList[groupNumber].players[playerName] = 0;

        // Notify Client back about the group number
        socket.emit('setupGroupSuccess', {
            groupNumber: groupNumber
        });

        console.log('GROUP SETUP --->');
    });


    /**
    * Client wants to invite someone to a group
    */
    socket.on('setupGroupInvite', function (data) {
        var playerName = data.playerName, 
            invitedPlayersList = data.invitedPlayersList, 
            groupNumber = data.groupNumber;
        
        console.log(JSON.stringify(invitedPlayersList));

        invitedPlayersList.forEach(function (invitedPlayer) {
            // Player is already in game or has already been invited? Avoid
            if (invitedPlayer in groupList[groupNumber] || 
                (invitedPlayer in playersList && 
                 groupNumber in playersList[invitedPlayer].invitations)
               ) {
                return;
            }
            playersList[invitedPlayer].invitations.push(groupNumber);

            socket.emit('groupInviteNotify', {
                playerName: invitedPlayer,
                playerFrom: playerName,
                invitations: playersList[invitedPlayer].invitations
            });
        });

        console.log('GROUP INVITE --->');
    });


    /**
    * Client joins a group he/she was invited in
    */
    socket.on('joinGroup', function (data) {
        var groupNumber = data.groupNumber,
            playerName = data.playerName;

        // Group does not exist
        if (!(groupNumber in groupList)) {
            socket.emit('joinGroupFail', {
                message: "Group " + groupNumber + " does not exist!"
            });
            return;
        }
        // Player does not exist
        if (!(playerName in playersList)) {
            socket.emit('joinGroupFail', {
                message: "Player " + playerName + " does not exist!" 
            });
            return;
        }
        // Client is already in group
        if (playerName in groupList[groupNumber].players.keys()) {
            socket.emit('joinGroupFail', {
                message: "You are already in this group!"
            });
            return;
        }

        // Default Player score state
        groupList[groupNumber].players[playerName] = defaultScoreState();
        socket.emit('joinGroupSuccess', {
            playerCount: groupList[groupNumber].players.length,
            players: groupList[groupNumber].players,
            groupNumber: groupNumber
        });

        console.log('JOINED GROUP --->');
    });


    /**
    * Client wants to start the play for a specific group
    */
    socket.on('playGroup', function (data) {
        var groupNumber = data.groupNumber;

        if (!(groupNumber in groupList)) {
            socket.emit('playGroupFail', {
                message: "That group does not exist!"
            });
            return;
        }

        groupList[groupNumber].started = true;
        socket.to(groupNumber).emit('playGroupNotify', {
            groupNumber: groupNumber
        });

        console.log('PLAY GROUP --->');
    });


    /**
    * Client wants to get a question for a specific group
    */
    socket.on('playQuestion', function (data) {
        var groupNumber = data.groupNumber, 
            playerName = data.playerName,
            category = data.category,

            someFoodName = foodList[Math.ceil(Math.random()) * 
                                    foodList.length - 1];

        nutritionInfo
            .getInfo(someFoodName)
            .then(function (nutritionObject) {
            socket.emit('playQuestionSuccess', {
                foodName: foodList.pop(),
                servingSize: nutritionObject.servingSize,
                answer: nutritionObject[category],
                image: nutritionObject.image
            });
        }, function (err) {
            socket.emit('playQuestionFail', {
                message: err.message
            });
        });

        console.log('PLAY QUESTION --->');
    });



    /**
    * Client answers a question (specific group)
    */
    socket.on('playAnswer', function (data) {
        var groupNumber = data.groupNumber,
            playerName = data.playerName,
            category = data.category,
            answer = data.answer;

        // Group does not exist
        if (!(groupNumber in groupList)) {
            socket.emit('playAnswerFail', {
                message: "That group does not exist!"
            });
            return;
        }
        // Player does not exist in group
        if (!(playerName in groupList[groupNumber].players)) {
            socket.to(groupNumber).emit('playAnswerFail', {
                message: "That player does not exist!"
            });
        }
        if (answer < 0) {
            socket.to(groupNumber).emit('playAnswerFail', {
                message: "That answer is invalid!"
            });
        }

        console.log('PLAY ANSWER --->');
    });

});