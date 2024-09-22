const RANK_LEVEL_COUNT = 10;
let cardCount = 4;
let level = 1;
let numberOfPairsMatched = 0;
let currentMatches = [];
const screenBreakpoint = window.matchMedia("(max-width: 600px)");

let cardTypes = {
  bread: {
    image: "./assets/bread-i8k.png",
  },
  fruit: {
    image: "./assets/strawberry_PNG2587.png",
  },
  sneakers: {
    image:
      "./assets/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png",
  },
  shoes: {
    image: "./assets/pngimg.com - men_shoes_PNG7492.png",
  },
  vehicles: {
    image: "./assets/land-rover-range-rover-car-png-25.png",
  },
  places: {
    image: "./assets/japan-famous-landmark-png.webp",
  },
};

function chooseRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return { index: randomIndex, item: array[randomIndex] };
}

function delay(time, callback) {
  return window.setTimeout(() => callback(), time);
}

/**
 *
 * @param {*[]} array
 * @returns
 */
function randomizeArray(array) {
  const retValue = [];
  let breakLoopCount = 0;

  while (retValue.length < array.length && breakLoopCount < 1000) {
    const { item, index: itemIndex } = chooseRandomItem(array);
    if (item !== null) {
      retValue.push(item);
      array[itemIndex] = null;
      breakLoopCount = 0;
    }

    breakLoopCount += 1;
  }

  // console.log({ breakLoopCount, retValue, array });
  return retValue;
}

function getCardTypes() {
  const numberOfPairsNeeded = Math.floor(cardCount / 2);
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

  tSliced = tSliced.concat(tSliced);
  tSliced = randomizeArray(tSliced);

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

  console.log(bgLevel);
}

function proceedToNextLevel() {
  const dialog = document.getElementById("win-badge-dialog");
  dialog.removeAttribute("open");

  level = level + 1;
  numberOfPairsMatched = 0;
  currentMatches = [];
  cardCount += 2;

  showSplashScreen("play");
  generateCards();
  autoResizeCardBox();
  setGameLevel(level);

  delay(9500, () => peekAllCards(3));
}

function checkWinStatus() {
  const numberOfPairsAvailable = Math.floor(cardCount / 2);
  const hasWon = numberOfPairsMatched >= numberOfPairsAvailable;
  if (hasWon) {
    const dialog = document.getElementById("win-badge-dialog");
    delay(900, () => {
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

    currentMatches.push({
      id: ev.target.getAttribute("id"),
      category: ev.target.getAttribute("data-id"),
    });

    if (currentMatches.length >= 2) {
      const [firstCardInfo, secondCardInfo] = currentMatches;
      const secondCard = ev.target;
      const firstCard = document.getElementById(firstCardInfo.id);

      if (firstCardInfo.category !== secondCardInfo.category) {
        // Cover second and first card
        window.setTimeout(() => {
          firstCard.classList.toggle("reveal", false);
          secondCard.classList.toggle("reveal", false);

          firstCard.setAttribute("data-opened", false);
          secondCard.setAttribute("data-opened", false);
        }, delayForAnimation);
      } else {
        window.setTimeout(() => {
          firstCard.classList.toggle("matched", true);
          secondCard.classList.toggle("matched", true);
        }, delayForAnimation - 500);

        numberOfPairsMatched += 1;
        checkWinStatus();
      }

      currentMatches = [];
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

  window.setTimeout(() => {
    for (const card of unopenedCards) {
      card.classList.toggle("reveal", false);
    }
  }, duration * 1000);
}

function loadSettings() {
  level = parseInt(window.localStorage.getItem("game_level") ?? 1);
  // const audio = document.getElementById("bg-audio");
  // audio.muted = isMusicOn;
  // audio.paused = isMusicOn;
  // healthCount = parseInt(window.localStorage.getItem("game_health") ?? 4);
  // const isMusicOn = JSON.parse(
  //   window.localStorage.getItem("bg_music_is_on") ?? "false"
  // );
  setGameLevel();
}

function setupListeners() {
  const cardBox = document.getElementById("card-box");
  const peekBtn = document.querySelector("main #peek-a-boo");
  const startGameButton = document.querySelector(
    "#main_menu button:first-child"
  );

  const aboutButton = document.querySelector("#main_menu button:nth-child(3)");

  window.addEventListener("resize", function () {
    console.log("resizing");
    autoResizeCardBox();
  });

  screenBreakpoint.addEventListener("change", function () {
    autoResizeCardBox();
  });

  peekBtn.addEventListener("click", (ev) => peekAllCards(2));
  startGameButton.addEventListener("click", (ev) => {
    window.location.hash = "play";
    peekAllCards(3);
    autoResizeCardBox();
  });

  aboutButton.addEventListener("click", (ev) => {
    window.location.hash = "about";
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

function startGame(ev) {
  generateCards();
  loadSettings();
  showSplashScreen();
}

document.addEventListener("DOMContentLoaded", startGame);
