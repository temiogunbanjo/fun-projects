const RANK_LEVEL_COUNT = 11;
const MAX_CARD_COUNT = 24;
let level = 1;
let pairCount = 2;
let cardCount = pairCount * 2;
let numberOfPairsMatched = 0;
let currentMatches = [];
let canPlayEffects = true;
let nextRevealTime = 30;
const screenBreakpoint = window.matchMedia("(max-width: 600px)");

let cardTypes = {
  bread: {
    image: "./assets/bread-i8k.png",
  },
  strawberry: {
    image: "./assets/strawberry_PNG2587.png",
  },
  furniture: {
    image:
      "./assets/ai-generated-armchair-furniture-isolated-on-transparent-background-free-png.webp",
  },
  sneakers: {
    image:
      "./assets/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png",
  },
  guava: {
    image: "./assets/pngimg.com - guava_PNG18.png",
  },
  shoes: {
    image: "./assets/pngimg.com - men_shoes_PNG7492.png",
  },
  pineapple: {
    image: "./assets/pngimg.com - pineapple_PNG2733.webp",
  },
  vehicles: {
    image: "./assets/land-rover-range-rover-car-png-25.png",
  },
  places: {
    image: "./assets/japan-famous-landmark-png.webp",
  },
};

const clickCardAudio = new Audio("./assets/audio/swish-sound-94707.mp3");
const peekCardAudio = new Audio("./assets/audio/wistful-1-39105.mp3");
const closeCardAudio = new Audio("./assets/audio/funny-swish-101878.mp3");
const winGameAudio = new Audio(
  "./assets/audio/level-up-bonus-sequence-3-186892.mp3"
);
const matchCardAudio = new Audio("./assets/audio/collect-points-190037.mp3");

function getCardTypes() {
  const numberOfPairsNeeded = Math.floor(cardCount / pairCount);
  let availableTypes = randomizeArray(Object.keys(cardTypes));

  let tSliced = availableTypes;

  if (availableTypes.length >= numberOfPairsNeeded) {
    tSliced = availableTypes.slice(0, numberOfPairsNeeded);
  } else {
    let remainingCount = numberOfPairsNeeded - availableTypes.length;
    let nextIndex = 0;
    let breakCount = 0;

    while (remainingCount-- > 0 && breakCount < 100) {
      tSliced.push(availableTypes[nextIndex]);
      nextIndex = nextIndex + 1 >= availableTypes.length ? 0 : nextIndex + 1;
      breakCount += 1;

      console.log({ breakCount, remainingCount });
    }
  }

  tSliced = randomizeArray(repeatArray(tSliced, pairCount));

  console.log(tSliced, numberOfPairsNeeded);

  return tSliced;
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
  const gridCellCount = Math.ceil(Math.sqrt(cardCount)) + extraColumn;

  cardBox.style.gridTemplateRows = `repeat(auto-fill, 1fr)`;
  cardBox.style.gridTemplateColumns = `repeat(${
    gridCellCount <= maxColumns
      ? Math.min(gridCellCount, maxColumns)
      : "auto-fit"
  }, 1fr)`;
}

function generateCards() {
  const cardBox = document.getElementById("card-box");
  cardBox.innerHTML = "";

  const generatedTypes = getCardTypes();

  for (let i = 0; i < cardCount; i += 1) {
    const type = generatedTypes[i];
    const typeOption = cardTypes[type];
    // <button class="card reveal" data-opened="true"></button>
    const cardElement = document.createElement("button");
    cardElement.setAttribute("class", "card");
    cardElement.setAttribute("id", `card-${i}`);
    cardElement.setAttribute("data-id", `card-${type}`);
    cardElement.setAttribute("data-opened", false);
    cardElement.setAttribute(
      "style",
      `--reveal-image: url('${typeOption.image}')`
    );

    cardBox.appendChild(cardElement);
  }

  autoResizeCardBox();
}

function showLevelInfo(title) {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dialog.innerHTML = "";

  const about = `The goal of this level is to match each card type on the board in ${
    pairCount > 2 ? `sets of ${pairCount}s` : "pairs"
  }. You can click on a card to reveal what is behind it. Good luck!`;

  const wrapper = document.createElement("div");
  const heading = document.createElement("h2");
  const text = document.createElement("p");
  const button = document.createElement("button");

  button.classList.add("game-style");

  heading.textContent = title ?? "About Level";
  text.textContent = about;
  button.textContent = "Close";

  wrapper.setAttribute("id", "level-info");
  heading.style.margin = 0;

  button.addEventListener("click", () => {
    dialog.removeAttribute("style");
    dialog.removeAttribute("open", true);
    dialog.innerHTML = "";
  });

  wrapper.appendChild(heading);
  wrapper.appendChild(text);
  wrapper.appendChild(button);

  dialog.appendChild(wrapper);
  dialog.setAttribute("open", true);
}

function showInGameMenu() {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dialog.innerHTML = "";

  const wrapper = document.createElement("div");
  const heading = document.createElement("h2");
  const buttonWrapper = document.createElement("div");
  const button1 = document.createElement("button");
  const button2 = document.createElement("button");

  button1.classList.add("game-style");
  button2.classList.add("game-style");

  heading.textContent = "Game Menu";
  button1.textContent = "Resume game";
  button2.textContent = "Level Info";

  wrapper.setAttribute("id", "level-info");
  wrapper.style.minHeight=  "300px";
  wrapper.style.gap = "20px";
  wrapper.style.paddingBottom = "40px";
  wrapper.classList.add("game-border");

  heading.style.margin = 0;

  buttonWrapper.classList.add("center");
  buttonWrapper.style.flexDirection = "column";
  buttonWrapper.style.alignItems = "stretch";
  buttonWrapper.style.gap = "18px";

  button1.addEventListener("click", () => {
    dialog.removeAttribute("style");
    dialog.removeAttribute("open", true);
    dialog.innerHTML = "";
  });

  button2.addEventListener("click", () => {
    showLevelInfo();
  });

  buttonWrapper.appendChild(button1);
  buttonWrapper.appendChild(button2);

  wrapper.appendChild(heading);
  wrapper.appendChild(buttonWrapper);

  dialog.appendChild(wrapper);
  dialog.setAttribute("open", true);
}

function setGameLevel(_level = level) {
  localStorage.setItem("game_level", _level);
  const rank = Math.trunc(_level / RANK_LEVEL_COUNT);

  pairCount = rank + 2 > 4 ? 4 : rank + 2;
  cardCount =
    level < RANK_LEVEL_COUNT ? (_level + 1) * pairCount : MAX_CARD_COUNT;

  const bgLevel = rank + 1;
  const newStyleClass = `l-${bgLevel}`;
  const oldStyleClass = `l-${bgLevel - 1}`;
  const body = document.body;

  document.getElementById(
    "level-indicator"
  ).children[0].textContent = `Lv ${_level}`;
  document.getElementById("level-indicator").children[1].textContent = `CITY`;

  body.classList.toggle(newStyleClass, true);
  body.classList.toggle(oldStyleClass, false);

  console.log(bgLevel);
}

function proceedToNextLevel() {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.innerHTML = "";
  dialog.removeAttribute("open");

  level = level + 1;
  numberOfPairsMatched = 0;
  currentMatches = [];
  nextRevealTime = 30;

  showSplashScreen("play");
  setGameLevel(level);
  generateCards();
  autoResizeCardBox();

  delay(9500, () => {
    const isRankingLevel = level % RANK_LEVEL_COUNT === 0;
    if (isRankingLevel) showLevelInfo("Difficulty Increased!");
    peekAllCards(3);
  });
}

function checkWinStatus() {
  const numberOfPairsAvailable = Math.floor(cardCount / pairCount);
  const hasWon = numberOfPairsMatched >= numberOfPairsAvailable;
  if (hasWon) {
    const dialog = document.getElementById("win-badge-dialog");
    const text = document.createElement("h3");
    text.textContent = "You Won!";
    dialog.appendChild(text);

    delay(900, () => {
      playSoundEffect(winGameAudio);
      // winGameAudio.playbackRate = 0.5
      dialog.setAttribute("open", true);

      delay(1000, () => {
        proceedToNextLevel();
      });
    });
    // alert(hasWon);
  }
}

function handleCardClick(ev) {
  const delayForAnimation = 1200;

  if (ev.target.getAttribute("data-opened") === "false") {
    ev.target.setAttribute("data-opened", true);
    ev.target.classList.toggle("reveal", true);

    playSoundEffect(clickCardAudio);

    currentMatches.push({
      id: ev.target.getAttribute("id"),
      category: ev.target.getAttribute("data-id"),
    });

    if (currentMatches.length >= pairCount) {
      const didCardsMatch =
        removeRepeatingItems(
          currentMatches
            .slice(0, pairCount)
            .map((cardInfo) => cardInfo.category)
        ).length === 1;
      // .reduce((prevCardInfo, currentCardInfo) => {
      //   return prevCardInfo.category === currentCardInfo.category;
      // });

      const cardElements = currentMatches
        .slice(0, pairCount)
        .map((cardInfo) => document.getElementById(cardInfo.id));

      if (!didCardsMatch) {
        window.setTimeout(() => {
          // Cover matched cards
          cardElements.forEach((card) => {
            card.classList.toggle("reveal", false);
            card.setAttribute("data-opened", false);
          });

          playSoundEffect(closeCardAudio);
        }, delayForAnimation);
      } else {
        window.setTimeout(() => {
          playSoundEffect(matchCardAudio);
          cardElements.forEach((card) => {
            card.classList.toggle("matched", true);
            card.classList.toggle("matched", true);
          });
        }, delayForAnimation - 500);

        numberOfPairsMatched += 1;
        checkWinStatus();
      }

      cardElements.forEach(() => {
        currentMatches.shift();
      });
    }

    console.log(currentMatches, numberOfPairsMatched);
  }
}

function peekAllCards(duration = 2) {
  // const cardBox = document.getElementById("card-box");
  const unopenedCards = document.querySelectorAll(
    "#card-box > .card:not([data-opened='true'])"
  );
  for (const card of unopenedCards) {
    card.classList.toggle("reveal", true);
  }

  playSoundEffect(peekCardAudio);

  window.setTimeout(() => {
    // Close all revealed cards
    for (const card of unopenedCards) {
      card.classList.toggle("reveal", false);
      playSoundEffect(closeCardAudio);
    }

    const peekBtn = document.querySelector("main #peek-a-boo");
    peekBtn.setAttribute("disabled", true);
    peekBtn.style.cursor = "wait";
    peekBtn.setAttribute("title", `Reveal in ${nextRevealTime}s`);

    window.setTimeout(() => {
      peekBtn.removeAttribute("style");
      peekBtn.removeAttribute("disabled");
      nextRevealTime *= 2;
    }, nextRevealTime * 1000);
  }, duration * 1000);
}

function playSoundEffect(audio) {
  if (canPlayEffects) {
    audio.play();
  }
}

function toggleSoundEffects() {
  console.log(canPlayEffects);
  localStorage.setItem("sound_effect_is_on", !canPlayEffects);
  loadSettings();
}

function loadSettings() {
  level = parseInt(window.localStorage.getItem("game_level") ?? 1);
  canPlayEffects = JSON.parse(
    window.localStorage.getItem("sound_effect_is_on") ?? "true"
  );
  // const audio = document.getElementById("bg-audio");
  // audio.muted = isMusicOn;
  // audio.paused = isMusicOn;
  // healthCount = parseInt(window.localStorage.getItem("game_health") ?? 4);
  setGameLevel();
}

function setupListeners() {
  const cardBox = document.getElementById("card-box");
  const peekBtn = document.querySelector("main #peek-a-boo");
  const infoBtn = document.querySelector("main #info");
  const startGameButton = document.querySelector(
    "#main_menu button:first-child"
  );
  const quitGameButton = document.querySelector("#main_menu button:last-child");

  if (level > 1) {
    startGameButton.textContent = "Continue Game";
  }

  window.addEventListener("resize", function () {
    console.log("resizing");
    autoResizeCardBox();
  });

  screenBreakpoint.addEventListener("change", function () {
    autoResizeCardBox();
  });

  peekBtn.addEventListener("click", (ev) => peekAllCards(3));
  infoBtn.addEventListener("click", (ev) => {
    showLevelInfo();
  });

  startGameButton.addEventListener("click", (ev) => {
    window.location.hash = "play";
    peekAllCards(3);
    autoResizeCardBox();
  });

  quitGameButton.addEventListener("click", (ev) => {
    resetGame();
  });

  for (const card of cardBox.children) {
    card.addEventListener("click", handleCardClick);
  }
}

function showSplashScreen(redirectTo = `main_menu`) {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";
  window.location.hash = redirectTo;

  window.setTimeout(() => {
    document.querySelector("main").classList.toggle("not-started");
    setupListeners();
    splashScreen.style.display = "none";
  }, 9700);
}

function resetGame() {
  const a = confirm(
    "Quitting will reset your progress so far, whould you like to continue?"
  );
  console.log(a);
  if (a === true) {
    localStorage.clear();
    window.location.reload();
  }
}

function startGame(ev) {
  loadSettings();
  generateCards();
  showSplashScreen();
}

document.addEventListener("DOMContentLoaded", startGame);
