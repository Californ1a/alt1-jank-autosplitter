//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import ChatBoxReader from "@alt1/chatbox";
import { Splits } from "./scripts/Splits";
import { Settings } from "./scripts/Settings";
import { onInitFs, onError } from "./scripts/FileUtil";
import { A1Error } from "./scripts/TimerUtil";
import { showSelectedChat, hexToRgb } from "./scripts/Chat";
import { addTestButton } from "./scripts/TestBtn";

//tell webpack to add other files to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./settingsbutton2.png");
require("!file-loader?name=[name].[ext]!./Icon.png");

const startBtn = document.querySelector(".nisbutton.start");
const clearBtn = document.querySelector(".nisbutton.clear");
const settingsBtn = document.querySelector(".nissmallimagebutton.settings");

const modal = document.getElementById("settingsModal");
const modalCloseBtn = document.getElementsByClassName("nisclosebutton")[0];
const settingEles = document.querySelectorAll(".modal-content td:nth-child(even)");
const defaultBtn = document.querySelector(".default");

const timerEle = document.querySelector(".timer .time");
const splitsEle = document.querySelector(".splits");
const scrollBox = document.querySelector(".second");
const chatDropdown = document.querySelector("#chat");
let errorEle: HTMLElement = document.querySelector(".error");

export const split = new Splits(startBtn, clearBtn, splitsEle, timerEle, scrollBox);
const settings = new Settings(settingEles, settingsBtn, defaultBtn, chatDropdown, modal);
const a1Error = new A1Error(errorEle, timerEle);

export let reader;

modalCloseBtn.addEventListener("click", () => {
	settings.close(split);
});

window.addEventListener("click", (event) => {
	if (event.target != modal) return;
	settings.close(split);
});

errorEle.addEventListener("mouseenter", () => {
	if (errorEle.title) return;
	alt1.setTooltip(errorEle.ariaLabel);
});

errorEle.addEventListener("mouseleave", () => {
	if (errorEle.title) return;
	alt1.clearTooltip();
});

function capture() {
	if (!window.alt1) {
		a1Error.setError("You need to run this page in alt1 to capture the screen");
		return;
	}
	if (!alt1.permissionPixel) {
		a1Error.setError("Page is not installed as app or capture permission is not enabled");
		return;
	}

	reader = new ChatBoxReader();
	let c: any = settings.settings.color;
	if (c) {
		c = hexToRgb(c);
	} else {
		c = [0, 255, 0];
	}
	reader.readargs = {
		colors: [
			a1lib.mixColor(255, 255, 255), // white
			a1lib.mixColor(c[0], c[1], c[2]), // green
		],
	};

	// Find all visible chatboxes on screen
	try {
		reader.find(); // Find the chat box.
		reader.read(); // Get the initial read, to not report on initial load.
	} catch (e) {
		console.error(e);
		a1Error.setError("Failed to capture RS");
		return;
	}

	let findChat = setInterval(() => {
		if (reader.pos === null) {
			a1Error.setError("Looking for chatbox");
			reader.find();
		}
		else {
			clearInterval(findChat);
			a1Error.clearError();
			reader.pos.boxes.map((box, i) => {
				const chat = document.querySelector("#chat");
				chat.innerHTML += `<option value=${i}>Chat ${i}</option>`;
			});
			const chat = parseInt(settings.settings.chat, 10);
			if (reader.pos.boxes[chat]) {
				reader.pos.mainbox = reader.pos.boxes[chat];
			} else {
				//If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
				reader.pos.mainbox = reader.pos.boxes[0];
			}
			// console.log(reader);
			showSelectedChat(reader.pos.mainbox);
			split.setcbInterval(setInterval(() => {
				readChatbox();
			}, 500));
		}
	}, 1000);

	// let timestamps = new Set();

	function readChatbox() {
		const opts = reader.read() || [];
		let chat = "";

		if (opts.length === 0) return;

		// console.log(opts);

		for (let a in opts) {
			chat += opts[a].text + " ";
		}

		if (chat.trim().match(/^\[\d{2}:\d{2}:\d{2}\]$/g)) return;

		// console.log(chat);
		const clueType2 = chat.match(/Sealed clue scroll \((?<type>.{4,6})\)/);
		if (clueType2?.groups?.type && clueType2.groups.type !== split.clueType) {
			split.clueType = clueType2.groups.type;
		}

		const clueComplete = chat.match(settings.regex);
		// TODO: Auto-stop Alt1 in-app timer if got reward but clue carrier didn't place new clue (last clue finished)
		if (!(clueComplete != null && clueComplete.length > -1)) return;

		console.log(clueComplete);
		const timestamp = clueComplete[0].match(/(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})/);
		if (!(split.startTime !== 0 && timestamp != null && timestamp.length > -1)) return;

		if (split.timestamps.has(timestamp[0])) {
			return console.log("Duplicate timestamp");
		}

		const time = new Date(
			split.startDate.getFullYear(),
			split.startDate.getMonth(),
			split.startDate.getDate(),
			+timestamp.groups.hour,
			+timestamp.groups.minute,
			+timestamp.groups.second
		);
		if (time.getTime() < split.startTime) {
			return console.log("Clue too early");
		}

		const splitat = settings.settings.splitat;
		if (split.actions % splitat === 0) {
			console.log("SPLIT!");
			split.split(timestamp[0]);
		}
		split.actions++;
	}
}

//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running inside the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
	if (!alt1.permissionPixel) {
		a1Error.setError("Page is not installed as app or capture permission is not enabled");
	}

	a1lib.on("alt1pressed", (e) => {
		const clue = e.text.match(/Sealed clue scroll \((?<type>.{4,6})\)/);
		if (clue?.groups?.type) {
			split.clueType = clue.groups.type;
			split.clear();
			split.startTimer();
		}
	});
}

document.addEventListener("readystatechange", () => {
	if (document.readyState === "complete") {
		capture();
	}
}, false);

if (settings.settings.livesplit !== false) {
	(window as any).webkitRequestFileSystem((window as any).TEMPORARY, 1024*1024, onInitFs, onError);
}

if (document.location.host !== "californ1a.github.io") {
	addTestButton();
}
