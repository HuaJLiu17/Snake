const io = require('socket.io')();   //imports a function that when executed grabs the socket.io object
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils')

const state = {};
const clientRooms = {}; //lets us look up the roomName of a particular client id. 

io.on('connection', client => {        //gives us a client object and allows us to communicate back to the client that is connected
    
    client.on('keydown', handleKeyDown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame() {
        const room = io.sockets.adapter.rooms[gameCode];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if(allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        } 

        clientRooms[client.id] = gameCode;

        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    }

    function handleNewGame() {
        let roomName = makeid(5); //makes a 5 character id for the game room
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame(); //makes the roomName a key of the state object

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeyDown(keyCode) {   //we create this function HERE because we want access to the client
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {    //The try...catch statement marks a try block and a catch block. If the code in the try block throws an exception then the code in the catch block will be executed.
            keyCode = parseInt(keyCode); //changes keyCode string to integer value
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode); //convert the keycode press into a velocity

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {    //use setInterval to set up our "framerate"
        const winner = gameLoop(state[roomName]);  //gameLoop function accepts the state in that instance & move us forward in our game world

        if(!winner) {  //if no winner (return value is 0)
            emitGameState(roomName, state[roomName])
        } else {  //if there is a winner
            emitGameOver(roomName, winner);
            state[roomName] == null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE) //gives us the number of milliseconds to wait inbetween each frame
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state))
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName) 
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(3000);