# srtparse.js

[![npm](https://img.shields.io/npm/v/srtparsejs)](https://www.npmjs.com/package/srtparsejs)
[![Test](https://github.com/Qiming-Liu/srtparse.js/actions/workflows/test.yml/badge.svg)](https://github.com/Qiming-Liu/srtparse.js/actions/workflows/test.yml)
[![license](https://img.shields.io/npm/l/srtparsejs)](LICENSE)

A small JavaScript SRT subtitle parser, writer and player. No dependencies. Works in Node and the browser, ESM and CommonJS.

- **Parse** SRT text into plain objects, and **write** them back
- **Play** subtitles: give it a time, it tells you what to show
- **Forgiving**: `,` or `.` before milliseconds, BOM, any line ending, missing ids, hours over 99

## Install

```shell
npm install srtparsejs
# or
yarn add srtparsejs
```

```js
import * as srtparsejs from "srtparsejs";         // ESM
import { parse, toSrt, setPlayer } from "srtparsejs"; // named imports
const srtparsejs = require("srtparsejs");         // CommonJS
```

## Quick start

```js
import { parse, toSrt } from "srtparsejs";

const srt = `
1
00:00:11,544 --> 00:00:12,682
Hello

2
00:00:13,000 --> 00:00:15,500
Two
lines
`;

const cues = parse(srt);
/*
[
  { id: "1", startTime: "00:00:11,544", endTime: "00:00:12,682", text: "Hello" },
  { id: "2", startTime: "00:00:13,000", endTime: "00:00:15,500", text: "Two\nlines" }
]
*/

toSrt(cues); // back to SRT text (CRLF line endings)
```

Need times as numbers? Pass `{ ms: true }`:

```js
parse(srt, { ms: true });
// [{ id: "1", startTime: "00:00:11,544", endTime: "00:00:12,682", text: "Hello", startMs: 11544, endMs: 12682 }, ...]
```

## Player

`setPlayer(cues, setText)` returns a player. Call `update(time)` whenever the time changes. `setText` is called only when the shown text changes (`""` means nothing to show).

### With a `<video>` element

```js
import { parse, setPlayer } from "srtparsejs";

const video = document.querySelector("video");
const caption = document.querySelector("#caption");

const srt = await fetch("movie.srt").then((r) => r.text());
const player = setPlayer(parse(srt), (text) => {
  caption.textContent = text;
});

video.addEventListener("timeupdate", () => {
  player.update(video.currentTime * 1000); // milliseconds
});
```

Seeking works in any direction. If cues overlap, their text is joined with `\n`.

### With your own clock

```js
const player = setPlayer(parse(srt), (text) => console.log(text));

let ms = 0;
let paused = false;
const step = 100;

setInterval(() => {
  if (paused) return;
  ms += step;
  player.update(ms); // or player.update("00:00:11,544")
}, step);

player.getEndTime(); // "00:00:15,500"
player.getEndMs();   // 15500
```

## API

Every `time` argument can be an SRT string (`"00:00:11,544"` or `"00:00:11.544"`) or a number of milliseconds.

| Function | Returns |
| --- | --- |
| `parse(text, { ms? })` | Array of `{ id, startTime, endTime, text }` (plus `startMs`, `endMs` with `ms: true`) |
| `toSrt(cues)` | SRT string. Cues may use `startTime`/`endTime` or `startMs`/`endMs` |
| `setPlayer(cues, setText)` | Player with `update(time)`, `getEndTime()`, `getEndMs()` |
| `getSubtitlesAt(cues, time)` | All cues shown at `time` (handles overlap) |
| `getSrtArrayIndex(cues, start, end, time)` | Index of the cue at `time`, or `undefined`. Binary search: cues must be sorted and not overlap |
| `toMS(time)` | Milliseconds, e.g. `toMS("00:00:11,544")` → `11544` |
| `toTime(ms)` | SRT time, e.g. `toTime(11544)` → `"00:00:11,544"` |
| `compareTime(time, start, end)` | `-1` before, `0` inside, `1` after |

### What `parse` accepts

- `,` or `.` before milliseconds, mixed in one file; 1–3 digit milliseconds (`01.5` → `01,500`)
- CRLF, LF or CR line endings; a leading BOM
- Extra spaces around `-->` and extra settings after the end time (`X1:10 ...`)
- Cues with no id line (ids become `"1"`, `"2"`, ...)
- Hours over 99

Times in the output are always `HH:MM:SS,mmm`.

## Changelog

**1.1.0**
- Fix: `import { setPlayer }` crashed on `update`
- Fix: player crashed past the last cue or with an empty array
- Fix: first `update` that jumps past cue 1 now shows the right cue
- Fix: `toSrt` converts every line break in multi-line text
- Fix: hours over 99 are kept
- New: `parse(text, { ms: true })`, milliseconds accepted everywhere, `getSubtitlesAt`, `player.getEndMs()`, overlapping cues
- Note: `setText` is now called only when the text changes (before, it could repeat `""` in gaps)

Fully backward compatible with 1.0.x.

## License

[MIT](LICENSE)
