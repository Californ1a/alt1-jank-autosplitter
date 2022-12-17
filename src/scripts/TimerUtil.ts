export function formatTime(value) {
	const seconds = (value / 1000) % 60;
	const minutes = Math.floor((value / (60 * 1000)) % 60);
	const hours = Math.floor((value / (60 * 60 * 1000)) % 24);
	const secondsS = (seconds < 10 && (minutes >= 1 || hours >= 1)) ? `0${seconds}`.slice(0, 5) : `${seconds.toFixed(2)}`;
	const [sec,mil] = secondsS.split(".");
	const minutesS = (minutes < 10 && hours >= 1) ? `0${minutes}`.slice(-2) : `${minutes}`.slice(-2);
	const hoursS = `${hours}`.slice(-2);

	if (hours < 1 && minutes < 1) {
		return `${sec}.<span class="miliseconds">${(mil)?mil:"00"}</span>`;
	}
	if (hours < 1) {
		return `${minutesS}:${sec}.<span class="miliseconds">${(mil)?mil:"00"}</span>`;
	}
	return `${hoursS}:${minutesS}:${sec}.<span class="miliseconds">${(mil)?mil:"00"}</span>`;
}

export function showTime(timerEle, value) {
	timerEle.innerHTML = formatTime(value);
}

export class A1Error {
	name: string;
	errorEle: HTMLElement;
	timerEle: Element;

	constructor(errorEle: HTMLElement, timerEle: Element) {
		this.name = "A1Error";
		this.errorEle = errorEle;
		this.timerEle = timerEle;
	}

	setError(message) {
		if (!this.errorEle) {
			this.errorEle = document.createElement("span");
			this.errorEle.className = "error";
			this.timerEle.append(this.errorEle);
		}
		this.errorEle.style.display = "block";
		this.errorEle.ariaLabel = message;
		if (!window.alt1 || !window.alt1?.permissionPixel || !window.alt1?.permissionOverlay) {
			this.errorEle.title = message;
		}
	}

	clearError() {
		if (!this.errorEle) return;
		this.errorEle.style.display = "none";
		this.errorEle.ariaLabel = "";
		if (!window.alt1) {
			this.errorEle.title = "";
		} else {
			alt1.clearTooltip();
		}
	}
}
