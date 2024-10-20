const RANK_LEVEL_COUNT = 22;
const MAX_CARD_COUNT = 24;
const MAX_METER_VALUE = 100;
const MIN_METER_VALUE = 0;
let level = 1;
let rank = 0;
let gems = 0;
let points = 0;
let pairCount = 2;
let cardClicks = 0;
let cardCount = pairCount * 2;
let numberOfPairsMatched = 0;
let currentMatches = [];
let canPlayEffects = true;
let nextRevealTime = 15;
let meterValue = 0;
let meterDrainRate = 0.6;
let meterIsDraining = false;
let comboMultiplier = 0;
const screenBreakpoint = window.matchMedia("(max-width: 600px)");

// 1, 1, 2, 3, 5, 8, 13, 21, 33, 54, 87, 141
let cardTypes = {
  bread: {
    image: "./assets/bread-i8k.png",
    unlocksAt: 1,
    description: "",
  },
  strawberry: {
    image: "./assets/strawberry_PNG2587.png",
    unlocksAt: 1,
    description: "",
  },
  vehicles: {
    image: "./assets/land-rover-range-rover-car-png-25.png",
    unlocksAt: 5,
    description: "",
  },
  places: {
    image: "./assets/japan-famous-landmark-png.webp",
    unlocksAt: 13,
    description: "",
  },
  sneakers: {
    image:
      "./assets/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png",
    unlocksAt: 21,
    description: "",
  },
  guava: {
    image: "./assets/pngimg.com - guava_PNG18.png",
    unlocksAt: 29,
    description: "",
  },
  furniture: {
    image:
      "./assets/ai-generated-armchair-furniture-isolated-on-transparent-background-free-png.webp",
    unlocksAt: 29,
    description: "",
  },
  shoes: {
    image: "./assets/pngimg.com - men_shoes_PNG7492.png",
    unlocksAt: 29,
    description: "",
  },
  pineapple: {
    image: "./assets/pngimg.com - pineapple_PNG2733.webp",
    unlocksAt: 33,
    description: "",
  },
  banana: {
    image: "./assets/Banana-Stack-PNG.png",
    unlocksAt: 2,
    description: "",
  },
  sapphire: {
    image:
      "./assets/ai-generated-blue-gem-stone-isolated-on-transparent-background-png.webp",
    unlocksAt: 38,
    description: "",
  },
  ruby: {
    image: "./assets/Gem-PNG-Download-Image.png",
    unlocksAt: 38,
    description: "",
  },
};

const peekCardAudio = new Audio("./assets/audio/wistful-1-39105.mp3");
const clickCardAudio = new Audio("./assets/audio/swish-sound-94707.mp3");
const clickButtonAudio = new Audio(
  "./assets/audio/analog-appliance-button-2-185277.mp3"
);
const closeCardAudio = new Audio("./assets/audio/funny-swish-101878.mp3");
// const matchCardAudio = new Audio("./assets/audio/collect-points-190037.mp3");
const matchCardAudio = new Audio("./assets/audio/marimba-bloop-2-188149.mp3");
const powerUpAudio = new Audio(
  "./assets/audio/ui-beep-menu-positive-228336.mp3"
);
const winGameAudio = new Audio(
  "./assets/audio/level-up-bonus-sequence-3-186892.mp3"
);

function playSoundEffect(audio) {
  if (canPlayEffects) {
    audio.play();
  }
}

function showComment(comment, styleClass = "") {
  const commentary = document.querySelector("#commentary");
  commentary.style.display = "inline";
  // console.log(comment);

  const id = `comment-${Math.random().toString().slice(2)}`;
  const text = document.createElement("span");
  text.setAttribute("id", id);
  if (styleClass) text.classList.add(styleClass);
  text.textContent = comment;
  commentary.appendChild(text);

  switch (true) {
    case styleClass === "power-up":
      gsap.fromTo(
        text,
        {
          duration: 1,
          opacity: 0.6,
          xPercent: 0,
          yPercent: -50,
        },
        {
          duration: 1,
          top: "-40vh",
          opacity: 0,
          xPercent: 0,
          yPercent: -50,
          // arrow functions are handy for concise callbacks
          onComplete: () => {
            delay(0.9 * 1000, () => {
              try {
                // hide commentary
                commentary.style.display = "none";
                commentary.removeChild(text);
              } catch (error) {
                console.log(error);
              }
            });
          },
        }
      );
      break;

    default:
      gsap.fromTo(
        text,
        {
          duration: 1,
          opacity: 0.6,
          xPercent: -50,
          yPercent: -50,
        },
        {
          duration: 1,
          top: "-40vh",
          opacity: 0,
          xPercent: -50,
          yPercent: -50,
          // arrow functions are handy for concise callbacks
          onComplete: () => {
            try {
              // hide commentary
              commentary.style.display = "none";
              commentary.removeChild(text);
            } catch (error) {
              console.log(error);
            }
          },
        }
      );
      break;
  }
}

function calculateMeterIncrementAndDecrement() {
  const meterIncrement = Math.floor(
    (1 / (level + 1)) * (MAX_METER_VALUE * (1 + comboMultiplier))
  );
  const meterDecrement = Math.floor((1 / (level + 1)) * MAX_METER_VALUE) * 1.2;

  return {
    increment: meterIncrement,
    decrement: meterDecrement,
  };
}

function updatePowerMeter(direction = 0, useDirectionAsIncrement = false) {
  const powerMeter = document.querySelector("#power-meter > *:first-child");
  const peekBtn = document.querySelector("main #peek-a-boo");
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
      powerMeter.parentElement.setAttribute("data-value", "max");
      break;

    case meterValue > 50 && meterValue <= MAX_METER_VALUE - 1:
      powerMeter.parentElement.setAttribute("data-value", "high");
      break;

    case meterValue > 25 && meterValue <= 50:
      powerMeter.parentElement.setAttribute("data-value", "optimum");
      break;

    case meterValue >= 0 && meterValue <= 25:
    default:
      powerMeter.parentElement.setAttribute("data-value", "low");
      break;
  }

  if (meterValue === MAX_METER_VALUE) {
    playSoundEffect(powerUpAudio);
    showComment("Power Up!", "power-up");
    const a = window.setInterval(() => {
      meterIsDraining = true;
      peekBtn.removeAttribute("style");
      peekBtn.removeAttribute("disabled");
      peekBtn.classList.toggle("max-power", true);
      document.body.classList.toggle("power-up", true);
      updatePowerMeter(-1 * meterDrainRate, true);

      if (meterValue <= 0) {
        clearInterval(a);
        meterIsDraining = false;
        nextRevealTime *= 2;
        disableReveal();
        peekBtn.classList.toggle("max-power", false);
        document.body.classList.toggle("power-up", false);
      }
    }, 300);
  }

  powerMeter.style.height = `${meterValue}%`;
}

function updateScoreBoard(_gems = 0, _points = 0) {
  _gems = _gems ?? gems;
  _points = _points ?? points;
  document.getElementById(
    "level-indicator"
  ).children[1].children[0].innerHTML = `<small>💰</small> ${convertToStandardFormat(
    _points
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

function getCardTypes() {
  const numberOfPairsNeeded = Math.floor(cardCount / pairCount);
  let availableTypes = randomizeArray(
    Object.entries(cardTypes)
      .filter(([type, typeOption]) => {
        return typeOption.unlocksAt <= level;
      })
      .map(([type]) => {
        return type;
      })
  );

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
    }
  }

  tSliced = randomizeArray(repeatArray(tSliced, pairCount));
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

function showLevelInfo(title, callback = () => {}) {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dialog.innerHTML = "";

  const about = `The goal of this level is to match each card type in ${
    pairCount > 2 ? `sets of ${pairCount}s` : "pairs"
  } until every set has been matched. There are various card types, and each type appears in multiples of ${pairCount}. To successfully match a set, you must reveal and match all ${pairCount} cards of the same type consecutively. Good luck!`;

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
    playSoundEffect(clickButtonAudio);
    dialog.removeAttribute("style");
    dialog.removeAttribute("open", true);
    dialog.innerHTML = "";
    callback();
  });

  wrapper.appendChild(heading);
  wrapper.appendChild(text);
  wrapper.appendChild(button);

  dialog.appendChild(wrapper);
  dialog.setAttribute("open", true);
}

function showCardUnlockedInfo(title, cardsUnlocked, callback) {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dialog.innerHTML = "";

  const wrapper = document.createElement("div");
  const heading = document.createElement("h2");
  const cardBox = document.createElement("div");
  const button = document.createElement("button");

  button.classList.add("game-style");
  cardBox.classList.add("center");

  heading.textContent = title ?? "New Cards Unlocked";
  button.textContent = "Continue";

  wrapper.setAttribute("id", "level-info");

  heading.style.margin = 0;
  cardBox.style.gap = "10px";
  cardBox.style.margin = "1rem 0";
  cardBox.style.flexWrap = "wrap";

  button.addEventListener("click", () => {
    playSoundEffect(clickButtonAudio);
    dialog.removeAttribute("style");
    dialog.removeAttribute("open", true);
    dialog.innerHTML = "";
    callback();
  });

  cardsUnlocked.forEach(([type, typeOption]) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("style", `--image: url('${typeOption.image}');`);
    cardBox.appendChild(card);
  });

  wrapper.appendChild(heading);
  wrapper.appendChild(cardBox);
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
  const button3 = document.createElement("button");

  button1.classList.add("game-style");
  button2.classList.add("game-style");
  button3.classList.add("game-style", "variant-1");

  heading.textContent = "Game Menu";
  button2.textContent = "Level Info";
  button1.textContent = "Resume game";
  button3.textContent = "Back to Main menu";

  wrapper.setAttribute("id", "level-info");
  wrapper.style.minHeight = "300px";
  wrapper.style.gap = "20px";
  wrapper.style.paddingBottom = "40px";
  wrapper.classList.add("game-border");

  heading.style.margin = 0;

  buttonWrapper.classList.add("center");
  buttonWrapper.style.flexDirection = "column";
  buttonWrapper.style.alignItems = "stretch";
  buttonWrapper.style.gap = "18px";

  button1.addEventListener("click", () => {
    playSoundEffect(clickButtonAudio);
    dialog.removeAttribute("style");
    dialog.removeAttribute("open", true);
    dialog.innerHTML = "";
  });

  button2.addEventListener("click", () => {
    playSoundEffect(clickButtonAudio);
    showLevelInfo();
  });

  button3.addEventListener("click", () => {
    playSoundEffect(clickButtonAudio);
    window.location.reload();
  });

  buttonWrapper.appendChild(button1);
  buttonWrapper.appendChild(button2);
  buttonWrapper.appendChild(button3);

  wrapper.appendChild(heading);
  wrapper.appendChild(buttonWrapper);

  dialog.appendChild(wrapper);
  dialog.setAttribute("open", true);
}

function setGameScene(_level = level) {
  localStorage.setItem("game_level", _level);
  cardClicks = 0;
  meterValue = 0;
  currentMatches = [];
  nextRevealTime = 30;
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
    "level-indicator"
  ).children[0].children[0].textContent = `Lv ${_level}`;

  updateScoreBoard(gems, points);
  updatePowerMeter(0);
}

function proceedToNextLevel() {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.innerHTML = "";
  dialog.removeAttribute("open");

  const bgLevel = rank + 1;
  const newStyleClass = `l-${bgLevel}`;
  document.body.classList.toggle(newStyleClass, false);

  level = level + 1;

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
      showLevelInfo("Boss Level!", () => peekAllCards(revealDuration));
    } else if (cardsUnlocked.length > 0) {
      showCardUnlockedInfo("New Cards Unlocked!", cardsUnlocked, () => {
        peekAllCards(revealDuration);
      });
    } else peekAllCards(revealDuration);
  });
}

function checkWinStatus() {
  const commentary = document.querySelector("#commentary");
  const numberOfPairsAvailable = Math.floor(cardCount / pairCount);
  const hasWon = numberOfPairsMatched >= numberOfPairsAvailable;
  if (hasWon) {
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
  cardClicks++;
  const delayForAnimation = 1200;
  const { decrement } = calculateMeterIncrementAndDecrement();

  // Takes 8 turnPoint for directionVector to become a negative
  const turnPoint = cardClicks / 2;
  const directionVector = getDirectionVector(turnPoint, 1, 1 / 3);

  const meterTapInc = decrement * (1.2 / pairCount) * directionVector;

  if (ev.target.getAttribute("data-opened") === "false") {
    ev.target.setAttribute("data-opened", true);
    ev.target.classList.toggle("reveal", true);

    playSoundEffect(clickCardAudio);
    if (!meterIsDraining) updatePowerMeter(meterTapInc, true);

    currentMatches.push({
      id: ev.target.getAttribute("id"),
      category: ev.target.getAttribute("data-id"),
    });

    if (currentMatches.length >= pairCount) {
      const selectedCards = currentMatches.slice(0, pairCount);
      const cardElements = selectedCards.map((cardInfo) =>
        document.getElementById(cardInfo.id)
      );

      const didCardsMatch =
        removeRepeatingItems(selectedCards.map((cardInfo) => cardInfo.category))
          .length === 1;

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
            card.setAttribute("data-opened", false);
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
  console.log(currentMatches, numberOfPairsMatched, comboMultiplier);
}

function disableReveal() {
  const peekBtn = document.querySelector("main #peek-a-boo");
  peekBtn.setAttribute("disabled", true);
  peekBtn.style.cursor = "wait";
  peekBtn.setAttribute(
    "title",
    `Reveal in ${formatAsTime(nextRevealTime * 1000)}`
  );

  delay(nextRevealTime * 1000, () => {
    peekBtn.removeAttribute("style");
    peekBtn.removeAttribute("disabled");
    nextRevealTime *= 2;
  });
}

function peekAllCards(duration = 2) {
  const peekBtn = document.querySelector("main #peek-a-boo");
  const unopenedCards = document.querySelectorAll(
    "#card-box > .card:not([data-opened='true'])"
  );

  playSoundEffect(peekCardAudio);

  for (const card of unopenedCards) {
    card.classList.toggle("reveal", true);
  }

  autoScroll();

  if (!meterIsDraining) peekBtn.setAttribute("disabled", true);
  else meterDrainRate *= 1.5;

  delay(duration * 1000, () => {
    // Close all revealed cards
    for (const card of unopenedCards) {
      card.classList.toggle("reveal", false);
      playSoundEffect(closeCardAudio);
    }

    if (!meterIsDraining) {
      disableReveal();
    }
  });
}

function handleSoundEffectsToggle() {
  playSoundEffect(clickButtonAudio);
  localStorage.setItem("sound_effect_is_on", !canPlayEffects);
  loadSettings();
}

function loadSettings() {
  level = parseInt(window.localStorage.getItem("game_level") ?? 1);
  points = parseInt(window.localStorage.getItem("game_points") ?? 0);
  gems = parseInt(window.localStorage.getItem("game_gems") ?? 0);
  canPlayEffects = JSON.parse(
    window.localStorage.getItem("sound_effect_is_on") ?? "true"
  );
  // const audio = document.getElementById("bg-audio");
  // audio.muted = isMusicOn;
  // audio.paused = isMusicOn;
  // healthCount = parseInt(window.localStorage.getItem("game_health") ?? 4);
  setGameScene();
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
    autoResizeCardBox();
  });

  screenBreakpoint.addEventListener("change", function () {
    autoResizeCardBox();
  });

  peekBtn.addEventListener("click", (ev) => {
    playSoundEffect(clickButtonAudio);
    const duration = getRevealDuration();
    peekAllCards(duration);
  });

  infoBtn.addEventListener("click", (ev) => {
    playSoundEffect(clickButtonAudio);
    showLevelInfo();
  });

  startGameButton.addEventListener("click", (ev) => {
    playSoundEffect(clickButtonAudio);
    window.location.hash = "play";
    const duration = getRevealDuration();
    peekAllCards(duration);
    autoResizeCardBox();
  });

  quitGameButton.addEventListener("click", (ev) => {
    playSoundEffect(clickButtonAudio);
    resetGame();
  });

  for (const card of cardBox.children) {
    card.addEventListener("click", handleCardClick);
  }
}

function showSplashScreen(redirectTo = `main_menu`, animate = false) {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";
  window.location.hash = redirectTo;

  const leftCard = "#splash #logo-container .logo-card.left";
  const middleCard = "#splash #logo-container .logo-card.middle";
  const rightCard = "#splash #logo-container .logo-card.right";

  let tl = gsap.timeline();
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
      "-=1.5"
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
    }
  );

  delay(9700, () => {
    document.querySelector("main").classList.toggle("not-started");
    setupListeners();
    splashScreen.style.display = "none";
  });
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
  generateCards();
  registerServiceWorker();
  showSplashScreen(undefined, true);
}

document.addEventListener("DOMContentLoaded", startGame);
