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

function repeatArray(array, count) {
  let returnedArray = [];
  for (let i = 0; i < count; i += 1) {
    returnedArray = returnedArray.concat(array);
  }

  return returnedArray;
}

function removeRepeatingItems(array) {
  const uniqueArray = Array.from(new Set(array));
  console.log(uniqueArray);
  return uniqueArray;
}

function formatAsTime(milliseconds) {
  const aSecond = 1000;
  const aMinute = 60 * aSecond;
  const anHour = 60 * aMinute;
  const aDay = 24 * anHour;

  let unit = '';
  let retValue = '';

  switch (true) {
    case milliseconds >= anHour && milliseconds < aDay:
      retValue = milliseconds / anHour;
      unit = 'h';
      break;

    case milliseconds >= aMinute && milliseconds < anHour:
      retValue = milliseconds / aMinute;
      unit = 'm';
      break;

    case milliseconds < aSecond:
      retValue = milliseconds;
      unit = 'ms';
      break;

    case milliseconds >= aSecond && milliseconds < aMinute:
    default:
      retValue = milliseconds / aSecond;
      unit = 's';
      break;
  }

  return `${retValue}${unit}`;
}

// const s = [];
// s["idle"] = { loc: [] };
// s["jump"] = { loc: [] };
// console.log(s["jump"]);
