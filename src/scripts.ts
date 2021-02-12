import * as a1lib from "@alt1/base";
import ChatBoxReader from "@alt1/chatbox";

var interval = 0;
var tickcount = 0;

export function start() {
	tickcount = 0;
	interval = +setInterval(checkAll, 600);
}

function checkAll() {
	// sharedChatboxReader.read();
	tickcount++;
}

export var sharedChatboxReader = (function () {
	var reader = new ChatBoxReader();
	var lastread = -1;
	var lastfindattempt = -1;

	var higlightarea = function () {
		if (!reader.pos) { return; }
		var p = reader.pos;
		for (var box of p.boxes) {
			alt1.overLayRect(a1lib.mixColor(255, 255, 255), box.rect.x, box.rect.y, box.rect.width, box.rect.height, 2000, 1);
		}
		// alt1.overLayRect(a1lib.mixColor(255, 255, 255), p.mainbox.rect.x, p.mainbox.rect.y, p.mainbox.rect.width, p.mainbox.rect.height, 2000, 1);
	}

	var tryFind = function () {
		if (reader.pos) { return; }
		if (tickcount == lastfindattempt) { return; }
		lastfindattempt = tickcount;
		// var img = a1lib.captureHold(0, 500, 450, 300);
		// reader.find(img);
		reader.find();
		higlightarea();
	}

	var read = function () {
		if (tickcount == lastread) { return; }
		lastread = tickcount;
		var colors: number[] = [a1lib.mixColor(4, 143, 6)];
		reader.readargs.colors = colors;
		var newlines = reader.read();
		if (!newlines || newlines.length == 0) { return; }
	}
	return { tryFind, read, reader };
})();
