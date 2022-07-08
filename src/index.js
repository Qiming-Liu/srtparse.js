import * as parser from './parser/parser.js';
import * as player from './player/player.js';

export function parse(srtFile) {
  let originalData = srtFile;
  let data_array = parser.tryComma(originalData);
  if (data_array.length === 0) {
    data_array = parser.tryDot(originalData);
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

export function toSrt(data) {
  let res = "";
  for (let i = 0; i < data.length; i++) {
    let s = data[i];
    res += s.id + "\r\n";
    res += s.startTime + " --> " + s.endTime + "\r\n";
    res += s.text.replace("\n", "\r\n") + "\r\n\r\n";
  }
  return res;
}

export function toMS(time) {
  let h = Number(time.substr(0, 2));
  let m = Number(time.substr(3, 2));
  let s = Number(time.substr(6, 2));
  let ms = Number(time.substr(9, 3));
  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

export function toTime(time) {
  let h = ("00" + Math.floor(time / 3600000)).slice(-2);
  let m = ("00" + Math.floor((time % 3600000) / 60000)).slice(-2);
  let s = ("00" + Math.floor((time % 60000) / 1000)).slice(-2);
  let ms = ("000" + Math.floor(time % 1000)).slice(-3);
  return h + ":" + m + ":" + s + "," + ms;
}

export function compareTime(time, start, end) {
  let time_ms = parser.toMS(time);
  let start_ms = parser.toMS(start);
  let end_ms = parser.toMS(end);
  if (time_ms >= start_ms && time_ms <= end_ms) {
    return 0;
  } else if (time_ms < start_ms) {
    return -1;
  } else {
    return 1;
  }
}

export function binarySearch(array, startindex, endindex, time) {
  if (startindex > endindex) {
    return undefined;
  }
  let mid = Math.floor((startindex + endindex) / 2);
  let res = parser.compareTime(time, array[mid].startTime, array[mid].endTime);
  if (res === 0) {
    return mid;
  } else if (res === -1) {
    return parser.binarySearch(array, startindex, mid - 1, time);
  } else {
    return parser.binarySearch(array, mid + 1, endindex, time);
  }
}

export const setPlayer = player.setPlayer;
