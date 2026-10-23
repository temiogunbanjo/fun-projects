export function setupListeners({
  onStart,
  onQuit,
  onInfo,
  onPower,
  onSoundToggle,
  onMenu,
  onCardClick,
  onMapClick,
  resize,
}) {
  const start = document.querySelector("#main_menu button:first-child");
  const quit = document.querySelector("#main_menu button:last-child");
  const info = document.querySelector("main #info");
  const power = document.querySelector("main #peek-a-boo");
  if (start) start.addEventListener("click", onStart);
  if (quit) quit.addEventListener("click", onQuit);
  if (info) info.addEventListener("click", onInfo);
  if (power) power.addEventListener("click", onPower);

  const soundToggle = document.querySelector(
    '#settings [data-action="sound-toggle"]',
  );
  soundToggle?.addEventListener("click", onSoundToggle);
  document
    .getElementById("show-menu-mobile")
    ?.addEventListener("click", onMenu);
  document.getElementById("card-box")?.addEventListener("click", onCardClick);
  document.getElementById("level-box")?.addEventListener("click", onMapClick);

  window.addEventListener("resize", resize);
  window.matchMedia("(max-width: 600px)").addEventListener("change", resize);
}
