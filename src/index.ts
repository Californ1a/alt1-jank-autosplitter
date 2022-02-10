//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
import ChatBoxReader from "@alt1/chatbox";

//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");


const output = document.getElementById("output");

//loads all images as raw pixel data async, images have to be saved as *.data.png
//this also takes care of metadata headers in the image that make browser load the image
//with slightly wrong colors
//this function is async, so you cant acccess the images instantly but generally takes <20ms
//use `await imgs.promise` if you want to use the images as soon as they are loaded
const imgs = a1lib.ImageDetect.webpackImages({
	homeport: require("./homebutton.data.png")
});

//listen for pasted (ctrl-v) images, usually used in the browser version of an app
a1lib.PasteInput.listen(img => {
	findHomeport(img);
}, (err, errid) => {
	output.insertAdjacentHTML("beforeend", `<div><b>${errid}</b>  ${err}</div>`);
});

//You can reach exports on window.TEST because of
//config.makeUmd("testpackage", "TEST"); in webpack.config.ts
export function capture() {
	if (!window.alt1) {
		output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
		return;
	}
	if (!alt1.permissionPixel) {
		output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);
		return;
	}

	function editFile(fileEntry) {
		const appColor = a1lib.mixColor(0, 255, 0);

		let reader = new ChatBoxReader();
		reader.readargs = {
			colors: [
				//a1lib.mixColor(255, 255, 255), //white
				a1lib.mixColor(0, 255, 0), //green
				//A1lib.mixColor(255, 165, 0), //Scavenging comps
				//A1lib.mixColor(255, 0, 0), //Rare Mats
				//A1lib.mixColor(67, 188, 188), //Ancient components
			],
		};

		reader.find(); //Find the chat box.
		reader.read(); //Get the initial read, to not report on initial load.

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
		reader.find();
		reader.read();
		let findChat = setInterval(function () {
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
				setInterval(function () {
					readChatbox();
				}, 600);
			}
		}, 1000);

		//let count, mats, index;
		let timestamps = new Set();
		let actions = 0;

		function readChatbox() {
			const opts = reader.read() || [];
			let chat = "";

			for (let a in opts) {
				chat += opts[a].text + " ";
			}

			console.log(chat);

			const clueComplete = chat.match(
				/\[\d{2}:\d{2}:\d{2}\] Your reward was stored in Charos/g
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
						fileEntry.createWriter((fileWriter) => {
							fileWriter.seek(fileWriter.length);
							const blob = new Blob([`CAL-SPLIT-${actions}\r\n`], {type: "text/plain"});
							fileWriter.write(blob);
							actions++;
						}, onError);
					}
				}
			}
			// for (let x in comps) {
			// 	count = Number(comps[x].match(/\d+/)); //1
			// 	mats = comps[x].match(/[^You receive \d]\w+( \w+)?/)[0]; //Junk
			// 	if (!mats.match(/parts|components|Junk/)) mats += "s";
			// 	if (compsList[mats]) {
			// 		compsList[mats].qty += count; //add count to index of second list.
			// 		tidyTable(mats);
			// 	} else {
			// 		console.warn("Invalid component.  Ignoring.");
			// 		continue;
			// 	}
			// }
		}
		const img = a1lib.captureHoldFullRs();
		const loc = img.findSubimage(imgs.homeport);
		document.write("homeport matches: " + JSON.stringify(loc));

		const buf = img.toData(0, 500, 450, 300);
		buf.show();
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

function findHomeport(img: ImgRef) {
	const loc = img.findSubimage(imgs.homeport);
	output.insertAdjacentHTML("beforeend", `<div>homeport matches: ${JSON.stringify(loc)}</div>`);

	//overlay the result on screen if running in alt1
	if (window.alt1) {
		if (loc.length != 0) {
			alt1.overLayRect(a1lib.mixColor(255, 255, 255), loc[0].x, loc[0].y, imgs.homeport.width, imgs.homeport.height, 2000, 3);
		} else {
			alt1.overLayTextEx("Couldn't find homeport button", a1lib.mixColor(255, 255, 255), 20, Math.round(alt1.rsWidth / 2), 200, 2000, "", true, true);
		}
	}

	//get raw pixels of image and show on screen (used mostly for debug)
	const buf = img.toData(100, 100, 200, 200);
	buf.show();
}

//print text world
//also the worst possible example of how to use global exposed exports as described in webpack.config.json

output.insertAdjacentHTML("beforeend", `
	<div>paste an image of rs with homeport button (or not)</div>
	<div onclick='TEST.capture()'>Click to capture if on alt1</div>`
);

//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running inside the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
}
