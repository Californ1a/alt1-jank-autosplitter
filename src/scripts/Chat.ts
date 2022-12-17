import * as a1lib from "@alt1/base";
import { Chatbox } from "@alt1/chatbox/dist";


export function showSelectedChat(chat: Chatbox) {
	const appColor = a1lib.mixColor(0, 255, 0);
	//Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
	try {
		alt1.overLayRect(
			appColor,
			chat.rect.x,
			chat.rect.y,
			chat.rect.width,
			chat.rect.height,
			2000,
			5
		);
	} catch (e) {
		console.error(e);
	 }
}

export function hexToRgb(hex) {
	return hex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
}
