# srt-parse.js
A javascript .srt file parser and player

## Install
`npm`
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
/*
[{
    id: '1',
    startTime: '00:00:11,544',
    endTime: '00:00:12,682',
    text: 'Hello' 
}]
*/

let srtString = srtparser.toSrt(parsed)
console.log(srtString)
/*
1
00:00:11,544 --> 00:00:12,682
Hello
`
*/

let srtPlayer = srtparser.setPlayer(parsed, text=>{
    console.log(text)
})
// This will display the text of each subtitle by time

srtPlayer.update("00:00:11,544") // Move to this time
```
