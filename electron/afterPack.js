const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function findRcedit() {
  const packagedRcedit = path.join(
    __dirname,
    "..",
    "node_modules",
    "rcedit",
    "bin",
    "rcedit-x64.exe"
  );

  if (fs.existsSync(packagedRcedit)) {
    return packagedRcedit;
  }

  const cacheDir = path.join(process.env.LOCALAPPDATA || "", "electron-builder", "Cache", "winCodeSign");

  if (!fs.existsSync(cacheDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(cacheDir)
    .map((folder) => path.join(cacheDir, folder, "rcedit-x64.exe"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  return candidates[0] || null;
}

exports.default = async function afterPack(context) {
  const appDir = context.appOutDir;
  const localesDir = path.join(appDir, "locales");
  const keepLocales = new Set(["en-US.pak"]);

  if (fs.existsSync(localesDir)) {
    for (const fileName of fs.readdirSync(localesDir)) {
      if (!keepLocales.has(fileName)) {
        fs.rmSync(path.join(localesDir, fileName), { force: true });
      }
    }
  }

  for (const fileName of ["LICENSE.electron.txt", "LICENSES.chromium.html"]) {
    fs.rmSync(path.join(appDir, fileName), { force: true });
  }

  if (context.electronPlatformName === "win32") {
    const rcedit = findRcedit();
    const executableName = `${context.packager.appInfo.productFilename}.exe`;
    const executablePath = path.join(appDir, executableName);
    const iconPath = path.join(__dirname, "..", "build", "icon.ico");

    if (!rcedit) {
      throw new Error("Could not find rcedit-x64.exe to apply the Windows app icon.");
    }

    execFileSync(
      rcedit,
      [
        executablePath,
        "--set-icon",
        iconPath,
        "--set-version-string",
        "FileDescription",
        "Vitel Global Office Meetings",
        "--set-version-string",
        "ProductName",
        "Vitel Global Office Meetings",
        "--set-version-string",
        "CompanyName",
        "Vitel Global",
        "--set-version-string",
        "InternalName",
        "Office Meetings Desktop.exe",
        "--set-version-string",
        "OriginalFilename",
        "Office Meetings Desktop.exe"
      ],
      { stdio: "inherit" }
    );
  }
};
