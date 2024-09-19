const DEFAULT_PITCH = 0.8;
const RANK_LEVEL_COUNT = 10; 
const synth = speechSynthesis;
const voices = synth.getVoices();

let pitch = DEFAULT_PITCH;
let level = parseInt(window.localStorage.getItem("game_level") ?? 1);
let healthCount = parseInt(window.localStorage.getItem("game_health") ?? 4);
let userInputs = [];
let alive = true;
let word;

const words = [
  "strawberry",
  "apple",
  "mango",
  "zebra",
  "mississippi",
  "kangaroo",
  "africa",
  "battery",
  "foreigner",
];

const praises = [
  "Nice one",
  "Awesome",
  "You are killing it my G!",
  "Keep it up buddy",
];

const complaints = [
  "Noooo!",
  "Come on! Think harder!!",
  "Try again buddy!",
  "You wanna kill me, don't you?",
  "Please stop!",
  "Really bro?",
  "I'm starting to reconsider my safety",
  "That's not correct",
];

function chooseRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function setGameLevel() {
  const bgLevel = Math.trunc(level / RANK_LEVEL_COUNT) + 1;
  const newStyleClass = `l-${bgLevel}`;
  const oldStyleClass = `l-${bgLevel - 1}`;
  const body = document.body;

  document.getElementById("level-indicator").textContent = `Lv ${level}`;
  body.classList.toggle(newStyleClass, true);
  body.classList.toggle(oldStyleClass, false);

  console.log(bgLevel);
}

function saveInput(userKey) {
  const letterPositions = [];

  for (let i = 0; i < word.length; i += 1) {
    const currentLetter = word.charAt(i);

    if (userKey === currentLetter) {
      letterPositions.push(i);
      userInputs[i] = userKey;
    }
  }
}

function displayInput(userKey) {
  saveInput(userKey);
  const inputContainer = document.getElementById("input-container");

  for (let i = 0; i < userInputs.length; i += 1) {
    const item = userInputs[i];
    inputContainer.children[i].value = item;
  }

  checkCompleted();
}

function generateInputElements() {
  const inputContainer = document.getElementById("input-container");
  inputContainer.innerHTML = "";

  for (let i = 0; i < word.length; i += 1) {
    // <input type="text" maxlength="1" placeholder=" "/>
    userInputs.push("");
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("maxlength", 1);
    inputElement.setAttribute("placeholder", " ");

    inputContainer.appendChild(inputElement);
  }
}

function generateLivesElements() {
  const healthContainer = document.getElementById("health-bar");
  healthContainer.innerHTML = "";

  for (let i = 0; i < healthCount; i += 1) {
    // <input type="text" maxlength="1" placeholder=" "/>
    const lifeElement = document.createElement("span");
    lifeElement.setAttribute("class", "life");
    healthContainer.appendChild(lifeElement);
  }
}

function speak(message) {
  // console.log(voices);
  if (!synth.speaking) {
    synth.cancel();
  }

  const utterance = new window.SpeechSynthesisUtterance(`${message}`);
  utterance.voice = voices[0];
  utterance.volume = 100;
  utterance.pitch = pitch;
  synth.speak(utterance);
}

function displayGoodMessage(message) {
  message = message ?? chooseRandomItem(praises);
  const messageBox = document.querySelector("#message h3");
  messageBox.classList.toggle("act", true);
  messageBox.textContent = message;

  if (message) {
    speak(message);
  }

  window.setTimeout(function () {
    messageBox.classList.toggle("act", false);
  }, 2000);
}

function displayBadMessage(message) {
  message = message ?? chooseRandomItem(complaints);
  const messageBox = document.querySelector("#message h3");
  messageBox.textContent = message;
  messageBox.classList.toggle("act", true);

  if (message) {
    speak(message);
  }

  window.setTimeout(function () {
    messageBox.classList.toggle("act", false);
  }, 2000);
}

function killKangaroo() {
  displayBadMessage("You failed!");
  document.getElementById("hero").classList.add("dead");
  localStorage.clear();
}

function saveKangaroo() {
  const currentLevel = Number(level);
  const newLevel = currentLevel + 1;

  displayGoodMessage("You Won!");
  localStorage.setItem("game_level", newLevel);

  document.querySelector("#hero img").src =
    "./assets/pngtree-mother-and-baby-kangaroo-happy-mascot-animal-vector-picture-image_9353134.png";
    
  if (newLevel % RANK_LEVEL_COUNT === 0) {
    updateLife(1);
  }
  // document.getElementById("hero").classList.add("live");
}

function checkCompleted() {
  const allInputIsFilled = userInputs.every((item) => item !== "");

  if (allInputIsFilled) {
    saveKangaroo();
    window.setTimeout(function () {
      resetGame();
      const a = confirm("You did it!!");
      if (a) {
        resetGame();
      }
    }, 1000);
  }
}

function verifyUserKey(key, code) {
  return word.toLowerCase().includes(key.toLowerCase());
}

function updateLife(decrement) {
  const healthContainer = document.getElementById("health-bar");

  healthCount = healthCount + decrement;
  alive = healthCount > 0;
  
  if (decrement < 0 && healthCount >= 0) {
    healthContainer.removeChild(healthContainer.children[0]);
    localStorage.setItem("game_health", healthCount);
  } else if (decrement > 0) {
    healthContainer.appendChild(healthContainer.children[0].cloneNode(true));
    localStorage.setItem("game_health", healthCount);
  }

  if (alive === false) {
    killKangaroo();

    window.setTimeout(function () {
      resetGame();
    }, 2000);
  }
}

function handleKeyInput(ev) {
  const userKey = ev.key;
  const userKeyCode = ev.keyCode; // saves a number that corresponds to the letter pressed
  // console.log(ev);

  // if key is between a-z
  if (userKeyCode >= 65 && userKeyCode <= 90) {
    // if verifyUserKey returns true
    if (verifyUserKey(userKey)) {
      pitch = DEFAULT_PITCH;
      displayInput(userKey);
      displayGoodMessage(chooseRandomItem(praises));
    } else {
      pitch += Number(Number(2 / 5).toFixed(1));
      displayBadMessage();
      updateLife(-1);
    }
  }
}

function showSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");
  splashScreen.style.display = "flex";

  window.setTimeout(() => {
    document.querySelector("main").classList.toggle("not-started");
    splashScreen.style.display = "none";
    document.addEventListener("keyup", handleKeyInput);
  }, 10000);
}

function resetGame() {
  window.location.reload();
}

function startGame(ev) {
  // Add handler for keyboard
  word = chooseRandomItem(words);
  displayGoodMessage(" ");
  generateLivesElements();
  generateInputElements();
  showSplashScreen();
  setGameLevel();
}

document.addEventListener("DOMContentLoaded", startGame);
