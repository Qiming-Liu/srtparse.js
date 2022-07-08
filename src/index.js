import * as parser from "./parser.js";
import * as player from "./player.js";

export function parse(srtText) {
  let data_array = parser.tryComma(srtText);
  if (data_array.length === 0) {
    data_array = parser.tryDot(srtText);
  }
  let items = [];
  for (let i = 0; i < data_array.length; i += 4) {
    let new_line = {
      id: data_array[i].trim(),
      startTime: parser.correctFormat(data_array[i + 1].trim()),
      endTime: parser.correctFormat(data_array[i + 2].trim()),
      text: data_array[i + 3].trim(),
    };
    items.push(new_line);
  }
  return items;
}

export function toSrt(array) {
  let res = "";
  for (let i = 0; i < array.length; i++) {
    let s = array[i];
    res += s.id + "\r\n";
    res += s.startTime + " --> " + s.endTime + "\r\n";
    res += s.text.replace("\n", "\r\n") + "\r\n\r\n";
  }
  return res;
}

export function toMS(timeString) {
  let h = Number(timeString.substr(0, 2));
  let m = Number(timeString.substr(3, 2));
  let s = Number(timeString.substr(6, 2));
  let ms = Number(timeString.substr(9, 3));
  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

export function toTime(timeNumber) {
  let h = ("00" + Math.floor(timeNumber / 3600000)).slice(-2);
  let m = ("00" + Math.floor((timeNumber % 3600000) / 60000)).slice(-2);
  let s = ("00" + Math.floor((timeNumber % 60000) / 1000)).slice(-2);
  let ms = ("000" + Math.floor(timeNumber % 1000)).slice(-3);
  return h + ":" + m + ":" + s + "," + ms;
}

export function compareTime(timeString, startString, endString) {
  let time_ms = toMS(timeString);
  let start_ms = toMS(startString);
  let end_ms = toMS(endString);
  if (time_ms >= start_ms && time_ms <= end_ms) {
    return 0;
  } else if (time_ms < start_ms) {
    return -1;
  } else {
    return 1;
  }
}

export function getSrtArrayIndex(srtArray, startindex, endindex, timeString) {
  if (startindex > endindex) {
    return undefined;
  }
  let mid = Math.floor((startindex + endindex) / 2);
  let res = compareTime(
    timeString,
    srtArray[mid].startTime,
    srtArray[mid].endTime
  );
  if (res === 0) {
    return mid;
  } else if (res === -1) {
    return getSrtArrayIndex(srtArray, startindex, mid - 1, timeString);
  } else {
    return getSrtArrayIndex(srtArray, mid + 1, endindex, timeString);
  }
}

export const setPlayer = player.setPlayer;
