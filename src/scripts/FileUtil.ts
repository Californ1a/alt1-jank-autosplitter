let fileSystem;

export function onError(e: Error) {
	console.error(e);
}

export function writeLine(line) {
	if (fileSystem && localStorage.getItem("livesplit") === "true") {
		fileSystem.createWriter((fileWriter) => {
			fileWriter.seek(fileWriter.length);
			const blob = new Blob([`${line}\r\n`], {type: "text/plain"});
			fileWriter.write(blob);
		}, onError);
	}
}

function truncate(fs) {
	fs.createWriter((fileWriter) => {
		fileWriter.truncate(0);
	}, onError);
}

function setFile(fs) {
	truncate(fs);
	fileSystem = fs;
}

export function onInitFs(fs) {
	fs.root.getFile("info.txt", {create: false}, setFile, (e: Error) => {
		console.log("File does not exist, creating...");
		fs.root.getFile("info.txt", {create: true}, setFile, onError);
	});
}
