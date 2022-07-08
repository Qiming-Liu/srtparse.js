import * as srtparsejs from "../dist/index.js";

const srtText = "1\r\n00:00:11,544 --> 00:00:12,682\r\nHello\r\n\r\n";

const srtArray = [
  {
    id: "1",
    startTime: "00:00:11,544",
    endTime: "00:00:12,682",
    text: "Hello",
  },
];

test("parse", () => {
  expect(srtparsejs.parse(srtText)).toStrictEqual(srtArray);
});

test("toSrt", () => {
  expect(srtparsejs.toSrt(srtArray)).toStrictEqual(srtText);
});

test("toMS", () => {
  expect(srtparsejs.toMS("00:00:11,544")).toStrictEqual(11544);
});

test("toTime", () => {
  expect(srtparsejs.toTime(11544)).toStrictEqual("00:00:11,544");
});

test("compareTime", () => {
  expect(
    srtparsejs.compareTime("00:00:11,544", "00:00:11,543", "00:00:11,545")
  ).toStrictEqual(0);
});

test("getSrtArrayIndex", () => {
  expect(
    srtparsejs.getSrtArrayIndex(srtArray, 0, 0, "00:00:11,545")
  ).toStrictEqual(0);
});

test("setPlayer", () => {
  const textList = [];

  const srtPlayer = srtparsejs.setPlayer(srtArray, (text) => {
    textList.push(text);
  });

  let time = 11445;
  let interval = 150;

  setTimeout(() => {
    time += interval;
    srtPlayer.update(srtparsejs.toTime(time));
    expect(textList).toStrictEqual(["", "Hello"]);
  }, interval);
});
