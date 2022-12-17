import { writeLine } from "./FileUtil";
import { Settings } from "./Settings";
import { formatTime, showTime } from "./TimerUtil";

export class Splits {
	splits: number[];
	timestamps: Set<string>;
	lastTime: number;
	startTime: number;
	startDate: Date;
	actions: number;
	clueType: string;
	timerAnim: number;
	chatboxInterval: NodeJS.Timeout;
	startBtn: HTMLElement;
	clearBtn: HTMLElement;
	splitsEle: HTMLElement;
	timerEle: HTMLElement;
	scrollBox: HTMLElement;

	constructor(startBtn, clearBtn, splitsEle, timerEle, scrollBox) {
		this.splits = [];
		this.timestamps = new Set();
		this.startDate = new Date();
		this.lastTime = this.startDate.getTime();
		this.startTime = 0;
		this.actions = 1;
		this.clueType = "";
		this.timerAnim = 0;
		this.startBtn = startBtn;
		this.clearBtn = clearBtn;
		this.splitsEle = splitsEle;
		this.timerEle = timerEle;
		this.scrollBox = scrollBox;
		this.startBtn.addEventListener("click", () => this.startTimer());
		this.clearBtn.addEventListener("click", () => this.clear());
	}

	clear() {
		this.startBtn.innerHTML = "Start";
		cancelAnimationFrame(this.timerAnim);
		this.startTime = 0;
		this.startDate = new Date();
		this.actions = 1;
		this.splitsEle.innerHTML = "";
		this.timerEle.innerHTML = "0.<span class=\"miliseconds\">00</span>";
		this.splits = [];
		writeLine("RESET");
	}
	
	split(ts?: string) {
		if (ts) {
			this.timestamps.add(ts);
		}
		writeLine(`SPLIT-${this.actions}`);
		const currentTime = (new Date()).getTime();
		const previous = this.splits[this.splits.length - 1] || this.startTime;
		this.splits.push(currentTime);
		const msDuration = currentTime - this.startTime;
		const time = formatTime(msDuration);
		const segMsDur = currentTime - previous;
		const clueshrType = localStorage.getItem("clueshr-type") || "overall";
		const splitper = localStorage.getItem("splitat") || "1";
		const actionsPerTime = (clueshrType === "single") ? (+splitper)/segMsDur : this.actions/msDuration;
		const [cluesHr, chrMs] = `${(actionsPerTime * (60 * 60 * 1000)).toFixed(2)}`.split(".");
		const segmentTime = (previous)?formatTime(segMsDur):time;
		this.splitsEle.innerHTML += `<tr>
			<td>${this.actions}</td>
			<td>${segmentTime}</td>
			<td>${time}</td>
			<td>${cluesHr}.<span class="miliseconds">${(chrMs)?chrMs:"00"}</span></td>
		</tr>`;
		this.scrollBox.scrollTo({
			top: this.scrollBox.scrollHeight,
			behavior: "smooth"
		});
		const as = localStorage.getItem("autostop");
		if (!(as !== "" || as !== null)) return;
		if (!(as !== "0" && as === this.actions.toString())) return;
		this.startTimer();	
	}

	startTimer() {
		if (this.startTime !== 0) {
			clearInterval(this.chatboxInterval);
			this.startBtn.innerHTML = "Start";
			cancelAnimationFrame(this.timerAnim);
			this.startTime = 0;
			//timerEle.innerHTML = "0.<span class=\"miliseconds\">00</span>";
			return;
		}
		this.clear();
		writeLine("START");
		this.startBtn.innerHTML = "Stop";
		this.startDate = new Date();
		this.startTime = this.startDate.getTime();
		requestAnimationFrame(this.runTimer.bind(this));
	}

	runTimer() {
		const currentTime = (new Date()).getTime();
	
		if (currentTime - this.lastTime >= 50) {
	
			this.lastTime = currentTime;
			// numSeconds++;
			// timerEle.innerHTML = `${numSeconds}`;
			if (localStorage.getItem("timer-type") === "single") {
				const previous = this.splits[this.splits.length - 1] || this.startTime;
				showTime(this.timerEle, currentTime - previous);
			} else {
				showTime(this.timerEle, currentTime - this.startTime);
			}
		}
		this.timerAnim = requestAnimationFrame(this.runTimer.bind(this));
	}

	setcbInterval(cbInterval) {
		this.chatboxInterval = cbInterval;
	}

	swapCluesHrType(cluesHrType: string, splitat: number) {
		const rows = this.splitsEle.children;
		for (let i = 0; i < rows.length; i++) {
			const clueshrTd = rows[i].children[3];
			
			const msDuration = this.splits[i] - this.startTime;
			const segMsDur = (i === 0) ? this.splits[i] - this.startTime : this.splits[i] - this.splits[i-1];
			const actionsPerTime = (cluesHrType === "single") ? splitat/segMsDur : this.actions/msDuration;
			const [cluesHr, chrMs] = `${(actionsPerTime * (60 * 60 * 1000)).toFixed(2)}`.split(".");
	
			clueshrTd.innerHTML = `${cluesHr}.<span class="miliseconds">${(chrMs)?chrMs:"00"}</span>`;
		}
	}

}
