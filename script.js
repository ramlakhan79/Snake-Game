const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const resultCanvas = document.getElementById("result");
const rtx = resultCanvas.getContext("2d");

const cellSize = 25;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let snake = {
  cells: [[0, 0]],
  direction: "right",
  speed: 200,
};

let food = generateRandomCell();
let gameOver = false;

let currentScore = 0;
let highScore = getHighScoreFromLocalStorage();

document.addEventListener("keydown", handleKeyDown);

let lastFrameTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastFrameTime;
  if (deltaTime >= snake.speed) {
    lastFrameTime = timestamp;

    if (!gameOver) {
      updateSnake();
      checkCollisions();
      updateScores();
      draw();
    }
  }

  requestAnimationFrame(gameLoop);
}

function updateSnake() {
  const head = [...snake.cells[snake.cells.length - 1]];

  switch (snake.direction) {
    case "right":
      head[0] += cellSize;
      break;
    case "left":
      head[0] -= cellSize;
      break;
    case "up":
      head[1] -= cellSize;
      break;
    case "down":
      head[1] += cellSize;
      break;
  }

  snake.cells.push(head);

  if (head[0] === food[0] && head[1] === food[1]) {
    currentScore++;
    snake.speed = Math.max(50, 200 - currentScore * 10); // Speed increases with the score
    food = generateRandomCell();
  } else {
    snake.cells.shift(); // Move the snake
  }
}

function checkCollisions() {
  const head = snake.cells[snake.cells.length - 1];

  if (
    head[0] < 0 ||
    head[0] >= canvasWidth ||
    head[1] < 0 ||
    head[1] >= canvasHeight ||
    snake.cells.some((cell, idx) => {
      return (
        idx !== snake.cells.length - 1 &&
        cell[0] === head[0] &&
        cell[1] === head[1]
      );
    })
  ) {
    gameOver = true;
  }
}

function updateScores() {
  if (gameOver) {
    if (currentScore > highScore) {
      highScore = currentScore;
      setHighScoreToLocalStorage(highScore); // Store the new high score
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw snake
  snake.cells.forEach((cell, index) => {
    const isHead = index === snake.cells.length - 1;
    ctx.fillStyle = isHead ? "#4CAF50" : `hsl(${(index * 30) % 360}, 70%, 50%)`;
    drawRoundedRect(cell[0], cell[1], cellSize, cellSize, 10);

    if (isHead) {
      drawSnakeEyes(cell, snake.direction);
    }
  });

  // Draw food
  ctx.fillStyle = "red";
  drawRoundedRect(food[0], food[1], cellSize, cellSize, 10);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 200, 180);
    ctx.fillText(`Final Score: ${currentScore}`, 200, 230);
    ctx.fillText("Press any key to restart", 200, 280);
  }

  drawScores(); // Draw the scores at the top
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.fill();
}

function drawScores() {
  rtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height); // Clear existing text
  rtx.fillStyle = "black";
  rtx.font = "18px Arial";
  rtx.fillText(`Score: ${currentScore}`, 10, 25);
  rtx.fillText(`High Score: ${highScore}`, 10, 45);
}

function drawSnakeEyes(head, direction) {
  const eyeRadius = 5;
  ctx.fillStyle = "white";

  if (direction === "right" || direction === "left") {
    ctx.beginPath();
    ctx.arc(head[0] + 10, head[1] + 8, eyeRadius, 0, 2 * Math.PI); // Eye 1
    ctx.fill();
    ctx.beginPath();
    ctx.arc(head[0] + 10, head[1] + 17, eyeRadius, 0, 2 * Math.PI); // Eye 2
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(head[0] + 8, head[1] + 10, eyeRadius, 0, 2 * Math.PI); // Eye 1
    ctx.fill();
    ctx.beginPath();
    ctx.arc(head[0] + 17, head[1] + 10, eyeRadius, 0, 2 * Math.PI); // Eye 2
    ctx.fill();
  }
}

function generateRandomCell() {
  const maxX = Math.floor((canvasWidth - cellSize) / cellSize);
  const maxY = Math.floor((canvasHeight - cellSize) / cellSize);
  return [
    Math.floor(Math.random() * maxX) * cellSize,
    Math.floor(Math.random() * maxY) * cellSize,
  ];
}

function handleKeyDown(e) {
  const newDirection = getNewDirection(e.key);

  if (isValidDirectionChange(newDirection)) {
    snake.direction = newDirection;
  }

  if (gameOver) {
    resetGame(); // Reset game on any key press after game over
  }
}

function getNewDirection(key) {
  switch (key) {
    case "ArrowDown":
      return "down";
    case "ArrowUp":
      return "up";
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    default:
      return snake.direction;
  }
}

function isValidDirectionChange(newDirection) {
  const invalidChanges = {
    right: "left",
    left: "right",
    up: "down",
    down: "up",
  };
  return newDirection !== invalidChanges[snake.direction];
}

function resetGame() {
  snake = {
    cells: [[0, 0]],
    direction: "right",
    speed: 200,
  };

  food = generateRandomCell();
  gameOver = false;
  currentScore = 0;
}

function getHighScoreFromLocalStorage() {
  const highScore = localStorage.getItem("hiscore");
  return highScore ? JSON.parse(highScore) : 0;
}

function setHighScoreToLocalStorage(score) {
  localStorage.setItem("hiscore", JSON.stringify(score));
}

gameLoop(0); // Start the game loop
