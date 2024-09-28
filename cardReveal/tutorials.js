function showTInfo(title) {
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

function tutor(callback, ...args) {
  const isTutorialDone = false;

  if (!isTutorialDone) {
    callback(...args);
  }
}
