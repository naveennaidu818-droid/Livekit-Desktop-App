# Office Meetings Desktop

This project converts the live web app at `https://customer.officemeetings.net/` into a desktop application using Electron.js.

## What this app does

- Opens the Office Meetings website directly inside a desktop window
- Supports camera and microphone permissions through Electron
- Supports screen-share requests through Electron
- Builds Windows, macOS, and Linux desktop packages

## Important note

This desktop app opens the live Office Meetings service at `customer.officemeetings.net`.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build shareable Windows files

```bash
npm run dist
```

The output will be created in the `release/` folder.

Share one of these files from `release/`:

- `Office Meetings Desktop-1.0.0-x64-installer.exe` - recommended installer for other computers
- `Office Meetings Desktop-1.0.0-x64-portable.exe` - single-file portable app

Do not share `release/win-unpacked/Office Meetings Desktop.exe` by itself. That file only works when it stays inside the full `win-unpacked` folder with all of its DLL and resource files.

Electron apps are larger than normal small utilities because they include Chromium and Node.js. A 70-90 MB installer/portable file is normal for this type of app.

## Build macOS files

Run this on a Mac:

```bash
npm install
npm run dist:mac
```

The macOS output is created in `release-mac/`:

- `.dmg` - recommended installer for Mac users
- `.zip` - alternate Mac app archive

The build creates separate Intel (`x64`) and Apple Silicon (`arm64`) files. For professional public sharing, sign and notarize the macOS build with an Apple Developer account.

## Build Linux files

Run this on Linux:

```bash
npm install
npm run dist:linux
```

The Linux output is created in `release-linux/`:

- `.AppImage` - easiest single-file Linux app
- `.deb` - installer for Ubuntu/Debian-based systems

## Build all platforms with GitHub Actions

This project includes `.github/workflows/build-desktop.yml`. Push the project to GitHub, then run **Build Desktop Apps** from the Actions tab.

The workflow uploads three downloadable artifact groups:

- `windows` - `.exe` installer and portable app
- `macos` - `.dmg` and `.zip`
- `linux` - `.AppImage` and `.deb`

Unsigned macOS builds may show Apple security warnings. For client-facing production releases, use Apple Developer signing and notarization.
