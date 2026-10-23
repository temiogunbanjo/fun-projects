export function chooseRandomItem(array) {
  const index = Math.floor(Math.random() * array.length);
  return { index, item: array[index] };
}

export function delay(time, callback) {
  return window.setTimeout(callback, time);
}

export function randomizeArray(array) {
  const items = [...array];
  const result = [];
  while (items.length) {
    const index = Math.floor(Math.random() * items.length);
    result.push(items.splice(index, 1)[0]);
  }
  return result;
}

export function repeatArray(array, count) {
  return Array.from({ length: count }, () => array).flat();
}

export function removeRepeatingItems(array) {
  return Array.from(new Set(array));
}

export function formatAsTime(milliseconds) {
  const units = [[3_600_000, "h"], [60_000, "m"], [1_000, "s"]];
  for (const [size, suffix] of units) {
    if (milliseconds >= size) {
      const value = Math.trunc(milliseconds / size);
      const remainder = milliseconds - value * size;
      return `${value}${suffix}${remainder ? formatAsTime(remainder) : ""}`;
    }
  }
  return `${Math.trunc(milliseconds)}ms`;
}

export function numberWithCommas(number) {
  return number?.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function convertToStandardFormat(value) {
  let number = `${value}`.replace(/,/g, "");
  if (!/^[0-9.]+$/.test(number)) return value;
  number = Math.round(Number(number));
  const digits = `${number}`.length;
  const units = [[15, 1e15, "aa"], [12, 1e12, "T"], [9, 1e9, "B"], [6, 1e6, "M"], [4, 1e3, "K"]];
  const unit = units.find(([minDigits]) => digits > minDigits);
  return unit ? `${(number / unit[1]).toFixed(2)} ${unit[2]}` : numberWithCommas(number);
}

export function getDirectionVector(angle, positiveRatio = 1, negativeRatio = 1, factorRatiosInDirection = true) {
  const direction = Math.sin(angle * positiveRatio) + Math.sin(angle * negativeRatio);
  let unitDirection = direction / Math.abs(direction);
  if (factorRatiosInDirection) unitDirection *= unitDirection >= 0 ? positiveRatio : negativeRatio;
  return unitDirection;
}
