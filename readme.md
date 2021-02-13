Built on [alt1minimal](https://github.com/skillbert/alt1minimal/) using jank, for use with [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)

## Installation

Prereq: Install [Node.js](https://nodejs.org/en/)

1. Clone this repo
2. In the console, within this repo's folder, run `npm i && npm run build`
   * This will generate a `dist` folder.
3. Using the `index.html` in the `dist` folder, either:
	 1. Run it in a server (in VSCode, `Ctrl+Shift+P` & `Open with Live Server`) and open in alt1's browser with `alt1://browser/http://127.0.0.1:5500/dist/index.html` or 
	 2. Directly open the `index.html` in alt1's browser with `alt1://browser/file:///PATH_TO_REPO/dist/index.html`
		* If using option 2, direct file open, then you need to relaunch alt1 with a launch option. Make a shortcut to alt1 and add the launch option `--allow-file-access-from-files`, then quit and reopen alt1. Option 1 doesn't require this.
		* Option 1 will automatically reload the alt1 app when making changes, if you're editing the app and have `npm run watch` running.
4. Hit the `Add App` button and open the newly added app (you might have to hit the wrench in the top right of the app and give it additional permissions).
5. Download [Livesplit Server](https://github.com/LiveSplit/LiveSplit.Server/releases) zip, and unzip it into the `Components` folder of your Livesplit install directory.
6. Start Livesplit, right-click, edit layout, and add the Livesplit Server component (under the `Control` section).
7. Clone the middleman script repo [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)
8. Run `npm i` in that repo's folder.
9. Rename the `.env.sample` file to `.env` and edit it to change the `USERNAME` to match your Windows user name.
   * You may also need to edit the rest of the file path, depending on if you have any other alt1 apps using this type of file storage. The `C:/Users/USERNAME/AppData/Local/Alt1Toolkit/chromecache/File System/` portion should be the same for most people, but the next folder (`/000/`) might be `/001/` or `/002/` (etc.) if there are other alt1 apps using file storage, though I don't believe there are.

Now everything's set up and ready to be run.

## Usage

1. Open the alt1 app and click on the word `Click`. Your chatbox should be highlighted and an image will come up in the app (ignore it, this is jank). The app is now watching for clue scroll solve messages.
   * You can minimize the app and leave it running, nothing useful appears in the ui and you can't start/stop it without closing the app and reopening it (jank).
2. Open Livesplit, right-click it, go to `Control`, and hit `Start Server`.
3. Open the console, browse to the middleman script repo folder, and run `npm start`. It should say `Connected!`
4. **Manually start your timer**, this thing only auto splits, doesn't auto start.
