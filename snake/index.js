const screenBreakpoint = window.matchMedia("(max-width: 600px)");
let ctx = null;
let CANVAS_WIDTH = 500;
let CANVAS_HEIGHT = 500;
const RANK_LEVEL_COUNT = 10;
const FPS = 14;

let level = 1;
let player1 = null;
let player2 = null;
let paused = false;
let animationFrameHandle = null;
let actors = [];
let dx = 0;

function setGameLevel(_level = level) {
  const bgLevel = Math.trunc(_level / RANK_LEVEL_COUNT) + 1;
  const newStyleClass = `l-${bgLevel}`;
  const oldStyleClass = `l-${bgLevel - 1}`;
  const body = document.body;

  document.getElementById(
    "level-indicator"
  ).children[0].textContent = `Lv ${_level}`;
  document.getElementById("level-indicator").children[1].textContent = `CITY`;

  body.classList.toggle(newStyleClass, true);
  body.classList.toggle(oldStyleClass, false);
}

function animateFrame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  actors.forEach((actor) => {
    if (actor === player1) {
      actor.incrementX(dx);
    }
    actor.draw(ctx);
  });

  if (paused) {
    cancelAnimationFrame(animationFrameHandle);
  } else {
    animationFrameHandle = requestAnimationFrame(animateFrame);
  }
}

function startGame() {
  const canvas = document.getElementById("game-canvas");
  CANVAS_WIDTH = canvas.width = 500;
  CANVAS_HEIGHT = canvas.width = 500;
  ctx = canvas.getContext("2d");

  player1 = new Player(32, 32, 10, 0);
  player2 = new Player(30, 43.2, 10, 20);
  // player1 = new Player(50, 72, 10, 0);

  player1.spawn(ctx, FPS);
  player2.spawn(ctx, FPS, "sprite2");

  actors.push(player1);
  actors.push(player2);
  animateFrame();
}

function endGame() {
  if (animationFrameHandle) cancelAnimationFrame(animationFrameHandle);
}

function setupListeners() {
  const startGameButton = document.querySelector(
    "#main_menu button:first-child"
  );

  startGameButton.addEventListener("click", (ev) => {
    window.location.hash = "play";
    startGame();
  });

  window.addEventListener("keyup", (ev) => {
    // console.log(ev);
    switch (ev.code) {
      case "Space":
        paused = !paused;

        if (paused === false) {
          animateFrame();
        }
        break;

      default:
        if (player1) {
          player1.setState(0, FPS);
          dx = 0;
        }
        break;
    }
  });

  window.addEventListener("keydown", (ev) => {
    switch (ev.code) {
      case "ArrowUp":
        if (player1) {
          player1.setState(2, 6);
          dx = 0;
        }
        break;

      case "ArrowDown":
        if (player1) {
          player1.setState(3, 10);
          dx = 0;
        }
        break;

      case "ArrowLeft":
        if (player1) {
          player1.setState(4, 5);
          dx = 0;
        }
        break;

      case "ArrowRight":
        if (player1) {
          player1.setState(1, 5);
          dx = 1;
        }
        break;

      default:
        break;
    }
  });
}

function goToMainmenu() {
  endGame();
  window.location.hash = "main_menu";
}

function showSplashScreen(redirectTo = `main_menu`) {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";
  window.location.hash = redirectTo;

  window.setTimeout(() => {
    document.querySelector("main").classList.toggle("not-started");
    setupListeners();
    splashScreen.style.display = "none";
  }, 1700);
}

function loadSettings() {
  level = parseInt(window.localStorage.getItem("game_level") ?? 1);
  setGameLevel();
}

function loadGame(ev) {
  loadSettings();
  showSplashScreen();
}

document.addEventListener("DOMContentLoaded", loadGame);
