import { toMS, toTime, normalizeTime } from "./time.js";

// "00:00:01,000 --> 00:00:02,000" with "," or "." and any trailing settings.
const TIMING_RE =
  /^\s*(\d+:\d{1,2}:\d{1,2}(?:[,.]\d{1,3})?)\s*-->\s*(\d+:\d{1,2}:\d{1,2}(?:[,.]\d{1,3})?)/;
const ID_RE = /^\s*\d+\s*$/;

export function parse(srtText, options) {
  const withMs = !!(options && options.ms);
  const lines = String(srtText == null ? "" : srtText)
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  const items = [];
  let current = null;
  let textLines = [];

  const finish = () => {
    if (!current) return;
    current.text = textLines.join("\n").trim();
    items.push(current);
  };

  for (let i = 0; i < lines.length; i++) {
    const timing = TIMING_RE.exec(lines[i]);
    if (!timing) {
      textLines.push(lines[i]);
      continue;
    }
    // A number line right before the timing line is this cue's id.
    let id = null;
    if (textLines.length && ID_RE.test(textLines[textLines.length - 1])) {
      id = textLines.pop().trim();
    }
    finish();
    current = {
      id: id === null ? String(items.length + 1) : id,
      startTime: normalizeTime(timing[1]),
      endTime: normalizeTime(timing[2]),
      text: "",
    };
    if (withMs) {
      current.startMs = toMS(timing[1]);
      current.endMs = toMS(timing[2]);
    }
    textLines = [];
  }
  finish();
  return items;
}

export function toSrt(array) {
  let res = "";
  for (let i = 0; i < array.length; i++) {
    const s = array[i];
    const id = s.id === undefined || s.id === null ? i + 1 : s.id;
    const start =
      s.startTime !== undefined ? normalizeTime(s.startTime) : toTime(s.startMs);
    const end =
      s.endTime !== undefined ? normalizeTime(s.endTime) : toTime(s.endMs);
    const text = String(s.text == null ? "" : s.text)
      .replace(/\r\n?/g, "\n")
      .replace(/\n/g, "\r\n");
    res += id + "\r\n";
    res += start + " --> " + end + "\r\n";
    res += text + "\r\n\r\n";
  }
  return res;
}
