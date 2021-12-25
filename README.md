# srt-parse.js
A javascript .srt file parser and player

## Install
```shell
npm install srtparsejs
```

## Example
```js
import srtparser from 'srtparsejs'

let srt = `
1
00:00:11,544 --> 00:00:12,682
Hello
`
let parsed = srtparser.parse(srt)
console.log(parsed)
/* result:
[{
    id: '1',
    startTime: '00:00:11,544',
    endTime: '00:00:12,682',
    text: 'Hello' 
}]
*/

let srtString = srtparser.toSrt(parsed)
console.log(srtString)
/* result:
1
00:00:11,544 --> 00:00:12,682
Hello
`
*/

// Display the text of each subtitle by time
let srtPlayer = srtparser.setPlayer(parsed, text=>{
    console.log(text)
})

// Move player to this time
srtPlayer.update("00:00:11,544") 

// Get subtitle end time
console.log(srtPlayer.getEndTime())
```

## Usage
```js
import srtparser from 'srtparsejs'

//srt content
let srt = `
1
00:00:11,544 --> 00:00:12,682
Hello
`

//control the player
let pause = false

//srt player check interval
let interval = 100

//parse srt
let srtArray = srtparser.parse(srt)

//start millisecond
let ms = 0

//create player
let player = srtparser.setPlayer(srtArray, text => {
    //here to display the text
    console.log(text)
})

//update srt player time
setInterval(() => {
    if (pause) return;
    ms += interval
    //update to specific time
    player.update(srtparser.toTime(ms))
}, interval)
```
