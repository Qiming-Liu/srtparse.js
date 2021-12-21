export default class srtParser {
    static correctFormat(time) {
        let str = time.replace(".", ",");
        let hour = null;
        let minute = null;
        let second = null;
        let millisecond = null;
        // Handle millisecond
        let _a = str.split(","), front = _a[0], ms = _a[1];
        millisecond = this.fixDigit(3, ms);
        // Handle hour
        let _b = front.split(":"), a_hour = _b[0], a_minute = _b[1], a_second = _b[2];
        hour = this.fixDigit(2, a_hour, false);
        minute = this.fixDigit(2, a_minute, false);
        second = this.fixDigit(2, a_second, false);
        return hour + ":" + minute + ":" + second + "," + millisecond;
    }

    static fixDigit(how_many_digit, str, padEnd) {
        if (padEnd === void 0) { padEnd = true; }
        if (str.length == how_many_digit) {
            return str;
        }
        if (str.length > how_many_digit) {
            return str.slice(0, how_many_digit);
        }
        if (str.length < how_many_digit) {
            if (padEnd) {
                return str.padEnd(how_many_digit, "0");
            }
            else {
                return str.padStart(how_many_digit, "0");
            }
        }
    }

    static tryComma(data) {
        data = data.replace(/\r/g, "");
        let regex = /(\d+)\n(\d{1,2}:\d{2}:\d{2},\d{1,3}) --> (\d{1,2}:\d{2}:\d{2},\d{1,3})/g;
        let data_array = data.split(regex);
        data_array.shift(); // remove first '' in array
        return data_array;
    }

    static tryDot(data) {
        data = data.replace(/\r/g, "");
        let regex = /(\d+)\n(\d{1,2}:\d{2}:\d{2}\.\d{1,3}) --> (\d{1,2}:\d{2}:\d{2}\.\d{1,3})/g;
        let data_array = data.split(regex);
        data_array.shift(); // remove first '' in array
        return data_array;
    }

    static parse(srtFile) {
        let originalData = srtFile;
        let data_array = this.tryComma(originalData);
        if (data_array.length == 0) {
            data_array = this.tryDot(originalData);
        }
        let items = [];
        for (let i = 0; i < data_array.length; i += 4) {
            let new_line = {
                id: data_array[i].trim(),
                startTime: this.correctFormat(data_array[i + 1].trim()),
                endTime: this.correctFormat(data_array[i + 2].trim()),
                text: data_array[i + 3].trim()
            };
            items.push(new_line);
        }
        return items;
    }

    static toSrt(data) {
        let res = "";
        for (let i = 0; i < data.length; i++) {
            let s = data[i];
            res += s.id + "\r\n";
            res += s.startTime + " --> " + s.endTime + "\r\n";
            res += s.text.replace("\n", "\r\n") + "\r\n\r\n";
        }
        return res;
    }

    static toMS(time) {
        let h = Number(time.substr(0, 2));
        let m = Number(time.substr(3, 2));
        let s = Number(time.substr(6, 2));
        let ms = Number(time.substr(9, 3));
        return h * 3600000 + m * 60000 + s * 1000 + ms;
    }

    static toTime(time) {
        let h = ('00' + Math.floor(time / 3600000)).slice(-2);
        let m = ('00' + Math.floor(time % 3600000 / 60000)).slice(-2);
        let s = ('00' + Math.floor(time % 60000 / 1000)).slice(-2);
        let ms = ('000' + Math.floor(time % 1000)).slice(-3);
        return h + ":" + m + ":" + s + "," + ms;
    }

    static compareTime(time, start, end) {
        let time_ms = this.toMS(time);
        let start_ms = this.toMS(start);
        let end_ms = this.toMS(end);
        if (time_ms >= start_ms && time_ms <= end_ms) {
            return 0;
        }
        else if (time_ms < start_ms) {
            return -1;
        }
        else {
            return 1;
        }
    }

    static binarySearch(array, startindex, endindex, time) {
        if (startindex > endindex) {
            return "";
        }
        let mid = Math.floor((startindex + endindex) / 2);
        let res = this.compareTime(time, array[mid].startTime, array[mid].endTime);
        if (res == 0) {
            return array[mid].text;
        }
        else if (res == -1) {
            return this.binarySearch(array, startindex, mid - 1, time);
        }
        else {
            return this.binarySearch(array, mid + 1, endindex, time);
        }
    }

    static setPlayer(srtArray, setText) {
        let bs = this.binarySearch
        let player = new class {
            constructor() {
                this.time = "00:00:00,000";
                this.srtArray = srtArray;
                this.setText = setText;
                this.binarySearch = bs
                // this.near = 5
            }

            moveTo(time) {
                //TDOD: optimize
                //check first
                //check near 5
                //check all
                this.time = time;
                let text = this.binarySearch(this.srtArray, 0, this.srtArray.length - 1, time);
                this.setText(text);
            }

            getEndTime() {
                return this.srtArray[this.srtArray.length - 1].endTime;
            }
        }
        player.moveTo(player.time)
        return player;
    }
}
