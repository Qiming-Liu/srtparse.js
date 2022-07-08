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
import * as srtparsejs from "srtparsejs"; // cjs
const srtparsejs = require('srtparsejs'); // esm

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
`
*/
```
## srtPlayer Usage
```js
// Display the text of each subtitle by time
let srtPlayer = srtparsejs.setPlayer(parsed, text=>{
    console.log(text)
})

// Move player to this time
srtPlayer.update("00:00:11,544") 

// Get subtitle end time
console.log(srtPlayer.getEndTime())
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
    player.update(srtparsejs.toTime(ms))
}, interval)
```
