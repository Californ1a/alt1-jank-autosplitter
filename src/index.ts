import * as a1lib from "@alt1/base";
import { on } from "@alt1/base";
import * as script from "./scripts";

//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");

//loads all images as raw pixel data async, images have to be saved as *.data.png
//this also takes care of srgb header bullshit
//this is async to cant acccess them instantly but generally takes <20ms
const imgs = a1lib.ImageDetect.webpackImages({
	homeport: require("./homebutton.data.png")
});

//only works once for some reason... whatever you get the idea
a1lib.PasteInput.listen(ref => {
	const pos = ref.findSubimage(imgs.homeport);
	document.write("find result: " + JSON.stringify(pos));
});

//You can reach exports on window.TEST because of
//config.makeUmd("testpackage", "TEST"); in webpack.config.ts
export function capture() {
	const img = a1lib.captureHoldFullRs();
	const loc = img.findSubimage(imgs.homeport);
	document.write("homeport matches: " + JSON.stringify(loc));

	if (loc.length != 0) {
		alt1.overLayRect(a1lib.mixColor(255, 255, 255), loc[0].x, loc[0].y, imgs.homeport.width, imgs.homeport.height, 2000, 3);
	} else {
		alt1.overLayTextEx("Couldn't find homeport button", a1lib.mixColor(255, 255, 255), 20, Math.round(alt1.rsWidth / 2), 200, 2000, "", true, true);
	}
	//get raw pixels of image and show on screen (used mostly for debug)
	const buf = img.toData(0, 500, 450, 300);
	buf.show();

	(async () =>{
		// try {
		// 	console.log("[CAL] TEST");
			
		// 	const client = new LiveSplitClient("127.0.0.1:16834");

		// 	client.on("connected", () =>{
		// 		console.log("LS Connected!");
		// 	});

		// 	client.on("disconnected", () =>{
		// 		console.log("LS Disconnected!");
		// 	});

		// 	client.on("data", (data) =>{
		// 		console.log(`Debug data: ${data}`);
		// 	});

		// 	await client.connect();

		// } catch (e) {
		// 	console.error(e);
		// }

		// a1lib.captureStream(0, 553, 423, 209, 30, (img) =>{
		// 	a1lib.
		// }, errCB);


		function onError(e: Error) {
			console.error(e);
		}

		function editFile(fileEntry) {
			const reader = script.sharedChatboxReader.reader;
			script.sharedChatboxReader.tryFind();
			script.sharedChatboxReader.read();
			const timestamps = [];
			let i = 1;
			
			setInterval(()=>{
				const newlines = reader.read();
				if (newlines && newlines.length !== 0) {
					console.log(newlines);
					let split = false;
					const regex = /^(]|] | )?(Your Charos Clue Carrier has placed|Congratulations! You have now completed)/;
					for (const line of newlines) {
						for (const frag of line.fragments) {
							if (frag.text.match(regex)) {
								// console.log("MATCHED -", frag.text);

								const stamps = line.fragments.map(fr=>fr.text).filter(fr=>fr.match(/^\d{2}:\d{2}:\d{2}$/));
								// console.log("stamps", stamps);
								// console.log("timestamps", timestamps);
								
								const found = timestamps.some(r=> stamps.includes(r));
								// console.log("found", found);
								
								if (!found) {
									for (const stamp of stamps) {
										timestamps.push(stamp);
									}
									split = true;
								}
							}
						}
					}
					if (split) {
						console.log(newlines);
						console.log("SPLIT!");
						fileEntry.createWriter((fileWriter) => {
							fileWriter.seek(fileWriter.length);
							const blob = new Blob([`CAL-SPLIT-${i}\r\n`], {type: "text/plain"});
							fileWriter.write(blob);
							i++;
						}, onError);
					}
				}
			}, 500);
		}

		// working log file saved to "..\AppData\Local\Alt1Toolkit\chromecache\File System\000\t\00\00000000"
		function onInitFs(fs) {
			fs.root.getFile("info.txt", {create: false}, editFile, (e: Error) => {
				console.log("File does not exist, creating...");
				fs.root.getFile("info.txt", {create: true}, editFile, onError);
			});
		}

		(window as any).webkitRequestFileSystem((window as any).TEMPORARY, 1024*1024, onInitFs, onError);		

		// window.onbeforeunload = beforeUnload;
		// function beforeUnload() {
		// 	(window as any).webkitRequestFileSystem((window as any).TEMPORARY, 1024*1024, function(fs) {
		// 		fs.root.getFile("info.txt", {create: false}, function(fileEntry) {
			
		// 			fileEntry.remove(function() {
		// 				console.log("File removed.");
		// 			}, onError);
			
		// 		}, onError);
		// 	}, onError);
		// }
		
	})();
}

//print text world
//also the worst possible example of how to use global exposed exports as described in webpack.config.json
document.write(`
	<div>paste an image of rs with homeport button (or not)<div>
	<div onclick='TEST.capture()'>Click to capture if on alt1</div>`
);

script.start();

if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running insane the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
}
