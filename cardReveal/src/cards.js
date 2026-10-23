import { cardTypes } from "./minified/config.min.js";
import { randomizeArray, repeatArray } from "./minified/utils.min.js";

export function getCardTypes(cardCount, pairCount, level) {
  const numberOfPairsNeeded = Math.floor(cardCount / pairCount);
  const availableTypes = randomizeArray(Object.entries(cardTypes)
    .filter(([, option]) => option.unlocksAt <= level)
    .map(([type]) => type));
  let selected = availableTypes.slice(0, numberOfPairsNeeded);
  if (selected.length < numberOfPairsNeeded && availableTypes.length) {
    for (let index = 0; selected.length < numberOfPairsNeeded; index += 1) {
      selected.push(availableTypes[index % availableTypes.length]);
    }
  }
  return randomizeArray(repeatArray(selected, pairCount));
}

export function populateCardGrid(container, types, idPrefix = "card") {
  container.innerHTML = "";
  types.forEach((type, index) => {
    const card = document.createElement("button");
    card.className = "card";
    card.id = `${idPrefix}-${index}`;
    card.dataset.id = `card-${type}`;
    card.dataset.opened = false;
    card.style.setProperty("--reveal-image", `url('${cardTypes[type].image}')`);
    container.appendChild(card);
  });
}

export function areCardsMatching(cards) {
  return new Set(cards.map((card) => card.category)).size === 1;
}
