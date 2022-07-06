/* Autosplitter v0.1 7/5/2022
Runescape Clues Autosplitter by Californ1a

Credit ClownFiesta for log file reading portion of the script:
https://github.com/ClownFiesta/AutoSplitters/blob/master/LiveSplit.SlayTheSpire.asl
 */

state("Runeapps.Alt1")
{

}

startup
{
	//Get the path for the logs
	// ---------------------------------- EDIT THIS TO YOUR PATH (The `\001\` folder is likely different) ----------------------------------
	vars.stsLogPath = Environment.ExpandEnvironmentVariables(@"%LOCALAPPDATA%\Alt1Toolkit\chromecache\File System\000\t\00\00000000");
	//Open the logs and set the position to the end of the file
	vars.reader = new StreamReader(new FileStream(vars.stsLogPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite));
	vars.reader.BaseStream.Seek(0, SeekOrigin.End);
	vars.lastPointerPosition = vars.reader.BaseStream.Position;
	//Set the command to "UPDATE"
	vars.command = "UPDATE";

	settings.Add("Reset on close", false, "Reset timer if Alt1 closes");
}

update
{

	if (vars.reader.BaseStream.Length == vars.lastPointerPosition) { //If the logs haven't changed, skip the rest of the code (update, reset, split, start, etc.). We place it first to lessen the load on the computer
		return false;
	} else if (vars.reader.BaseStream.Length < vars.lastPointerPosition) { //If the logs have been reset, then place the pointer at the end and update vars.lastPointerPosition and skip the rest of the code.
		vars.reader.BaseStream.Seek(0, SeekOrigin.End);
		vars.lastPointerPosition = vars.reader.BaseStream.Position;
		return false;
	}

	string line = "";
	while ((line = vars.reader.ReadLine()) != null) { //Read the log until its end
		//Updates vars.lastPointerPosition to its new position.
		vars.lastPointerPosition = vars.reader.BaseStream.Position;
		
		//Changes the value of vars.command depending on the content of line and returns true if a command needs to be issued.
		if (line.Contains("SPLIT")) {
			vars.command = "SPLIT";
			return true;
		} else if (line.Contains("START")) {
			vars.command = "START";
			return true;
		} else if (line.Contains("RESET")) {
			vars.command = "RESET";
			return true;
		}
	}
}

reset
{
	if (vars.command == "RESET") {
    vars.command = "UPDATE";
    return true;
	}
}

split
{
	if (vars.command == "SPLIT") {
		vars.command = "UPDATE";
		return true;
	}
}

start
{
	if (vars.command == "START") {
		vars.command = "UPDATE";
		return true;
	}
}

exit
{ 
	// Resets the timer if Alt1 closes
	if (settings["Reset on close"]) {
		new TimerModel() { CurrentState = timer }.Reset();
		vars.reader.Close();
		vars.lastPointerPosition = 0;
	}
}

shutdown
{
	// Closing the reader (Only useful when you close LiveSplit before closing Alt1)
	vars.reader.Close();
}

isLoading
{
	// Blank isLoading to avoid any warnings
}

gameTime
{
	// Blank gameTime to avoid any warnings
}
