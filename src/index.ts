//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import ChatBoxReader from "@alt1/chatbox";

//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./appconfig.json");


// const output = document.querySelector(".main");
const startBtn = document.querySelector(".nisbutton.start");
startBtn.addEventListener("click", capture);
const clearBtn = document.querySelector(".nisbutton.clear");
clearBtn.addEventListener("click", clear);
const timerEle = document.querySelector(".timer");
const splitsEle = document.querySelector(".splits");
const scrollBox = document.querySelector(".second");
let chatboxInterval;
let timerAnim;

const splits = [];
let lastTime = (new Date()).getTime();
let startTime = 0;

function clear() {
	cancelAnimationFrame(timerAnim);
	startTime = 0;
	splitsEle.innerHTML = "";
	timerEle.innerHTML = "0.<span class=\"miliseconds\">00</span>";
}

function formatTime(value) {
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

function showTime(value) {
	timerEle.innerHTML = formatTime(value);
}

function timer() {
	const currentTime = (new Date()).getTime();

	if (currentTime - lastTime >= 50) {

		lastTime = currentTime;
		// numSeconds++;
		// timerEle.innerHTML = `${numSeconds}`;
		showTime(currentTime - startTime);
	}
	timerAnim = requestAnimationFrame(timer);
}

function split(actions, fileEntry?, onError?) {
	if (fileEntry && onError) {
		fileEntry.createWriter((fileWriter) => {
			fileWriter.seek(fileWriter.length);
			const blob = new Blob([`CAL-SPLIT-${actions}\r\n`], {type: "text/plain"});
			fileWriter.write(blob);
		}, onError);
	}
	const currentTime = (new Date()).getTime();
	const previous = splits[splits.length - 1];
	splits.push(currentTime-startTime);
	const current = splits[splits.length - 1];
	const time = formatTime(currentTime - startTime);
	const segmentTime = (previous)?formatTime(current - previous):time;
	splitsEle.innerHTML += `<tr><td>${actions}</td><td>${segmentTime}</td><td>${time}</td></tr>`;
	scrollBox.scrollTo({
		top: scrollBox.scrollHeight,
		behavior: "smooth"
	});
}

function capture() {
	if (!window.alt1) {
		timerEle.innerHTML = "<small>You need to run this page in alt1 to capture the screen</small>";
		return;
	}
	if (!alt1.permissionPixel) {
		timerEle.innerHTML = "<small>Page is not installed as app or capture permission is not enabled</small>";
		return;
	}
	if (startBtn.innerHTML === "Stop") {
		clearInterval(chatboxInterval);
		startBtn.innerHTML = "Start";
		cancelAnimationFrame(timerAnim);
		startTime = 0;
		//timerEle.innerHTML = "0.<span class=\"miliseconds\">00</span>";
		return;
	}


	function editFile(fileEntry) {
		const appColor = a1lib.mixColor(0, 255, 0);

		let reader = new ChatBoxReader();
		reader.readargs = {
			colors: [
				a1lib.mixColor(255, 255, 255), //white
				a1lib.mixColor(0, 255, 0), //green
				//A1lib.mixColor(255, 165, 0), //Scavenging comps
				//A1lib.mixColor(255, 0, 0), //Rare Mats
				//A1lib.mixColor(67, 188, 188), //Ancient components
			],
		};

		try {
			reader.find(); //Find the chat box.
			reader.read(); //Get the initial read, to not report on initial load.
		} catch (e) {
			console.error(e);
			timerEle.innerHTML = "<small>Failed to capture RS window</small>";
			return;
		}

		function showSelectedChat(chat) {
			//Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
			try {
				alt1.overLayRect(
					appColor,
					chat.mainbox.rect.x,
					chat.mainbox.rect.y,
					chat.mainbox.rect.width,
					chat.mainbox.rect.height,
					2000,
					5
				);
			} catch { }
		}

		//Find all visible chatboxes on screen
		// reader.find();
		// reader.read();
		let findChat = setInterval(() => {
			if (reader.pos === null)
				reader.find();
			else {
				clearInterval(findChat);
				// reader.pos.boxes.map((box, i) => {
				// 	$(".chat").append(`<option value=${i}>Chat ${i}</option>`);
				// });

				if (localStorage.ccChat) {
					reader.pos.mainbox = reader.pos.boxes[localStorage.ccChat];
				} else {
					//If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
					reader.pos.mainbox = reader.pos.boxes[0];
				}
				showSelectedChat(reader.pos);
				chatboxInterval = setInterval(() => {
					readChatbox();
				}, 500);
				startBtn.innerHTML = "Stop";
				startTime = (new Date()).getTime();
				requestAnimationFrame(timer);
			}
		}, 1000);

		let timestamps = new Set();
		let actions = 1;

		function readChatbox() {
			const opts = reader.read() || [];
			let chat = "";

			for (let a in opts) {
				chat += opts[a].text + " ";
			}

			//console.log(chat);

			const clueComplete = chat.match(
				/\[\d{2}:\d{2}:\d{2}\] Your (reward was stored in Charos|Charos Clue Carrier has placed)/g
			);
			if (clueComplete != null && clueComplete.length > -1) {
				console.log(clueComplete);
				const timestamp = clueComplete[0].match(/\d{2}:\d{2}:\d{2}/g);
				if (timestamp != null && timestamp.length > -1) {
					if (timestamps.has(timestamp[0])) {
						console.log("Duplicate timestamp");
					} else {
						timestamps.add(timestamp[0]);
						console.log("SPLIT!");
						split(actions, fileEntry, onError);
						actions++;
					}
				}
			}
		}
	}

	function onError(e: Error) {
		console.error(e);
	}

	function onInitFs(fs) {
		fs.root.getFile("info.txt", {create: false}, editFile, (e: Error) => {
			console.log("File does not exist, creating...");
			fs.root.getFile("info.txt", {create: true}, editFile, onError);
		});
	}

	(window as any).webkitRequestFileSystem((window as any).TEMPORARY, 1024*1024, onInitFs, onError);

}

//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running inside the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
}

const testBtn = document.querySelector(".nisbutton.test");
if (testBtn) {
	testBtn.addEventListener("click", test);
}

let testAct = 1;

function test() {
	if (!startTime) {
		startTime = (new Date()).getTime();
		requestAnimationFrame(timer);
		return;
	}
	split(testAct);
	testAct++;
}
