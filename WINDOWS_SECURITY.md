# Windows security warning (Microsoft Defender SmartScreen)

When installing **LaymanSync** on Windows, you may see a warning like:

> **Windows protected your PC**  
> Microsoft Defender SmartScreen prevented an unrecognized app from starting.  
> Running this app might put your PC at risk.


<img width="542" height="508" alt="Image" src="https://github.com/user-attachments/assets/4454dea0-60fe-4a7b-ba5a-7ba2d7fc7013" />

After clicking **More info**, you may see:
- **App:** LaymanSync-1.0.1-x64-setup.exe  
- **Publisher:** Unknown publisher

### Why this happens

LaymanSync is distributed outside of the Microsoft Store and is currently **not signed with a trusted code-signing certificate**.

Windows uses **Microsoft Defender SmartScreen** to protect users from unknown or rarely downloaded applications.  
If an app:
- is not digitally signed, or
- has not yet built reputation with Microsoft,

SmartScreen will show this warning — even if the app is safe.

This warning does **not** mean LaymanSync contains malware.  
It means Windows cannot verify the publisher or reputation of the installer.

### How to run LaymanSync anyway

If you trust the source, you can safely proceed.

1. Click **More info**
2. Click **Run anyway**


<img width="541" height="507" alt="Image" src="https://github.com/user-attachments/assets/67960a3c-44be-4a00-aaba-bd21e7d5672c" />

The installer will start normally.

### Why the publisher shows as “Unknown”

The installer is not signed with a commercial Windows code-signing certificate.  
Obtaining and maintaining such a certificate requires a paid certificate authority and is not yet in place for this project.

### Transparency & trust

- LaymanSync is **open-source**
- You can inspect the source code in this repository
- The installer performs no hidden background actions
- No telemetry, no auto-updates, no bundled software

