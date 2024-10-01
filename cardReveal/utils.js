function chooseRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return { index: randomIndex, item: array[randomIndex] };
}

function delay(time, callback) {
  return window.setTimeout(callback, time);
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
  // console.log(uniqueArray);
  return uniqueArray;
}

function formatAsTime(milliseconds) {
  const aSecond = 1000;
  const aMinute = 60 * aSecond;
  const anHour = 60 * aMinute;
  const aDay = 24 * anHour;

  let unit = "";
  let retValue = 0;
  let remainder = 0;

  switch (true) {
    case milliseconds >= anHour && milliseconds < aDay:
      retValue = Math.trunc(milliseconds / anHour);
      remainder = milliseconds - retValue * anHour;
      unit = "h";
      break;

    case milliseconds >= aMinute && milliseconds < anHour:
      retValue = Math.trunc(milliseconds / aMinute);
      remainder = milliseconds - retValue * aMinute;
      unit = "m";
      break;

    case milliseconds < aSecond:
      retValue = Math.trunc(milliseconds);
      remainder = 0;
      unit = "ms";
      break;

    case milliseconds >= aSecond && milliseconds < aMinute:
    default:
      retValue = Math.trunc(milliseconds / aSecond);
      remainder = milliseconds - retValue * aSecond;
      unit = "s";
      break;
  }

  // console.log(retValue, remainder);

  if (remainder === 0) {
    return `${retValue}${unit}`;
  }

  return `${retValue}${unit}` + formatAsTime(remainder);
}

function numberWithCommas(number) {
  return number?.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function convertToStandardFormat(n) {
  // console.log(n);
  n = `${n}`.replace(/,/g, "");
  const isValidDigits = n.match(/^[0-9.]+$/gi) !== null;

  if (isValidDigits) {
    n = Math.round(Number(n));
    const numberOfDigits = `${n}`.length;
    // console.log("numberOfDigits", numberOfDigits);

    let newNumber = n;

    switch (true) {
      // 10,000 - 99,999 (Hundreds of Thousands)
      case numberOfDigits > 4 && numberOfDigits <= 5:
        newNumber = `${Number(n / 1e3).toFixed(2)} K`;
        n = newNumber;
        break;

      // 100,000 - 999,999 (Hundreds of Thousands)
      case numberOfDigits > 5 && numberOfDigits <= 6:
        newNumber = `${Number(n / 1e3).toFixed(2)} K`;
        n = newNumber;
        break;

      // 1,000,000 - 999,999,999 (Million)
      case numberOfDigits > 6 && numberOfDigits <= 9:
        newNumber = `${Number(n / 1e6).toFixed(2)} M`;
        n = newNumber;
        break;

      // 1,000,000,000 - 999,999,999,999 (Billion)
      case numberOfDigits > 9 && numberOfDigits <= 12:
        newNumber = `${Number(n / 1e9).toFixed(2)} B`;
        n = newNumber;
        break;

      // 1,000,000,000,000 - 999,999,999,999,999 (Trillion)
      case numberOfDigits > 12 && numberOfDigits <= 15:
        newNumber = `${Number(n / 1e12).toFixed(2)} T`;
        n = newNumber;
        break;

      // 1,000,000,000,000,000 - 999,999,999,999,999,999 (Quadrillion)
      case numberOfDigits > 15 && numberOfDigits <= 18:
        newNumber = `${Number(n / 1e15).toFixed(2)} aa`;
        n = newNumber;
        break;

      default:
        n = numberWithCommas(n);
        break;
    }
  }

  return n;
}

function getDirectionVector(
  angle,
  positiveRatio = 1,
  negativeRatio = 1,
  factorRatiosInDirection = true
) {
  const direction =
    Math.sin(angle * positiveRatio) + Math.sin(angle * negativeRatio);

  let unitDirection = direction / Math.abs(direction);

  if (factorRatiosInDirection) {
    unitDirection *= unitDirection >= 0 ? positiveRatio : negativeRatio;
  }

  return unitDirection;
}

// const a = [1, 2, 3, 4, 5, 6, 7, 8];
// let repeatSeq = 2;

// console.log(
//   a.map((l) => {
//     let fnCardCount = Math.floor((l + (repeatSeq - 1)) / repeatSeq) + 1;
//     return fnCardCount;
//   })
// );

// const s = [];
// s["idle"] = { loc: [] };
// s["jump"] = { loc: [] };
// console.log(s["jump"]);
