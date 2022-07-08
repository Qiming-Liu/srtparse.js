import { getSrtArrayIndex } from "./index.js";

export function setPlayer(srtArray, setText) {
  let t = this;
  let player = new (class {
    constructor() {
      this.id = -1;
      this.time = "00:00:00,000";
      this.srtArray = srtArray;
      this.setText = setText;
      setText("");
    }

    update(time) {
      this.time = time;
      //check 0
      if (this.id === -1) {
        if (
          t.compareTime(
            this.time,
            this.srtArray[0].startTime,
            this.srtArray[0].endTime
          ) === 0
        ) {
          this.id = 0;
          this.setText(this.srtArray[0].text);
        }
        return;
      }
      //check self
      let res = t.compareTime(
        this.time,
        this.srtArray[this.id].startTime,
        this.srtArray[this.id].endTime
      );
      if (res === 0) {
        return;
      } else {
        //if not self
        //check near 10
        let start;
        let end;
        if (res === -1) {
          end = Math.max(this.id - 1, 0);
          start = Math.max(end - 10, 0);
          if (
            this.id !== 0 &&
            t.compareTime(
              this.time,
              this.srtArray[this.id - 1].endTime,
              this.srtArray[this.id].startTime
            ) === 0
          ) {
            this.setText("");
            return;
          }
        } else {
          start = Math.min(this.id + 1, this.srtArray.length - 1);
          end = Math.min(start + 10, this.srtArray.length - 1);
          if (
            this.id !== 0 &&
            t.compareTime(
              this.time,
              this.srtArray[this.id].endTime,
              this.srtArray[this.id + 1].startTime
            ) === 0
          ) {
            this.setText("");
            return;
          }
        }
        let index = getSrtArrayIndex(this.srtArray, start, end, this.time);
        if (index === undefined) {
          //if not found
          //check all
          index = getSrtArrayIndex(
            this.srtArray,
            0,
            this.srtArray.length - 1,
            this.time
          );
          if (index === undefined) {
            this.setText("");
            return;
          }
        }
        this.id = index;
        this.setText(this.srtArray[this.id].text);
      }
    }

    getEndTime() {
      return this.srtArray[this.srtArray.length - 1].endTime;
    }
  })();
  return player;
}
