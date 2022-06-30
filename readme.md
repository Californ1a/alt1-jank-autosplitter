Built on [alt1minimal](https://github.com/skillbert/alt1minimal/) using jank, for use with [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)

## Installation

### You can skip steps #1-3 and start at step #4 by using [this hosted version](https://californ1a.github.io/alt1-jank-autosplitter/) of the app, rather than installing it locally. Copy/paste this full link to add to alt1:

alt1://addapp/https://californ1a.github.io/alt1-jank-autosplitter/appconfig.json

Prereq: Install [Node.js](https://nodejs.org/en/) version 16.6.1

Recommended to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (or [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)) instead of directly installing Node.js, so the Node version can be easily switched as-needed.

1. Clone this repo
2. In the console, within this repo's folder, run `npm i && npm run build`
   * You may also need to manually install sharp and canvas `npm i sharp canvas` and then run `npm run build` again.
   * After it completes, this will generate a `dist` folder.
3. Using the `index.html` in the `dist` folder, either:
	 1. Run it in a server (in VSCode, `Ctrl+Shift+P` & `Open with Live Server`) and open in alt1's browser with `alt1://browser/http://127.0.0.1:5500/dist/index.html` or 
	 2. Directly open the `index.html` in alt1's browser with `alt1://browser/file:///PATH_TO_REPO/dist/index.html`
		* If using option 2, direct file open, then you need to relaunch alt1 with a launch option. Make a shortcut to alt1 and add the launch option `--allow-file-access-from-files`, then quit and reopen alt1. Option 1 doesn't require this.
		* Option 1 will automatically reload the alt1 app when making changes, if you're editing the app and have `npm run watch` running.
4. (Start here when using [the hosted app](https://californ1a.github.io/alt1-jank-autosplitter/) version) Hit the `Add App` button and open the newly added app (you might have to hit the wrench in the top right of the app and give it additional permissions).
5. Download [Livesplit Server](https://github.com/LiveSplit/LiveSplit.Server/releases) zip, and unzip it into the `Components` folder of your Livesplit install directory.
6. Start Livesplit, right-click, edit layout, click the + button and add the Livesplit Server component (under the `Control` section).
7. Clone the middleman script repo [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)
8. Open the console and run `npm i` in that repo's folder.
9. Rename the `.env.sample` file to `.env` and edit it to change the `USERNAME` to match your Windows user name.
   * You may also need to edit the rest of the file path, depending on if you have any other alt1 apps using this type of file storage. The `C:/Users/USERNAME/AppData/Local/Alt1Toolkit/chromecache/File System/` portion should be the same for most people, but the next folder (`/000/`) might be `/001/` or `/002/` (etc.) if there are other alt1 apps using file storage, though I don't believe there are.

Now everything's set up and ready to be run.

## Usage

Make sure you have timestamps enabled in your in-game chat. The app uses timestamps to make sure it doesn't split twice for the same clue. This can be done in the Settings under *Messages & Social* -> *Chat Customisation* -> *[Local timestamps in chat box](https://i.imgur.com/Tbry2Rp.png)*.

1. Open the alt1 app and click on the `Start` button. Your chatbox should be highlighted and the timer should start running. The app is now watching for clue scroll solve messages.
   * You can minimize the app and leave it running if you want to just use LiveSplit, or run just the app on its own without the middleman script and LiveSplit if you want.
   * If you're running it locally and used Option 1 from Installation step 3 (VS code Live Server), then you will need to open VS Code and start the server in order to open the app. Option 2 does not require having VS Code or a server running, but does require alt1 to be launched with the `--allow-file-access-from-files` launch option. The hosted option doesn't require either of these.
2. Open Livesplit, right-click it, go to `Control`, and hit `Start Server`.
3. Open the console, browse to the middleman script repo folder, and run `npm start`. It should say `Connected!`
4. **Manually start your LiveSplit timer**, this thing only auto splits, doesn't auto start (though the timer within the app itself will auto-start, but not auto-end).
