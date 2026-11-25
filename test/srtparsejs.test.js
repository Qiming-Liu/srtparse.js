const srtparsejs = require("../dist/index.js");

const srtText = "1\r\n00:00:11,544 --> 00:00:12,682\r\nHello\r\n\r\n";

const srtArray = [
  {
    id: "1",
    startTime: "00:00:11,544",
    endTime: "00:00:12,682",
    text: "Hello",
  },
];

const twoCues =
  "1\n00:00:01,000 --> 00:00:02,000\nA\n\n2\n00:00:03,000 --> 00:00:04,000\nB\n";

describe("parse", () => {
  test("basic", () => {
    expect(srtparsejs.parse(srtText)).toStrictEqual(srtArray);
  });

  test("empty input", () => {
    expect(srtparsejs.parse("")).toStrictEqual([]);
    expect(srtparsejs.parse(undefined)).toStrictEqual([]);
  });

  test("multi-line text and LF endings", () => {
    const r = srtparsejs.parse(
      "1\n00:00:01,000 --> 00:00:02,000\nline 1\nline 2\n\n2\n00:00:03,000 --> 00:00:04,000\nB\n"
    );
    expect(r.map((c) => c.text)).toStrictEqual(["line 1\nline 2", "B"]);
    expect(r.map((c) => c.id)).toStrictEqual(["1", "2"]);
  });

  test("dot, mixed separators, short ms, 1-digit hour", () => {
    const r = srtparsejs.parse(
      "1\n0:00:01.5 --> 00:00:02,25\nA\n\n2\n00:00:03.000 --> 00:00:04.000\nB\n"
    );
    expect(r[0].startTime).toBe("00:00:01,500");
    expect(r[0].endTime).toBe("00:00:02,250");
    expect(r[1].startTime).toBe("00:00:03,000");
  });

  test("BOM, extra spaces, trailing settings", () => {
    const r = srtparsejs.parse(
      "﻿1\r\n00:00:01,000  -->  00:00:02,000 X1:10 X2:20\r\nA\r\n"
    );
    expect(r).toStrictEqual([
      { id: "1", startTime: "00:00:01,000", endTime: "00:00:02,000", text: "A" },
    ]);
  });

  test("missing ids get a number", () => {
    const r = srtparsejs.parse(
      "00:00:01,000 --> 00:00:02,000\nA\n\n00:00:03,000 --> 00:00:04,000\nB\n"
    );
    expect(r.map((c) => [c.id, c.text])).toStrictEqual([
      ["1", "A"],
      ["2", "B"],
    ]);
  });

  test("hours over 99 kept", () => {
    const r = srtparsejs.parse("1\n100:00:00,000 --> 100:00:01,000\nA\n");
    expect(r[0].startTime).toBe("100:00:00,000");
  });

  test("ms option adds number fields", () => {
    const r = srtparsejs.parse(srtText, { ms: true });
    expect(r[0].startMs).toBe(11544);
    expect(r[0].endMs).toBe(12682);
  });
});

describe("toSrt", () => {
  test("basic", () => {
    expect(srtparsejs.toSrt(srtArray)).toStrictEqual(srtText);
  });

  test("replaces every line break", () => {
    const out = srtparsejs.toSrt([{ ...srtArray[0], text: "a\nb\nc" }]);
    expect(out).toContain("a\r\nb\r\nc\r\n");
    expect(out).not.toMatch(/[^\r]\n/);
  });

  test("round trip", () => {
    const parsed = srtparsejs.parse(twoCues);
    expect(srtparsejs.parse(srtparsejs.toSrt(parsed))).toStrictEqual(parsed);
  });

  test("works from ms fields only", () => {
    expect(
      srtparsejs.toSrt([{ id: "1", startMs: 11544, endMs: 12682, text: "Hello" }])
    ).toBe(srtText);
  });
});

describe("time helpers", () => {
  test("toMS", () => {
    expect(srtparsejs.toMS("00:00:11,544")).toBe(11544);
    expect(srtparsejs.toMS("00:00:11.544")).toBe(11544);
    expect(srtparsejs.toMS(11544)).toBe(11544);
    expect(srtparsejs.toMS("100:00:00,000")).toBe(360000000);
  });

  test("toTime", () => {
    expect(srtparsejs.toTime(11544)).toBe("00:00:11,544");
    expect(srtparsejs.toTime(360000000)).toBe("100:00:00,000");
    expect(srtparsejs.toTime(-5)).toBe("00:00:00,000");
  });

  test("compareTime", () => {
    const c = srtparsejs.compareTime;
    expect(c("00:00:11,544", "00:00:11,543", "00:00:11,545")).toBe(0);
    expect(c("00:00:11,000", "00:00:11,543", "00:00:11,545")).toBe(-1);
    expect(c("00:00:12,000", "00:00:11,543", "00:00:11,545")).toBe(1);
    expect(c(11544, "00:00:11,543", "00:00:11,545")).toBe(0);
  });

  test("getSrtArrayIndex", () => {
    const arr = srtparsejs.parse(twoCues);
    expect(srtparsejs.getSrtArrayIndex(srtArray, 0, 0, "00:00:11,545")).toBe(0);
    expect(srtparsejs.getSrtArrayIndex(arr, 0, 1, "00:00:03,500")).toBe(1);
    expect(srtparsejs.getSrtArrayIndex(arr, 0, 1, 2500)).toBeUndefined();
  });

  test("getSubtitlesAt handles overlap", () => {
    const arr = srtparsejs.parse(
      "1\n00:00:01,000 --> 00:00:05,000\nA\n\n2\n00:00:02,000 --> 00:00:03,000\nB\n"
    );
    expect(srtparsejs.getSubtitlesAt(arr, 2500).map((c) => c.text)).toStrictEqual(
      ["A", "B"]
    );
  });
});

describe("setPlayer", () => {
  const make = (arr) => {
    const out = [];
    const player = srtparsejs.setPlayer(arr, (t) => out.push(t));
    return { player, out };
  };

  test("basic", () => {
    const { player, out } = make(srtArray);
    player.update(srtparsejs.toTime(11445));
    player.update(srtparsejs.toTime(11595));
    expect(out).toStrictEqual(["", "Hello"]);
    expect(player.getEndTime()).toBe("00:00:12,682");
  });

  test("seek to a later cue first", () => {
    const { player, out } = make(srtparsejs.parse(twoCues));
    player.update("00:00:03,500");
    expect(out).toStrictEqual(["", "B"]);
    expect(player.id).toBe(1);
  });

  test("back, forward, gaps and past the end", () => {
    const { player, out } = make(srtparsejs.parse(twoCues));
    player.update("00:00:03,500");
    player.update("00:00:01,500");
    player.update("00:00:02,500");
    player.update("00:00:03,500");
    player.update("00:00:09,000");
    expect(out).toStrictEqual(["", "B", "A", "", "B", ""]);
  });

  test("accepts ms numbers", () => {
    const { player, out } = make(srtparsejs.parse(twoCues));
    player.update(1500);
    expect(out).toStrictEqual(["", "A"]);
    expect(player.time).toBe("00:00:01,500");
  });

  test("empty array", () => {
    const { player, out } = make([]);
    player.update("00:00:01,000");
    expect(out).toStrictEqual([""]);
    expect(player.getEndTime()).toBe("00:00:00,000");
  });

  test("overlapping cues joined", () => {
    const { player, out } = make(
      srtparsejs.parse(
        "1\n00:00:01,000 --> 00:00:05,000\nA\n\n2\n00:00:02,000 --> 00:00:03,000\nB\n"
      )
    );
    player.update(2500);
    player.update(4000);
    expect(out).toStrictEqual(["", "A\nB", "A"]);
  });
});
