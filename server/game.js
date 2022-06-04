const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState()
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        }, {
            pos: {
                x: 18,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10},
            ],
        }],
        food: {},
        gridsize: GRID_SIZE,
    };
}

function gameLoop(state) {
    if (!state) {   //if not given a state, don't do anything
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;   //updates the position 
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;   //updates the position 
    playerTwo.pos.y += playerTwo.vel.y;

    if(playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2; //if playerOne has gone off the canvas, then player 2 has won. 0 means keep playing, 1 means playerOne won, 2 means playerTwo won.
    }

    if(playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1; //if playerTwo has gone off the canvas, then player 1 has won. 0 means keep playing, 1 means playerOne won, 2 means playerTwo won.
    }

    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) { //if the head of the snake is where the food is then...
    playerOne.snake.push({ ...playerOne.pos }); // adds an extra object to our snake array
    playerOne.pos.x += playerOne.vel.x;   //increment the position again so we're ahead of where the snake was when we ate the food
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state); //creates a new food in random position
    }

    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) { 
        playerTwo.snake.push({ ...playerTwo.pos }); 
        playerTwo.pos.x += playerTwo.vel.x;   
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state); 
        }
        

    if (playerOne.vel.x || playerOne.vel.y) { //checks if the snake is moving
        for (let cell of playerOne.snake) {
            if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) { //if one of the cells in the body of the snake is bumping into the HEAD of the snake
                return 2; //then player2 wins
            }
        }

        playerOne.snake.push({ ...playerOne.pos });  //adds to the length of snake
        playerOne.snake.shift()  //removes the first object
    }

    if (playerTwo.vel.x || playerTwo.vel.y) { //checks if the snake is moving
        for (let cell of playerTwo.snake) {
            if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) { //if one of the cells in the body of the snake is bumping into the HEAD of the snake
                return 2; //then player2 wins
            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });  //adds to the length of snake
        playerTwo.snake.shift()  //removes the first object
    }

    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    for (let cell of state.players[0].snake) {
        if(cell.x === food.x && cell.y === food.y) { //if food is generated on top of the snake...
        return randomFood(state) //recursively call randomFood until it's not on top of snake.
        }
    }
    for (let cell of state.players[1].snake) {
        if(cell.x === food.x && cell.y === food.y) { //if food is generated on top of the snake...
        return randomFood(state) //recursively call randomFood until it's not on top of snake.
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode){
    switch (keyCode) {
        case 37: { //left 
        return { x: -1, y: 0 };
        }
        case 38: { //down 
        return { x: 0, y: -1 };
        }
        case 39: { //right 
        return { x: 1, y: 0 };
        }
        case 40: { //up 
        return { x: 0, y: 1 };
        }
    }
}