// import { io } from 'socket.io-client'
const socket = io("http://localhost:3000");



const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916'

socket.on('init', handleInit); //The .on() method attaches event handlers to the currently selected set of elements in the jQuery object
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);


const gameScreen = document.getElementById('gameScreen');   //saves the html elements to variables
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
    socket.emit('newGame');
    init();  //we only want to use the init function when we're creating or joining a new game
}

function joinGame() {
    const code = gameCodeInput.value;  //saves the gameCode that the user typed in 
    socket.emit('joinGame', code);
    init()
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";  //hides the initial screen
    gameScreen.style.display = "block";  

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');  //context will be assigned to canvas with a two-dimensional rendering context

    canvas.width = canvas.height = 600;  //600 is in pixels

    ctx.fillStyle = BG_COLOUR;   //paints the canvas with BG_COLOUR background
    ctx.fillRect(0, 0, canvas.width, canvas.height);  //draws a filled rectangle starting a 0, 0, and go down to canvas.width and canvas.height

    document.addEventListener('keydown', keydown);   //keydown event will call the keydown function
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.keyCode) //sends the keydown event back to the server. keyCode value represents the numerical value of the key that was pressed.
}


function paintGame(state){       
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize; //calculates the pixels per grid square in game space. ie: 600 px / 20 squares = 30px per square

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour){
    const snake = playerState.snake;

    ctx.fillStyle = colour; // paints the snake's colour
    for(let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size)
    }
}


function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState){  //receive the new updated gameState every time the server sends us an updated gameState
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);  //turns string into value or objects described by the string
    requestAnimationFrame(() => paintGame(gameState)); /*  method tells the browser that you wish to perform an animation and requests that the
     browser calls a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint. */
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);

    if (data.winner === playerNumber) {
    alert('You Win, Big Daddy!');
    } else {
    alert('You Lost, trashass.')
    }
    gameActive = false;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers() {
    reset();
    alert("This game is already in progress");
}

function reset() {     //resets the UI to where we started
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}