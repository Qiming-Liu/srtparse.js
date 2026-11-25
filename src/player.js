import { toMS, toTime, cueStartMs, cueEndMs } from "./time.js";

// Binary search. Needs cues sorted by time and not overlapping.
export function getSrtArrayIndex(srtArray, startindex, endindex, time) {
  const t = toMS(time);
  let lo = Math.max(0, startindex);
  let hi = Math.min(srtArray.length - 1, endindex);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (t < cueStartMs(srtArray[mid])) hi = mid - 1;
    else if (t > cueEndMs(srtArray[mid])) lo = mid + 1;
    else return mid;
  }
  return undefined;
}

// All cues shown at this time. Works with overlapping or unsorted cues.
export function getSubtitlesAt(srtArray, time) {
  const t = toMS(time);
  return srtArray.filter((c) => t >= cueStartMs(c) && t <= cueEndMs(c));
}

export function setPlayer(srtArray, setText) {
  const player = {
    id: -1,
    time: "00:00:00,000",
    srtArray: srtArray,
    setText: setText,
    _text: "",

    // time: SRT string or milliseconds.
    update(time) {
      this.time = typeof time === "number" ? toTime(time) : time;
      const t = toMS(time);
      let first = -1;
      const texts = [];
      for (let i = 0; i < this.srtArray.length; i++) {
        const c = this.srtArray[i];
        if (t >= cueStartMs(c) && t <= cueEndMs(c)) {
          if (first === -1) first = i;
          texts.push(c.text);
        }
      }
      if (first !== -1) this.id = first;
      // Overlapping cues are joined with a line break.
      const text = texts.join("\n");
      if (text !== this._text) {
        this._text = text;
        this.setText(text);
      }
    },

    getEndTime() {
      return toTime(this.getEndMs());
    },

    getEndMs() {
      let end = 0;
      for (const c of this.srtArray) end = Math.max(end, cueEndMs(c));
      return end;
    },
  };
  setText("");
  return player;
}
