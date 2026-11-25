import * as srtparsejs from "../dist/index.js";
import { parse, toSrt, setPlayer, toTime } from "../dist/index.js";

const srtText = "1\r\n00:00:11,544 --> 00:00:12,682\r\nHello\r\n\r\n";

test("namespace import", () => {
  const arr = srtparsejs.parse(srtText);
  expect(srtparsejs.toSrt(arr)).toBe(srtText);
});

test("named imports work, setPlayer included", () => {
  const arr = parse(srtText);
  expect(toSrt(arr)).toBe(srtText);
  const out = [];
  const player = setPlayer(arr, (t) => out.push(t));
  player.update(toTime(11600));
  expect(out).toStrictEqual(["", "Hello"]);
});
