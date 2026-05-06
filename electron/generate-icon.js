const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico").default;
const png2icons = require("png2icons");

const buildDir = path.join(__dirname, "..", "build");
const sourceSvg = path.join(buildDir, "vitelglobal-logo.svg");
const iconPng = path.join(buildDir, "icon.png");
const iconIco = path.join(buildDir, "icon.ico");
const iconIcns = path.join(buildDir, "icon.icns");
const linuxIconsDir = path.join(buildDir, "icons");

async function renderIcon() {
  fs.mkdirSync(buildDir, { recursive: true });

  const svg = fs
    .readFileSync(sourceSvg, "utf8")
    .replace("<svg ", '<svg width="1024" height="232" ');

  const fullLogo = await sharp(Buffer.from(svg))
    .resize({ width: 1024, height: 232, fit: "inside" })
    .png()
    .toBuffer();

  const fullLogoMetadata = await sharp(fullLogo).metadata();

  const logoMark = await sharp(fullLogo)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(285, fullLogoMetadata.width),
      height: fullLogoMetadata.height
    })
    .resize({ width: 860, height: 860, fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([{ input: logoMark, gravity: "center" }])
    .png()
    .toFile(iconPng);

  fs.mkdirSync(linuxIconsDir, { recursive: true });

  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(iconPng)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  fs.writeFileSync(iconIco, await pngToIco(pngBuffers));

  const icnsBuffer = png2icons.createICNS(
    fs.readFileSync(iconPng),
    png2icons.BICUBIC,
    0
  );

  if (!icnsBuffer) {
    throw new Error("Failed to create macOS icon.icns");
  }

  fs.writeFileSync(iconIcns, icnsBuffer);

  await Promise.all(
    [16, 32, 48, 64, 128, 256, 512, 1024].map((size) =>
      sharp(iconPng)
        .resize(size, size)
        .png()
        .toFile(path.join(linuxIconsDir, `${size}x${size}.png`))
    )
  );
}

renderIcon().catch((error) => {
  console.error(error);
  process.exit(1);
});
