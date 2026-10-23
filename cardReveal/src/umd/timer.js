export function createGameTimer({ getDuration, onTimeout }) {
  let interval = null;
  let remaining = 0;
  let total = 0;
  let running = false;
  let pausedBy = null;

  function updateDisplay() {
    const progress = document.querySelector("#timer-count .time-progress > div");
    if (!progress) return;
    const percent = total > 0 ? (remaining / total) * 100 : 0;
    progress.style.width = `${percent}%`;
    progress.style.backgroundColor = percent > 50 ? "lawngreen" : percent > 25 ? "gold" : "red";
  }

  function init() {
    clearInterval(interval);
    running = false;
    total = getDuration();
    remaining = total;
    updateDisplay();
  }

  function start(resumeBy) {
    if (pausedBy && resumeBy && resumeBy !== pausedBy) return;
    if (running) return;
    running = true;
    updateDisplay();
    interval = window.setInterval(() => {
      remaining -= 0.1;
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        onTimeout();
      } else updateDisplay();
    }, 100);
    pausedBy = null;
  }

  function pause(reason) {
    clearInterval(interval);
    running = false;
    pausedBy = reason ?? null;
  }

  function reset() {
    pause();
    remaining = 0;
    total = 0;
    updateDisplay();
  }

  return { init, start, pause, reset, isPaused: () => Boolean(pausedBy) };
}
