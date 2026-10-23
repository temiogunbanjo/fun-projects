import { MAX_MAP_LEVEL, RANK_LEVEL_COUNT } from "./config.js";

export function populateLevelGrid(container, { level, highestLevel }) {
  container.innerHTML = "";
  for (let number = 1; number <= MAX_MAP_LEVEL; number += 1) {
    const unlocked = number <= highestLevel;
    const boss = number % RANK_LEVEL_COUNT === 0;
    const completed = number < level && unlocked;
    const card = document.createElement("button");
    card.className = "level-card";
    card.dataset.level = number;
    if (!unlocked) { card.classList.add("locked"); card.disabled = true; }
    if (boss) card.classList.add("boss");
    if (completed) card.classList.add("completed");
    if (number === level && unlocked) card.classList.add("current");
    if (boss) {
      const icon = document.createElement("i");
      icon.classList.add("fa-solid", "fa-crown");
      card.appendChild(icon);
    }
    const label = document.createElement("span");
    label.classList.add("level-number");
    label.textContent = number;
    card.appendChild(label);
    if (!unlocked) {
      const icon = document.createElement("i");
      icon.classList.add("fa-solid", "fa-lock");
      card.appendChild(icon);
    }
    if (completed) {
      const stars = document.createElement("span");
      stars.classList.add("star-container");
      for (let star = 0; star < (boss ? 3 : 1); star += 1) {
        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-star");
        stars.appendChild(icon);
      }
      card.appendChild(stars);
    }
    container.appendChild(card);
  }
}

export function generateMap(container, state) {
  populateLevelGrid(container, state);
  const label = document.getElementById("map-level-label");
  if (label) label.textContent = "Select Level";
}
