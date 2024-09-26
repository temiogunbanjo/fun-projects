function chooseRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return { index: randomIndex, item: array[randomIndex] };
}

function delay(time, callback) {
  return window.setTimeout(() => callback(), time);
}