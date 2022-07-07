import * as srtparsejs from "../dist/index.js";

const test1_str = `
1
00:00:11,544 --> 00:00:12,682
Hello
`;

const test1_answer = [
  {
    id: "1",
    startTime: "00:00:11,544",
    endTime: "00:00:12,682",
    text: "Hello",
  },
];

test("parse", () => {
  expect(srtparsejs.parse(test1_str)).toStrictEqual(test1_answer);
});

const test2_answer = "1\r\n00:00:11,544 --> 00:00:12,682\r\nHello\r\n\r\n";

test("toSrt", () => {
  expect(srtparsejs.toSrt(test1_answer)).toStrictEqual(test2_answer);
});
