// Time helpers. A time is either an SRT string ("00:01:02,345", "." also ok)
// or a number of milliseconds.

const TIME_RE = /^\s*(\d+):(\d{1,2}):(\d{1,2})(?:[,.](\d{1,3}))?\s*$/;

export function toMS(time) {
  if (typeof time === "number") return time;
  const m = TIME_RE.exec(String(time));
  if (!m) return NaN;
  const ms = (m[4] || "0").padEnd(3, "0");
  return (
    Number(m[1]) * 3600000 +
    Number(m[2]) * 60000 +
    Number(m[3]) * 1000 +
    Number(ms)
  );
}

export function toTime(timeNumber) {
  const t = Math.max(0, Math.round(Number(timeNumber) || 0));
  const h = String(Math.floor(t / 3600000)).padStart(2, "0");
  const m = String(Math.floor((t % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
  const ms = String(t % 1000).padStart(3, "0");
  return h + ":" + m + ":" + s + "," + ms;
}

// Turn any valid time string into "HH:MM:SS,mmm".
export function normalizeTime(time) {
  return toTime(toMS(time));
}

export function compareTime(time, start, end) {
  const t = toMS(time);
  if (t < toMS(start)) return -1;
  if (t > toMS(end)) return 1;
  return 0;
}

export function cueStartMs(cue) {
  return typeof cue.startMs === "number" ? cue.startMs : toMS(cue.startTime);
}

export function cueEndMs(cue) {
  return typeof cue.endMs === "number" ? cue.endMs : toMS(cue.endTime);
}
