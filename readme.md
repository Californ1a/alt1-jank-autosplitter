Built on [alt1minimal](https://github.com/skillbert/alt1minimal/) using jank. Originally created for LiveSplit integration. Alt1 app UI added later on so it can be used independently without LS.

![](https://i.imgur.com/uVsNIg5.png)

## User Installation

https://californ1a.github.io/alt1-jank-autosplitter/

To add to alt1, copy paste this full address:

    alt1://addapp/https://californ1a.github.io/alt1-jank-autosplitter/appconfig.json

Then hit the `Add App` button and open the newly added app (you might have to hit the wrench in the top right of the app and give it additional permissions).

### LiveSplit Integration

To use with [LiveSplit](https://livesplit.org/):

1. Download the [autosplitter.asl](https://raw.githubusercontent.com/Californ1a/alt1-jank-autosplitter/main/autosplitter.asl) file (Right-click -> Save As).
2. **Important**: Open the autosplitter.asl file in notepad or any other text editor and change line #17 to match your folder path.
   * Most of the path should be the same, but the `\000\` folder might be `\001\` or `\002\` etc. (if you don't already have any folders in that location, then you'll need to open the Alt1 app first for it to generate a file, which will liklely be at `\000\` in that case).
2. In LiveSplit, Right-Click -> Edit Layout, hit the large `+` button, and add the `Scriptable Auto Splitter` component (in the Control section).
3. Hit the `Layout Settings` button, and go to the `Scriptable Auto Splitter` tab.
4. Hit the `Browse` button and open the autosplitter.asl file you downloaded.
5. Hit `OK` on both the Layout Settings and Layout Editor windows.
6. Optionally, right-click LiveSplit and hit `Save Layout` to save the settings. You can also go to `Edit Splits` and link your splits file to the layout, so the layout with the autosplitter gets automatically loaded upon opening your splits file.

The autosplitter script hooks into Alt1's process rather than RuneScape's. Make sure Alt1 is running prior to opening LiveSplit in order for the autosplitter to find Alt1's process.

#### (Old) Node.js middleman

> No longer required. Preferred method is using the autosplitter.asl now as outlined in the [LiveSplit Integration](https://github.com/Californ1a/alt1-jank-autosplitter#livesplit-integration) section.

The original implementation of this app used a Node.js middleman script (found on [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)) which relied on [LiveSplit Server](https://github.com/LiveSplit/LiveSplit.Server). This implementation can still be used if preferred rather than the autosplitter script.

To use the middleman script:

1. Install [Node.js](https://nodejs.org/en/) (preferrably using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)) rather than a direct install).
1. Download [Livesplit Server](https://github.com/LiveSplit/LiveSplit.Server/releases) zip, and unzip it into the `Components` folder of your Livesplit install directory.
2. Start Livesplit, right-click, edit layout, click the + button and add the Livesplit Server component (under the `Control` section).
3. Clone the middleman script repo [@Californ1a/jank-autosplitter](https://github.com/Californ1a/jank-autosplitter)
4. Open the console and run `npm i` in that repo's folder.
5. Rename the `.env.sample` file to `.env` and edit it to change the `USERNAME` to match your Windows user name.
   * You may also need to edit the rest of the file path, depending on if you have any other alt1 apps using this type of file storage. The `C:/Users/USERNAME/AppData/Local/Alt1Toolkit/chromecache/File System/` portion should be the same for most people, but the next folder (`/000/`) might be `/001/` or `/002/` (etc.) if there are other alt1 apps using file storage, though I don't believe there are.

## Usage

Upon opening the app, your chatbox should be highlighted to show that it is now watching for clue scroll solve messages.

Make sure you have timestamps enabled in your in-game chat. The app uses timestamps to make sure it doesn't split twice for the same clue. This can be done in the Settings under *Messages & Social* -> *Chat Customisation* -> *[Local timestamps in chat box](https://i.imgur.com/Tbry2Rp.png)*.

You can minimize the app and leave it running if you want to just use LiveSplit, or run just the app on its own without LiveSplit if you want.

If you're using the LiveSplit integration, open Livesplit and it should be ready to go after following the setup in the [LiveSplit Integration](https://github.com/Californ1a/alt1-jank-autosplitter#livesplit-integration) section once.

If using the old Node.js middleman script, you will need to:

1. Open LiveSplit, right-click it, go to `Control`, and hit `Start Server`.
2. Open the console, browse to the middleman script repo folder, and run `npm start`. It should say `Connected!`

Right-click on your sealed clue, hover open the `Open` option, and hit alt+1 keybind to start the timer (both the in-app timer and the LiveSplit integration). Alternatively, click the `Start` button in the app which will do the same.

The in-app timer will not auto-end on your final split like LiveSplit will, so the `Stop` button can be used to stop the timer without clearing the times if you're using the in-app timer. The `Clear` button will reset both the in-app times and LiveSplit.

## Development Installation

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
4. Hit the `Add App` button and open the newly added app (you might have to hit the wrench in the top right of the app and give it additional permissions).

Now everything's set up and ready to be run.

### Development Usage Notes

Refer to the main [Usage]() section for general usage.

* If you're running the Alt1 app locally and used Option 1 from Installation step 3 (VS code Live Server), then you will need to open VS Code and start the server in order to open the app. Option 2 does not require having VS Code or a server running, but does require alt1 to be launched with the `--allow-file-access-from-files` launch option. The hosted option doesn't require either of these and should be the preferred option for users.
