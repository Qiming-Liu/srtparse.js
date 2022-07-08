export const fixDigit = (how_many_digit, str, padEnd) => {
  if (padEnd === void 0) {
    padEnd = true;
  }
  if (str.length === how_many_digit) {
    return str;
  }
  if (str.length > how_many_digit) {
    return str.slice(0, how_many_digit);
  }
  if (str.length < how_many_digit) {
    if (padEnd) {
      return str.padEnd(how_many_digit, "0");
    } else {
      return str.padStart(how_many_digit, "0");
    }
  }
};

export const correctFormat = (time) => {
  let str = time.replace(".", ",");
  let hour = null;
  let minute = null;
  let second = null;
  let millisecond = null;
  // Handle millisecond
  let _a = str.split(","),
    front = _a[0],
    ms = _a[1];
  millisecond = fixDigit(3, ms);
  // Handle hour
  let _b = front.split(":"),
    a_hour = _b[0],
    a_minute = _b[1],
    a_second = _b[2];
  hour = fixDigit(2, a_hour, false);
  minute = fixDigit(2, a_minute, false);
  second = fixDigit(2, a_second, false);
  return hour + ":" + minute + ":" + second + "," + millisecond;
};

export const tryComma = (data) => {
  data = data.replace(/\r/g, "");
  let regex =
    /(\d+)\n(\d{1,2}:\d{2}:\d{2},\d{1,3}) --> (\d{1,2}:\d{2}:\d{2},\d{1,3})/g;
  let data_array = data.split(regex);
  data_array.shift(); // remove first '' in array
  return data_array;
};

export const tryDot = (data) => {
  data = data.replace(/\r/g, "");
  let regex =
    /(\d+)\n(\d{1,2}:\d{2}:\d{2}\.\d{1,3}) --> (\d{1,2}:\d{2}:\d{2}\.\d{1,3})/g;
  let data_array = data.split(regex);
  data_array.shift(); // remove first '' in array
  return data_array;
};
