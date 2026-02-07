## macOS security warning (Gatekeeper)

When installing **LaymanSync** on macOS, you may see a warning like:

> “Apple is not able to verify that it is free from malware that could harm your Mac or compromise your privacy.”

### Why this happens

LaymanSync is built with Electron and distributed outside of the Mac App Store.  
At the moment, the app is **not signed and notarized by Apple**.

macOS uses a security system called **Gatekeeper**, which requires apps to be:
- signed with an Apple Developer ID
- notarized by Apple (Apple scans the app for malware)

Because LaymanSync does **not** go through this process, macOS cannot automatically verify it — even though the app itself is safe and open-source.

This warning does **not** mean the app contains malware.  
It only means Apple has not reviewed or notarized it.

### How to open LaymanSync anyway

Here is how to bypass this warning:

1. Try to open the app normally (let it fail)
2. Go to **System Settings → Privacy & Security**
3. Scroll down to **Security**
4. Click **Open Anyway** next to LaymanSync

#### Option 3: Remove quarantine flag (advanced users)

```bash

xattr -dr com.apple.quarantine LaymanSync.app

```