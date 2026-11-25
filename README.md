# [srt-parse.js](https://www.npmjs.com/package/srtparsejs)
A javascript srt text parser and player.

## Install
```shell
$ npm install srtparsejs
```
or
```shell
$ yarn add srtparsejs
```

## parse Example
```js
import * as srtparsejs from "srtparsejs"; // esm
const srtparsejs = require('srtparsejs'); // cjs

let srt = `
1
00:00:11,544 --> 00:00:12,682
Hello
`
let parsed = srtparsejs.parse(srt)
console.log(parsed)
/*
[{
    id: '1',
    startTime: '00:00:11,544',
    endTime: '00:00:12,682',
    text: 'Hello'
}]
*/

let srtString = srtparsejs.toSrt(parsed)
console.log(srtString)
/*
1
00:00:11,544 --> 00:00:12,682
Hello
*/
```

`parse` accepts:
- `,` or `.` before milliseconds (mixed in one file is fine), 1–3 digit milliseconds, hours over 99
- CRLF / LF / CR line endings, a leading BOM, extra spaces around `-->`
- cues without an id line (they get `"1"`, `"2"`, ...)

Times are always returned as `HH:MM:SS,mmm`.

### Times as numbers
Pass `{ ms: true }` to also get `startMs` / `endMs` in milliseconds:
```js
srtparsejs.parse(srt, { ms: true })
// [{ id: '1', startTime: '00:00:11,544', endTime: '00:00:12,682', text: 'Hello', startMs: 11544, endMs: 12682 }]
```
`toSrt` also works with items that only have `startMs` / `endMs`.

## srtPlayer Usage
```js
// Display the text of each subtitle by time
let srtPlayer = srtparsejs.setPlayer(parsed, text=>{
    console.log(text)
})

// Move player to this time (SRT string or milliseconds)
srtPlayer.update("00:00:11,544")
srtPlayer.update(11544)

// Get subtitle end time
console.log(srtPlayer.getEndTime()) // "00:00:12,682"
console.log(srtPlayer.getEndMs())   // 12682
```
`setText` is called only when the shown text changes. Seeking anywhere (forward or back) works.
If several cues overlap, their texts are joined with `\n`.

Named imports work too:
```js
import { parse, setPlayer } from "srtparsejs";
```

```js
//control the player
let pause = false

//srt player check interval
let interval = 100

//parse srt
let srtArray = srtparsejs.parse(srt)

//start millisecond
let ms = 0

//create player
let player = srtparsejs.setPlayer(srtArray, text => {
    //here to display the text
    console.log(text)
})

//update srt player time
setInterval(() => {
    if (pause) return;
    ms += interval
    //update to specific time
    player.update(ms)
}, interval)
```

## Helpers
```js
srtparsejs.toMS("00:00:11,544")   // 11544 ("." also ok)
srtparsejs.toTime(11544)          // "00:00:11,544"
srtparsejs.compareTime(time, start, end) // -1 before, 0 inside, 1 after
srtparsejs.getSubtitlesAt(srtArray, time) // all cues shown at this time
srtparsejs.getSrtArrayIndex(srtArray, 0, srtArray.length - 1, time) // binary search, sorted non-overlapping cues
```
All helpers take a time as an SRT string or milliseconds.
