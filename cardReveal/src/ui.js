import { delay } from "./utils.js";

export function createUI({ getPairCount, timer, playSound }) {
  function showComment(comment, styleClass = "") {
    const commentary = document.querySelector("#commentary");
    commentary.style.display = "inline";
    const text = document.createElement("span");
    text.id = `comment-${Math.random().toString().slice(2)}`;
    if (styleClass) text.classList.add(styleClass);
    text.textContent = comment;
    commentary.appendChild(text);
    window.gsap.fromTo(text, {
      duration: 1, opacity: 0.6, xPercent: styleClass === "power-up" ? 0 : -50, yPercent: -50,
    }, {
      duration: 1, top: "-40vh", opacity: 0, xPercent: styleClass === "power-up" ? 0 : -50, yPercent: -50,
      onComplete: () => delay(styleClass === "power-up" ? 900 : 0, () => {
        commentary.style.display = "none";
        text.remove();
      }),
    });
  }

  function closeDialog(dialog) {
    dialog.removeAttribute("style");
    dialog.removeAttribute("open");
    dialog.innerHTML = "";
  }

  function showLevelInfo(title, callback = () => {}, pausedBy = null) {
    const dialog = document.getElementById("win-badge-dialog");
    dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    dialog.innerHTML = "";
    timer.pause(pausedBy);
    const wrapper = document.createElement("div");
    const heading = document.createElement("h2");
    const text = document.createElement("p");
    const button = document.createElement("button");
    button.classList.add("game-style");
    heading.textContent = title ?? "About Level";
    text.textContent = `The goal of this level is to match each card type in ${getPairCount() > 2 ? `sets of ${getPairCount()}s` : "pairs"} until every set has been matched. There are various card types, and each type appears in multiples of ${getPairCount()}. To successfully match a set, you must reveal and match all ${getPairCount()} cards of the same type consecutively. Good luck!`;
    button.textContent = "Close";
    wrapper.id = "level-info";
    heading.style.margin = 0;
    button.addEventListener("click", () => {
      playSound(); closeDialog(dialog); timer.start(pausedBy); callback();
    });
    wrapper.append(heading, text, button);
    dialog.appendChild(wrapper);
    dialog.setAttribute("open", true);
  }

  function showCardUnlockedInfo(title, cardsUnlocked, callback) {
    const dialog = document.getElementById("win-badge-dialog");
    dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    dialog.innerHTML = "";
    timer.pause("unlocked");
    const wrapper = document.createElement("div");
    const heading = document.createElement("h2");
    const cardBox = document.createElement("div");
    const button = document.createElement("button");
    button.classList.add("game-style");
    cardBox.classList.add("center");
    heading.textContent = title ?? "New Cards Unlocked";
    button.textContent = "Continue";
    wrapper.id = "level-info";
    heading.style.margin = 0;
    cardBox.style.cssText = "gap: 10px; margin: 1rem 0; flex-wrap: wrap";
    button.addEventListener("click", () => { playSound(); closeDialog(dialog); callback(); });
    cardsUnlocked.forEach(([, option]) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.style.setProperty("--image", `url('${option.image}')`);
      cardBox.appendChild(card);
    });
    wrapper.append(heading, cardBox, button);
    dialog.appendChild(wrapper);
    dialog.setAttribute("open", true);
  }

  function showInGameMenu() {
    const dialog = document.getElementById("win-badge-dialog");
    dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    dialog.innerHTML = "";
    timer.pause("menu");
    const wrapper = document.createElement("div");
    const heading = document.createElement("h2");
    const buttonWrapper = document.createElement("div");
    const resume = document.createElement("button");
    const info = document.createElement("button");
    const quit = document.createElement("button");
    [resume, info, quit].forEach((button) => button.classList.add("game-style"));
    quit.classList.add("variant-1");
    heading.textContent = "Game Menu";
    resume.textContent = "Resume game";
    info.textContent = "Level Info";
    quit.textContent = "Back to Main menu";
    wrapper.id = "level-info";
    wrapper.classList.add("game-border");
    wrapper.style.cssText = "min-height: 300px; gap: 20px; padding-bottom: 40px";
    heading.style.margin = 0;
    buttonWrapper.classList.add("center");
    buttonWrapper.style.cssText = "flex-direction: column; align-items: stretch; gap: 18px";
    resume.addEventListener("click", () => { playSound(); closeDialog(dialog); timer.start("menu"); });
    info.addEventListener("click", () => { playSound(); showLevelInfo(undefined, undefined, "menu"); });
    quit.addEventListener("click", () => { playSound(); window.location.reload(); });
    buttonWrapper.append(resume, info, quit);
    wrapper.append(heading, buttonWrapper);
    dialog.appendChild(wrapper);
    dialog.setAttribute("open", true);
  }

  return { showComment, showLevelInfo, showCardUnlockedInfo, showInGameMenu };
}
