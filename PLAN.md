# WebM Compressor - Development Plan

## Project Overview

Gui for rclone we will have to allow user to provide two directories - source and destination. 
then allow to choose from copy or sync - by ticking "delete" flag with proper warnings if sync mode will be selected.

Entire logic is based on the @driveCompression.ts file.
How to use it can be seen in electron/src/tools/driveCompression.run.ts.

## Technology Stack

- **Framework**: Electron + React + TypeScript + raw CSS (no Tailwind, no CSS frameworks) + Vite
- binary dependencies: `rclone` (bundled)
- **Styling**: Vanilla CSS with AWS Console aesthetics (high-quality UI, vibrant colors, structured layout)
- **Window Sizing**:
  - **Production**: Default window size 1100x800.
  - **Development**: main usable app width (excluding DevTools) make 1100px to accommodate side-by-side DevTools without squeezing the main UI.
- we will have to bundle rclone with the app. we will not relay on user having rclone installed on his system. rclone have to be shipped in the final electron binary of the app.
- keep current run.sh, compile.sh, dev.sh, install.sh scripts. I need to have manual way to control lifecycle of the app with single commands. - these have to work with the phase 1.
- keep modules in electron/src/tools untouched - you might entire directory to different location if needed. but don't modify anything. Its already designed and tailored to this spec in PLAN.md and tested.

---

## Phase 1: UI Foundation & allowing user to select 2 folders (STEP 1)

WARNING: At this stege don't implement calling @driveCompression.ts. - not yet, wait for (phase 4)
WARNING: FOCUS ONLY ON THE SCOPE OF THIS PHASE. - don't implement anything that is not in the scope of this phase.

Build the core layout and implement the tooling for allowing user to select 2 folders - source and destination.

### UI Sections

Our UI will have three layers one under another from top to bottom as follow:
1) Let's call it MANUAL SELECTORS - it will be top div clearly divided to two parts - left and right. 
   In each side we will have identical UI with just labels different: on the left label will say "source directory" on the right label will say "destination directory".
   Now let's focus on the descripton of layut of one side:
   On top there will be dropzone block - reasonably sized to allow user to drag and drop directory conveniently.
   below that there will be <input type="file"> to allow user to select directory manually with native OS dialog.
2) Second section from the top we will have section which will present source and destination directory but this time not divided to left and right but top and bottom:
   It will have to present decent ui stating on the left "source directory" and on the right from that label full path (absolute path) presenting source.
   Below that the same "destination directory" and on the right from that label full path (absolute path) presenting full path to destination directory.

   label layers will have to be equally wide.

   on the very end of these two lines let's have button "show in finder" which once user click will open finder on that directory.
   Both lines presenting source and destination directory will have to have separate button "show in finder".

3) below taht we will have block which will accommodate checkbox to switch 'delete' mode which by default will be off. but once user decide to switch it on then we will show appropriate warning   informing user that this might be dangerous in certain circumstances. and then that block will generally overview what is the destructive nature of switching `rclone copy` for `rclone sync`.

4) Below that we will have progress bar taking full width of the app. with all stats under it
   this sectin will also have button on the right "start copy" or "start sync" depending on the mode selected in step 3.   

5) this section which will take all rest of available space will be block wiich will  show full log collected from rclone process via event 

   log: (line) => {
    from 
    await driveCompression({

## UI/UX Design Goals (AWS Console Style)

- **Structure**: Clean, boxed layouts with subtle borders (`#d5dbdb`).
- **Typography**: Sans-serif, clear hierarchy (Amazon Ember or system sans-serif).
- **Colors**:
  - Secondary actions: White with gray borders.
  - Primary actions: AWS Orange (`#ff9900`) for "Start/Process" or "Save".
  - Status: AWS Green for success, AWS Red for errors.
- **Spacing**: Generous padding and consistent alignment.
- **Interactivity**: Hover states for buttons and rows, smooth modal transitions.
- ffmpeg embedded in the app.


