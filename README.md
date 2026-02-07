# LaymanSync

A simple, user-friendly, and easy-to-install desktop UI for **rclone**.

Tool was created because I was asked few times by my friends how to do backups of files to external drives properly.
The simples choice for non power user would be to keep all files in one big directory and just sync it from time to time to external drive.
So then ideally one would use rsync but it's hard to demand from non power user to use terminal. 
So then I've started looking for GUIs for rsync but then I've realised that there is nothing really easy to install or even worse, none of available solutions is easy to use or combination of both.

So then the decision was made to just write something simple, hence this project.

Also along the way I have found that not all rsync are equal and regarding cross OS compatibility rclone seems to be better choice and I really need just one case to copy or sync across two directories.

So instead of rsync which differ per each OS I've decided to use rclone.

# Development

Project was built pretty much in about 2-3 evenings with some extra tunnig and debugging.
From the beginning I didn't want to spend too much time with it but have it working on Mac and Windows. Hence the choice of using Electron.
Electron is not necessarily the lightest stack available. UI could take less resources if written in something closer to the metal. But using Electron won't impact performance of underlying rclone.
And application is meant to launch, use and then close. So Electron overhead doesn't really matter.

First evening I've prepared bunch of functions in [electron/src/tools](electron/src/tools) with reasonable amount of testing and rest of development of UI was made with Claude 4.5 Sonnet (non-thinking) via Antigravity simply vibecoded with simple [PLAN.md](PLAN.md) as a guide with some tweaking with Gemini 3 Flash and manual testing after.

Once app was doing good enough job and was handling errors properly I don't see any reason to spend more time with it since it was meant from the very beginning to represent finite complexity and not to be over-engineered.

So here it is. I hope you find it useful.

---

There is [alternative branch](https://github.com/stopsopa/LaymanSync/tree/gemini3flash) where UI was build with Gemini 3 Flash (non-thinking) via Antigravity - It's also usable but for no real reason honestly I've picked implementation with Claude 4.5 Sonnet. None of these were any better in any significant way. 

## Key Features

- ✅ **Simple Drag & Drop** – Easily select source and destination directories.
- ✅ **Bundled rclone** – No need to install `rclone` separately; it's bundled with the application. Just install the app and you are ready to go.
- ✅ **Copy & Sync Modes** – Toggle between `rclone copy` and `rclone sync` (with clear warnings for destructive sync operations).
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
