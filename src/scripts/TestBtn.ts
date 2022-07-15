import { split } from "../index";

export function addTestButton() {
	const testBtn = document.querySelector(".test");
	if (testBtn) {
		return console.log("Test button already exists");
	}
	const th = document.createElement("th");
	th.innerHTML = "<div class=\"nisbutton2 test\">Test</div>";
	document.querySelector(".menu tr").appendChild(th);
	th.children[0].addEventListener("click", test);
}

function test() {
	if (!split.startTime) {
		split.startTimer();
		return;
	}
	split.split();
	split.actions++;
}
