# LaymanSync

A simple, user-friendly, and easy-to-install desktop UI for [rclone](https://rclone.org/).

This tool was created after several friends asked me how to properly back up files to external drives. For non-power users, the simplest approach is to keep all files in a single directory and periodically sync it to an external drive.

In theory, rsync is the ideal solution, but expecting non-technical users to work in a terminal is unrealistic. I looked for GUI frontends for rsync, but found that existing options are either difficult to install, hard to use, or both.

So then I figured that it wouldn't take too much effort to build some simple UI on top of rsync to just help with just that one case -> two directories sync.

Also along the way, I found that not all rsync implementations are equal, and when it comes to cross-OS compatibility, rclone seems to be the better choice in terms of consistency across different operating systems. I really only need a single use case: copying or syncing between two directories.

So instead of rsync which differ per each OS I've decided to use [rclone](https://rclone.org/).

# Development

Project was built pretty much in about 2-3 evenings with some extra tunnig and debugging.

From the beginning I didn't want to spend too much time with it but have it working on Mac and Windows. Hence the choice of using Electron.

Electron is not necessarily the lightest stack available. The UI could use fewer resources if written in something closer to the metal. However, using Electron won’t impact the performance of the underlying rclone.

The application is meant to be launched, used, and then closed, so Electron’s overhead doesn’t really matter.

First evening I've prepared bunch of functions in [electron/src/tools](electron/src/tools) with reasonable amount of testing and rest of development of UI was made with Claude 4.5 Sonnet (non-thinking) via [Antigravity](https://antigravity.google/) simply vibecoded with simple [PLAN.md](PLAN.md) as a guide with some tweaking with Gemini 3 Flash and manual testing after.

Once app was doing good enough job and was handling errors properly I don't see any reason to spend more time with it since it was meant from the very beginning to represent finite complexity and not to be over-engineered.

So here it is. I hope you find it useful.

---

There is [alternative branch](https://github.com/stopsopa/LaymanSync/tree/gemini3flash) where UI was build with Gemini 3 Flash (non-thinking) via Antigravity - It's also usable but for no real reason honestly I've picked implementation with Claude 4.5 Sonnet. None of these were any better in any significant way. 

## Key Features

- ✅ **Simple Drag & Drop** – Easily select source and destination directories.
- ✅ **Bundled rclone** – No need to install `rclone` separately; it's bundled with the application. Just install the app and you are ready to go.
- ✅ **Copy & Sync Modes** – Toggle between [rclone copy](https://rclone.org/commands/rclone_copy/) and [rclone sync](https://rclone.org/commands/rclone_sync/) (with clear warnings for destructive sync operations).
- ✅ **Real-time Progress** – Track file transfers with progress bars, speeds, and ETA.
- ✅ **Live Logs** – View the raw output from `rclone` for transparency and troubleshooting.
- ✅ **Premium UI** – Clean and structured interface inspired by the AWS Console aesthetics.
- ✅ **Cross-Platform** – Built with Electron for consistent performance on macOS and Windows.

## Installation

1. Download the latest version for your operating system from the [Releases](https://github.com/stopsopa/LaymanSync/releases) page.
2. **macOS**: Drag `LaymanSync.app` to your Applications folder. (binaries for x64 and arm64)
3. **Windows**: Run the setup executable. (binaries for x64 and arm64)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Powered by [rclone](https://rclone.org/).
- Built with [Electron](https://www.electronjs.org/), [React](https://react.dev/), and [Vite](https://vite.dev/).
