import {
  RANK_LEVEL_COUNT,
  MAX_CARD_COUNT,
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  cardTypes,
  powerActionTypes,
  availablePowerTypes,
} from "./minified/config.min.js";
import {
  delay,
  formatAsTime,
  convertToStandardFormat,
  getDirectionVector,
} from "./minified/utils.min.js";
import sounds, {
  playSoundEffect,
  setSoundEffectsEnabled,
} from "./minified/audio.min.js";
import { createGameTimer } from "./minified/timer.min.js";
import { setupListeners as bindListeners } from "./minified/listeners.min.js";
import { getCardTypes, populateCardGrid, areCardsMatching } from "./cards.js";
import { generateMap as renderMap } from "./map.js";
import { createUI } from "./ui.js";

let level = 1;
let highestLevel = 1;
let rank = 0;
let gems = 0;
let points = 0;
let pairCount = 2;
let cardClicks = 0;
let cardCount = pairCount * 2;
let numberOfPairsMatched = 0;
let currentMatches = [];
let canPlayEffects = true;
let nextActivePowerTime = 15;
let meterValue = 0;
let meterDrainRate = 0.6;
let meterIsDraining = false;
let comboMultiplier = 0;
let equippedBtn = availablePowerTypes[0];
let mapStarted = false;

const screenBreakpoint = window.matchMedia("(max-width: 600px)");
const peekCardAudio = sounds.peekCard;
const clickCardAudio = sounds.clickCard;
const clickButtonAudio = sounds.clickButton;
const closeCardAudio = sounds.closeCard;
const matchCardAudio = sounds.matchCard;
const powerUpAudio = sounds.powerUp;
const winGameAudio = sounds.winGame;
const timeUpAudio2 = sounds.timeUpVoice;
const timeUpAudio1 = sounds.timeUp;

function getTimerDurationForLevel() {
  const sets = Math.ceil(cardCount / pairCount);

  const currentRank = Math.floor((level - 1) / RANK_LEVEL_COUNT) + 1;
  const baseTimePerSet = Math.pow(3, pairCount / 2) * currentRank;

  // Preserve the original formula until the card cap is reached.
  const baseDuration = sets * baseTimePerSet;

  if (cardCount < MAX_CARD_COUNT) {
    const levelAdjustment = Math.max(0.5, 1 - (rank - 1) * 0.04);

    return Math.round(baseDuration * levelAdjustment + 5);
  }

  // Stable ascending baseline for each rank cycle.
  // 0 at levels 10, 20, 30...; approaches 1 before the next boundary.
  const progress = (level % RANK_LEVEL_COUNT) / RANK_LEVEL_COUNT;

  // Descending sinusoidal multiplier.
  const wave = Math.sin((progress * Math.PI) / 2);

  const MIN_MULTIPLIER = 0.75;
  const MAX_MULTIPLIER = 1.25;

  // Use a stable baseline so rank resets cannot distort the curve.
  const stableBase = sets * Math.pow(3, pairCount / 2) * currentRank;

  const timerMultiplier =
    MAX_MULTIPLIER - (MAX_MULTIPLIER - MIN_MULTIPLIER) * wave;

  return Math.round(stableBase * timerMultiplier + 5);
}

function handleTimerTimeout() {
  gameTimer.pause();

  const commentary = document.getElementById("commentary");
  const dialog = document.getElementById("win-badge-dialog");
  const text = document.createElement("h3");
  text.textContent = "Game Over!";
  dialog.appendChild(text);

  playSoundEffect(timeUpAudio1);
  delay(500, () => {
    playSoundEffect(timeUpAudio2);
    commentary.style.display = "none";
    commentary.textContent = "";
    dialog.setAttribute("open", true);

    delay(2000, () => {
      window.location.reload();
    });
  });
}

function calculateMeterIncrementAndDecrement() {
  const meterIncrement = Math.floor(
    (1 / (level + 1)) * (MAX_METER_VALUE * (1 + comboMultiplier)),
  );
  const meterDecrement = Math.floor((1 / (level + 1)) * MAX_METER_VALUE) * 1.2;

  return {
    increment: meterIncrement,
    decrement: meterDecrement,
  };
}

function updatePowerMeter(direction = 0, useDirectionAsIncrement = false) {
  const powerMeter = document.querySelector("#power-meter > *:first-child");
  const equippedPowerBtn = document.querySelector(
    `main #${powerActionTypes[equippedBtn].id}`,
  );
  const { increment: meterIncrement, decrement: meterDecrement } =
    calculateMeterIncrementAndDecrement();

  switch (true) {
    case direction < 0:
      meterValue -= useDirectionAsIncrement
        ? Math.abs(direction)
        : meterDecrement;
      break;

    case direction > 0:
      meterValue += useDirectionAsIncrement
        ? Math.abs(direction)
        : meterIncrement;
      break;

    default:
      meterValue += useDirectionAsIncrement ? Math.abs(direction) : 0;
      break;
  }

  if (meterValue < MIN_METER_VALUE) {
    meterValue = MIN_METER_VALUE;
  } else if (meterValue > MAX_METER_VALUE) {
    meterValue = MAX_METER_VALUE;
  }

  switch (true) {
    case meterValue === MAX_METER_VALUE:
      powerMeter.parentElement.dataset.value = "max";
      break;

    case meterValue > 50 && meterValue <= MAX_METER_VALUE - 1:
      powerMeter.parentElement.dataset.value = "high";
      break;

    case meterValue > 25 && meterValue <= 50:
      powerMeter.parentElement.dataset.value = "optimum";
      break;

    case meterValue >= 0 && meterValue <= 25:
    default:
      powerMeter.parentElement.dataset.value = "low";
      break;
  }

  if (meterValue === MAX_METER_VALUE) {
    playSoundEffect(powerUpAudio);
    showComment("Power Up!", "power-up");
    const a = window.setInterval(() => {
      meterIsDraining = true;
      equippedPowerBtn.removeAttribute("style");
      equippedPowerBtn.removeAttribute("disabled");
      equippedPowerBtn.classList.toggle("max-power", true);
      document.body.classList.toggle("power-up", true);
      updatePowerMeter(-1 * meterDrainRate, true);

      if (meterValue <= 0) {
        clearInterval(a);
        meterIsDraining = false;
        nextActivePowerTime *= 2;
        disablePowerAction();
        equippedPowerBtn.classList.toggle("max-power", false);
        document.body.classList.toggle("power-up", false);
      }
    }, 300);
  }

  powerMeter.style.height = `${meterValue}%`;
}

function updateScoreBoard(_gems = 0, _points = 0) {
  _gems = _gems ?? gems;
  _points = _points ?? points;
  document.getElementById("level-indicator").children[1].children[0].innerHTML =
    `<small>💰</small> ${convertToStandardFormat(
      _points,
    )} &nbsp; &nbsp; <small>💎</small> ${convertToStandardFormat(_gems)}`;

  gems = _gems;
  points = _points;

  localStorage.setItem("game_points", points);
  localStorage.setItem("game_gems", gems);
}

function getRevealDuration() {
  const duration = 3 + rank * 1.5;
  return duration;
}

function autoResizeCardBox(cardBox) {
  cardBox = cardBox ?? document.getElementById("card-box");
  const isOverflowingVertically = cardBox.clientHeight < cardBox.scrollHeight;

  let maxColumns;

  if (screenBreakpoint.matches) {
    // if screen is mobile
    maxColumns = 3;
  } else {
    // if screen is laptop
    maxColumns = 6;
  }

  const extraColumn = isOverflowingVertically ? 1 : 0;
  const gridCellCount =
    Math.ceil(Math.sqrt(cardBox.children.length)) + extraColumn;

  cardBox.style.gridTemplateRows = `repeat(auto-fill, 1fr)`;
  cardBox.style.gridTemplateColumns = `repeat(${
    gridCellCount <= maxColumns
      ? Math.min(gridCellCount, maxColumns)
      : "auto-fit"
  }, 1fr)`;
}

function autoScroll() {
  const container = document.getElementById("card-box");
  // Get the current scroll position
  let currentScroll = 0;
  container.scrollTo(0, 0);

  // Set the scrolling interval
  let scrollInterval = setInterval(function () {
    // Increment the current scroll position
    currentScroll += 200;
    container.scrollTo(0, currentScroll);

    // Check if the bottom of the page has been reached
    if (currentScroll >= document.body.scrollHeight) {
      // Clear the interval and stop scrolling
      clearInterval(scrollInterval);
      container.scrollTo(0, 0);
    }
  }, 1000);
}

function generateMap() {
  mapStarted = false;
  renderMap(document.getElementById("level-box"), { level, highestLevel });
  autoResizeCardBox(document.getElementById("level-box"));
}

function generateCards() {
  const types = getCardTypes(cardCount, pairCount, level);
  const cardBox = document.getElementById("card-box");
  populateCardGrid(cardBox, types, "card");
  autoResizeCardBox();
}

function resetRoundState() {
  cardClicks = 0;
  meterValue = 0;
  currentMatches = [];
  numberOfPairsMatched = 0;
  comboMultiplier = 0;
  meterIsDraining = false;
  gameTimer.reset();
  updatePowerMeter(0);
}

function runLevelIntro() {
  const isRankingLevel = level % RANK_LEVEL_COUNT === 0;
  const cardsUnlocked = Object.entries(cardTypes).filter(([, typeOption]) => {
    return typeOption.unlocksAt === level;
  });
  const revealDuration = getRevealDuration();

  if (isRankingLevel) {
    showLevelInfo(
      "Boss Level!",
      () => {
        peekAllCards(revealDuration, () => gameTimer.start("peek"));
      },
      "intro",
    );
  } else if (cardsUnlocked.length > 0) {
    showCardUnlockedInfo("New Cards Unlocked!", cardsUnlocked, () => {
      gameTimer.pause("unlocked");
      peekAllCards(revealDuration, () => gameTimer.start("peek"));
    });
  } else {
    peekAllCards(revealDuration, () => gameTimer.start());
  }
}

function setGameScene(_level = level) {
  if (_level >= highestLevel) {
    localStorage.setItem("game_level", _level);
  }
  cardClicks = 0;
  meterValue = 0;
  currentMatches = [];
  nextActivePowerTime = 30;
  comboMultiplier = 0;
  meterDrainRate = 0.6;
  meterIsDraining = false;
  numberOfPairsMatched = 0;
  rank =
    _level % RANK_LEVEL_COUNT === 0 ? Math.trunc(_level / RANK_LEVEL_COUNT) : 0;
  pairCount = Math.min(4, rank + 2);

  let repeatSeq = 2;
  let fnCardCount = Math.floor((_level + (repeatSeq - 1)) / repeatSeq) + 1; // Generates a sequence (2, 2, 3, 3, 4, 4) given (1, 2, 3, 4, 5)
  cardCount = Math.min(fnCardCount * pairCount, MAX_CARD_COUNT);

  // console.log({ rank, _level, fnCardCount, cardCount, pairCount });

  const bgLevel = rank + 1;
  const newStyleClass = `l-${bgLevel}`;
  const body = document.body;
  body.classList.toggle(newStyleClass, true);

  document.getElementById(
    "level-indicator",
  ).children[0].children[0].textContent = `Lv ${_level}`;

  updateScoreBoard(gems, points);
  updatePowerMeter(0);
  gameTimer.init();
}

function proceedToNextLevel() {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.innerHTML = "";
  dialog.removeAttribute("open");

  const bgLevel = rank + 1;
  const newStyleClass = `l-${bgLevel}`;
  document.body.classList.toggle(newStyleClass, false);

  // If this was a replayed level (below highest), return to map
  if (level < highestLevel) {
    window.location.hash = "map";
    level = highestLevel;
    generateMap();
    return;
  }

  level = level + 1;
  highestLevel = level;
  localStorage.setItem("game_level", level);
  localStorage.setItem("game_highest_level", highestLevel);

  showSplashScreen("play");
  setGameScene(level);
  generateCards();
  autoResizeCardBox();

  delay(9500, () => {
    const isRankingLevel = level % RANK_LEVEL_COUNT === 0;
    const cardsUnlocked = Object.entries(cardTypes).filter(([, typeOption]) => {
      return typeOption.unlocksAt === level;
    });
    const revealDuration = getRevealDuration();

    if (isRankingLevel) {
      showLevelInfo("Boss Level!", () =>
        peekAllCards(revealDuration, () => gameTimer.start("intro")),
      );
    } else if (cardsUnlocked.length > 0) {
      showCardUnlockedInfo("New Cards Unlocked!", cardsUnlocked, () => {
        peekAllCards(revealDuration, () => gameTimer.start("unlocked"));
      });
    } else peekAllCards(revealDuration, () => gameTimer.start());
  });
}

function checkWinStatus() {
  const commentary = document.querySelector("#commentary");
  const numberOfPairsAvailable = Math.floor(cardCount / pairCount);
  const hasWon = numberOfPairsMatched >= numberOfPairsAvailable;
  if (hasWon) {
    gameTimer.pause();
    const dialog = document.getElementById("win-badge-dialog");
    const text = document.createElement("h3");
    text.textContent = "You Won!";
    dialog.appendChild(text);

    delay(900, () => {
      playSoundEffect(winGameAudio);
      commentary.style.display = "none";
      commentary.textContent = "";
      dialog.setAttribute("open", true);

      delay(1000, () => {
        proceedToNextLevel();
      });
    });
  }
}

function handleCardClick(ev) {
  console.log("click card");
  cardClicks++;
  const delayForAnimation = 1200;
  const { decrement } = calculateMeterIncrementAndDecrement();

  // Takes 8 turnPoint for directionVector to become a negative
  const turnPoint = cardClicks / 2;
  const directionVector = getDirectionVector(turnPoint, 1, 1 / 3);

  const meterTapInc = decrement * (1.2 / pairCount) * directionVector;

  if (ev.target.dataset.opened === "false") {
    ev.target.dataset.opened = true;
    ev.target.classList.toggle("reveal", true);

    playSoundEffect(clickCardAudio);
    if (!meterIsDraining) updatePowerMeter(meterTapInc, true);

    currentMatches.push({
      id: ev.target.getAttribute("id"),
      category: ev.target.dataset.id,
    });

    if (currentMatches.length >= pairCount) {
      const selectedCards = currentMatches.slice(0, pairCount);
      const cardElements = selectedCards.map((cardInfo) =>
        document.getElementById(cardInfo.id),
      );

      const didCardsMatch = areCardsMatching(selectedCards);

      if (didCardsMatch) {
        delay(delayForAnimation - 500, () => {
          playSoundEffect(matchCardAudio);
          cardElements.forEach((card) => {
            card.classList.toggle("matched", true);
            card.classList.toggle("matched", true);
          });
          if (!meterIsDraining) updatePowerMeter(+1);
          updateScoreBoard(gems, points + 1 * Math.max(1, comboMultiplier));
          cardClicks = 0;
          if (Math.ceil(comboMultiplier / 1.5) % 2 === 0) {
            showComment(`Combo On Fire X${comboMultiplier}!`);
            updateScoreBoard(gems + 1 * Math.min(3, comboMultiplier), points);
          } else {
            showComment("Amazing!");
          }
        });

        comboMultiplier += 0.5;
        numberOfPairsMatched += 1;
        checkWinStatus();
      } else {
        delay(delayForAnimation, () => {
          // Cover matched cards
          cardElements.forEach((card) => {
            card.classList.toggle("reveal", false);
            card.dataset.opened = false;
          });

          playSoundEffect(closeCardAudio);
          if (!meterIsDraining) updatePowerMeter(-1);
        });

        comboMultiplier = 0;
      }

      // Remove card info from currentMatches array
      cardElements.forEach(() => {
        currentMatches.shift();
      });
    }
  }
  // console.log(currentMatches, numberOfPairsMatched, comboMultiplier);
}

function handleLevelMapClick(ev) {
  if (mapStarted) {
    return;
  }

  const selectedLevel = Number(ev.currentTarget.dataset.level);
  if (selectedLevel > highestLevel) {
    return;
  }

  mapStarted = true;
  playSoundEffect(clickButtonAudio);
  resetRoundState();
  level = selectedLevel;
  setGameScene(level);
  generateCards();
  autoResizeCardBox();
  window.location.hash = "play";
  runLevelIntro();
}

function disablePowerAction() {
  const equippedBtnId = powerActionTypes[equippedBtn].id;
  const equippedPowerBtn = document.querySelector(`main #${equippedBtnId}`);
  equippedPowerBtn.setAttribute("disabled", true);
  equippedPowerBtn.style.cursor = "wait";
  equippedPowerBtn.setAttribute(
    "title",
    `Next active in ${formatAsTime(nextActivePowerTime * 1000)}`,
  );

  delay(nextActivePowerTime * 1000, () => {
    equippedPowerBtn.removeAttribute("style");
    equippedPowerBtn.removeAttribute("disabled");
    nextActivePowerTime *= 2;
  });
}

function peekAllCards(duration = 2, onComplete = () => {}) {
  const peekBtn = document.querySelector("main #peek-a-boo");
  const unopenedCards = document.querySelectorAll(
    "#card-box > .card:not([data-opened='true'])",
  );
  if (!gameTimer.isPaused()) gameTimer.pause("peek");
  playSoundEffect(peekCardAudio);

  for (const card of unopenedCards) {
    card.classList.toggle("reveal", true);
  }

  autoScroll();

  if (meterIsDraining) {
    meterDrainRate *= 1.5;
  } else if (peekBtn) peekBtn.setAttribute("disabled", true);

  delay(duration * 1000, () => {
    // Close all revealed cards
    for (const card of unopenedCards) {
      card.classList.toggle("reveal", false);
      playSoundEffect(closeCardAudio);
    }

    if (!meterIsDraining) {
      disablePowerAction();
    }

    onComplete();
  });
}

function handleSoundEffectsToggle() {
  playSoundEffect(clickButtonAudio);
  localStorage.setItem("sound_effect_is_on", !canPlayEffects);
  loadSettings();
}

function loadSettings() {
  level = Number.parseInt(window.localStorage.getItem("game_level") ?? 1);
  highestLevel = Number.parseInt(
    window.localStorage.getItem("game_highest_level") ?? level,
  );
  points = Number.parseInt(window.localStorage.getItem("game_points") ?? 0);
  gems = Number.parseInt(window.localStorage.getItem("game_gems") ?? 0);
  canPlayEffects = JSON.parse(
    window.localStorage.getItem("sound_effect_is_on") ?? "true",
  );
  setSoundEffectsEnabled(canPlayEffects);
  // const audio = document.getElementById("bg-audio");
  // audio.muted = isMusicOn;
  // audio.paused = isMusicOn;
  // healthCount = parseInt(window.localStorage.getItem("game_health") ?? 4);
  setGameScene();
}

const peekABooEventHandler = (ev) => {
  playSoundEffect(clickButtonAudio);
  const duration = getRevealDuration();
  peekAllCards(duration, () => {
    gameTimer.start("peek");
  });
};

let listenersInitialized = false;
function setupListeners() {
  if (listenersInitialized) return;
  listenersInitialized = true;
  const resize = () => {
    autoResizeCardBox(document.getElementById("card-box"));
    autoResizeCardBox(document.getElementById("level-box"));
  };
  const startButton = document.querySelector("#main_menu button:first-child");
  if (level > 1 && startButton) startButton.textContent = "Continue Game";
  bindListeners({
    onStart: () => {
      playSoundEffect(clickButtonAudio);
      window.location.hash = "map";
      generateMap();
    },
    onQuit: () => {
      playSoundEffect(clickButtonAudio);
      resetGame();
    },
    onInfo: () => {
      playSoundEffect(clickButtonAudio);
      showLevelInfo();
    },
    onPower: peekABooEventHandler,
    onSoundToggle: handleSoundEffectsToggle,
    onMenu: () => {
      playSoundEffect(clickButtonAudio);
      showInGameMenu();
    },
    onCardClick: (event) => {
      if (event.target.closest(".card"))
        handleCardClick({ target: event.target.closest(".card") });
    },
    onMapClick: (event) => {
      const card = event.target.closest(".level-card");
      if (card) handleLevelMapClick({ currentTarget: card });
    },
    resize,
  });
}

function showSplashScreen(redirectTo = `main_menu`, animate = false) {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";
  window.location.hash = redirectTo;

  const leftCard = "#splash #logo-container .logo-card.left";
  const middleCard = "#splash #logo-container .logo-card.middle";
  const rightCard = "#splash #logo-container .logo-card.right";

  let tl = window.gsap.timeline();
  tl.from([middleCard, rightCard, leftCard], {
    opacity: 0,
    rotation: 0,
    scale: 0.5,
    duration: 2.5,
    ease: "elastic.out(1,0.3)",
    stagger: 0.3,
  });

  if (animate) {
    tl.from(
      "#splash #logo-container h1",
      {
        opacity: 0,
        letterSpacing: "55px",
        duration: 2,
        ease: "power2.in",
        ease: "back.out(1)",
        // ease: "bounce.out",
        // ease: "elastic.out(1,0.3)",
        // ease: "slow(0.7,0.7,false)",
        // ease: "expoScale(0.9,7,none)",
      },
      "-=1.5",
    );
  }

  tl.fromTo(
    "#splash p",
    {
      opacity: 0,
      duration: 1,
      yoyo: true,
      repeat: -1,
    },
    {
      opacity: 1,
      duration: 1,
      yoyo: true,
      repeat: -1,
    },
  );

  setupListeners();

  delay(9700, () => {
    document.querySelector("main").classList.toggle("not-started");
    splashScreen.style.display = "none";
  });
}

function resetGame() {
  const a = confirm(
    "Quitting will reset your progress so far, whould you like to continue?",
  );
  console.log(a);
  if (a === true) {
    localStorage.clear();
    window.location.reload();
  }
}

async function registerServiceWorker() {
  // console.log(window.location);
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker waiting");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(error);
    }
  }
}

function startGame(ev) {
  loadSettings();
  registerServiceWorker();
  showSplashScreen(undefined, true);
}

const gameTimer = createGameTimer({
  getDuration: () => getTimerDurationForLevel(),
  onTimeout: handleTimerTimeout,
});
const ui = createUI({
  getPairCount: () => pairCount,
  timer: gameTimer,
  playSound: () => playSoundEffect(clickButtonAudio),
});
const { showComment, showLevelInfo, showCardUnlockedInfo, showInGameMenu } = ui;

// The existing inline controls in index.html use these compatibility hooks.
window.playSoundEffect = playSoundEffect;
window.clickButtonAudio = clickButtonAudio;
window.showInGameMenu = showInGameMenu;
window.handleSoundEffectsToggle = handleSoundEffectsToggle;

document.addEventListener("DOMContentLoaded", startGame);
