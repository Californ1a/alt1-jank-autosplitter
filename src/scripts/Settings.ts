import * as a1lib from "@alt1/base";
import { Chatbox } from "@alt1/chatbox/dist";
import { showSelectedChat, hexToRgb } from "./Chat";
import { reader } from "../index";
import { Splits } from "./Splits";

interface SettingsValues {
		"timer-type": string;
		"clueshr-type": string;
		autostop: number;
		splitat: number;
		chat: string;
		livesplit: boolean;
		regex: string;
		color: string;
}

interface ChangeEvent extends Event {
	target: HTMLInputElement;
}

export class Settings {
	static regexTimestampStr: string = "\\[\\d{2}:\\d{2}:\\d{2}\\]";
	static defaultRegexStr: string = "Your (reward was stored in Charos|Charos Clue Carrier has placed)";
	static defaultValues: SettingsValues = {
		"timer-type": "overall",
		"clueshr-type": "overall",
		autostop: 50,
		splitat: 1,
		chat: "",
		livesplit: true,
		regex: Settings.defaultRegexStr,
		color: "#00ff00",
	};

	settings: SettingsValues = {
		"timer-type": Settings.defaultValues["timer-type"],
		"clueshr-type": Settings.defaultValues["clueshr-type"],
		autostop: Settings.defaultValues.autostop,
		splitat: Settings.defaultValues.splitat,
		chat: Settings.defaultValues.chat,
		livesplit: Settings.defaultValues.livesplit,
		regex: Settings.defaultValues.regex,
		color: Settings.defaultValues.color,
	};
	regex: RegExp;
	settingElements: HTMLInputElement[];
	modal: HTMLElement;

	constructor(settingEles: NodeListOf<Element>, settingsBtn: Element, defaultBtn: Element, chatDropdown: Element, modal: HTMLElement) {
		this.settings["timer-type"] ??= localStorage.getItem("timer-type");
		this.settings["clueshr-type"] ??= localStorage.getItem("clueshr-type");
		this.settings.autostop = parseInt(localStorage.getItem("autostop"), 10) || Settings.defaultValues.autostop;
		this.settings.splitat = parseInt(localStorage.getItem("splitat"), 10) || Settings.defaultValues.splitat;
		this.settings.chat ??= localStorage.getItem("chatId");
		this.settings.livesplit = (localStorage.getItem("livesplit") === "false") ? false : Settings.defaultValues.livesplit;
		this.settings.regex ??= localStorage.getItem("regex");
		this.settings.color ??= localStorage.getItem("color");

		this.regex = new RegExp(`${Settings.regexTimestampStr} ${this.settings.regex}`);

		this.modal = modal;

		this.settingElements = Array.from(settingEles).map((element) => element.children[0] as HTMLInputElement);
		this.saveLocalStorage(true);

		settingsBtn.addEventListener("click", this.open.bind(this));
		defaultBtn.addEventListener("click", this.resetToDefault.bind(this));
		chatDropdown.addEventListener("change", (e: ChangeEvent) => {
			const value = parseInt(e.target.value, 10) || parseInt(this.settings.chat, 10);
			if (value && reader.pos.boxes[value]) {
				showSelectedChat(reader.pos.boxes[value]);
			} else if (reader.pos) {
				showSelectedChat(reader.pos.mainbox);
			}
		});
	}

	resetToDefault() {
		localStorage.clear();

		this.settings["timer-type"] = "overall";
		this.settings["clueshr-type"] = "overall";
		this.settings.autostop = 50;
		this.settings.splitat = 1;
		this.settings.chat = "";
		this.settings.livesplit = true;
		this.settings.regex = Settings.defaultRegexStr;
		this.settings.color = "#00ff00";

		this.regex = new RegExp(`${Settings.regexTimestampStr} ${Settings.defaultRegexStr}`);

		this.saveLocalStorage();
	}

	saveLocalStorage(onlyUnset: boolean = false) {
		for (const key in this.settings) {
			if (!Object.prototype.hasOwnProperty.call(this.settings, key)) continue;
			if (onlyUnset && localStorage.getItem(key) !== null) continue;
			localStorage.setItem(key, this.settings[key]);
		}
	}

	saveElements() {
		this.settingElements.forEach((element) => {
			if (element.type === "checkbox") {
				localStorage.setItem(element.id, element.checked.toString());
				this.settings[element.id] = element.checked;
			} else {
				localStorage.setItem(element.id, element.value);
				this.settings[element.id] = element.value;
			}
		});
	}

	setElementValues() {
		this.settingElements.forEach((element) => {
			if (element.type === "checkbox") {
				element.checked = this.settings[element.id] as boolean;
			} else {
				element.value = this.settings[element.id] as string;
			}
		});
	}

	//TODO: move to chat utils
	setChat(currentChat: string) {
		if (!reader.pos) return;
		const chat = parseInt(currentChat, 10);
		if (chat && reader.pos.boxes?.[chat]) {
			const main: Chatbox = reader.pos.mainbox;
			const box: Chatbox = reader.pos.boxes[chat];
			if (main.rect.x !== box.rect.x || main.rect.y !== box.rect.y) { // not the same box
				reader.pos.mainbox = box;
			}
		} else {
			//If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
			reader.pos.mainbox = reader.pos.boxes[0];
		}
		showSelectedChat(reader.pos.mainbox);
	}

	open() {
		this.modal.style.display = "flex";
		this.setElementValues();
	}

	close(split: Splits) {
		for (const element of this.settingElements) {

			// skip unchanged elements
			if (element.type === "checkbox" && element.checked === this.settings[element.id]) continue;
			if (element.value === this.settings[element.id]) continue;

			if (element.id === "regex") {
				this.regex = new RegExp(`${Settings.regexTimestampStr} ${element.value}`);
			} else if (element.id === "color") {
				const c = hexToRgb(element.value);
				if (reader) {
					reader.readargs.colors[reader.readargs.colors.length-1] = a1lib.mixColor(c[0], c[1], c[2]);
				}
			} else if (element.id === "clueshr-type") {
				split.swapCluesHrType(element.value, this.settings.splitat);
			} else if (element.id === "chat") {
				this.setChat(element.value);
			}
		}
		this.saveElements();
		this.modal.style.display = "none";
	}

}
