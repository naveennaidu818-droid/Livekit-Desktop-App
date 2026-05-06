const path = require("path");
const { app, BrowserWindow, desktopCapturer, nativeImage, session, shell } = require("electron");

const TARGET_URL = "https://customer.officemeetings.net/";
const INTERNAL_HOST_SUFFIX = ".officemeetings.net";
const APP_ID = "com.officemeetings.desktop";
const APP_TITLE = "Vitel Global Office Meetings";
const APP_ICON_FILE = process.platform === "win32" ? "icon.ico" : "icon.png";
const APP_ICON = app.isPackaged
  ? path.join(process.resourcesPath, APP_ICON_FILE)
  : path.join(__dirname, "..", "build", APP_ICON_FILE);

app.setName(APP_TITLE);

if (process.platform === "win32") {
  app.setAppUserModelId(APP_ID);
}

let mainWindow;

function isInternalOfficeMeetingsUrl(rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);
    return (
      parsedUrl.protocol === "https:" &&
      (parsedUrl.hostname === "officemeetings.net" ||
        parsedUrl.hostname.endsWith(INTERNAL_HOST_SUFFIX))
    );
  } catch {
    return false;
  }
}

function openUrlInApp(url) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.loadURL(url);

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
}

function createWindow() {
  const appIcon = nativeImage.createFromPath(APP_ICON);

  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: 1600,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    icon: appIcon,
    backgroundColor: "#08111f",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setTitle(APP_TITLE);

  mainWindow.webContents.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow.setTitle(APP_TITLE);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalOfficeMeetingsUrl(url)) {
      openUrlInApp(url);
      return { action: "deny" };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(TARGET_URL);
}

function configurePermissions() {
  const mediaPermissions = new Set(["media", "display-capture"]);

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    if (mediaPermissions.has(permission)) {
      return true;
    }
    return false;
  });

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(mediaPermissions.has(permission));
  });

  session.defaultSession.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"]
        });

        callback({
          video: sources[0],
          audio: "loopback"
        });
      } catch (error) {
        console.error("Display media request failed", error);
        callback({});
      }
    },
    {
      useSystemPicker: true
    }
  );
}

app.whenReady().then(() => {
  configurePermissions();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
