let numberOfMatches = 0;
let cardCount = 12;
let currentMatches = [];

function generateCards() {
  const cardBox = document.getElementById("card-box");
  cardBox.innerHTML = "";

  for (let i = 0; i < cardCount; i += 1) {
    // <button class="card reveal" data-opened="true"></button>
    // userInputs.push("");
    const cardElement = document.createElement("button");
    cardElement.setAttribute("class", "card");
    cardElement.setAttribute("id", `card-${i}`);
    cardElement.setAttribute("data-id", `card-${i % 2 === 0 ? "even" : "odd"}`);
    cardElement.setAttribute("data-opened", false);

    cardBox.appendChild(cardElement);
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

        numberOfMatches += 1;
      }

      currentMatches = [];
    }

    console.log(currentMatches, numberOfMatches);
  }
}

function peekAllCards(duration) {
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

function setupListeners() {
  const cardBox = document.getElementById("card-box");
  const peekBtn = document.querySelector("main > button");

  peekBtn.addEventListener("click", (ev) => peekAllCards(3.5));
  for (const card of cardBox.children) {
    card.addEventListener("click", handleCardClick);
  }
}

function showSplashScreen() {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";

  window.setTimeout(() => {
    document.querySelector("main").classList.toggle("not-started");
    splashScreen.style.display = "none";
    setupListeners();
  }, 9700);
}

function startGame(ev) {
  generateCards();
  showSplashScreen();
}

document.addEventListener("DOMContentLoaded", startGame);
