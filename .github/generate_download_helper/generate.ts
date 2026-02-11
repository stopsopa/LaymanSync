/**
 * example: https://github.com/stopsopa/LaymanSync/releases/tag/v2.1.0
 * single link: https://github.com/stopsopa/LaymanSync/releases/download/v2.1.0/LaymanSyncBulk-2.1.0-arm64.dmg
 *
 * call
 * NODE_OPTIONS="" node .github/generate_download_helper/generate.ts 2.1.0 public/download.html
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------ vvv

const projectName = "LaymanSyncBulk";

const githubHomepage = `https://github.com/stopsopa/LaymanSync`;

const list = [
  {
    label: "Windows - ARM based",
    postfix: "-arm64-setup.exe",
    os: "win",
    arch: "arm64",
  },
  {
    label: "Windows - x64 based (Intel & AMD)",
    postfix: "-x64-setup.exe",
    os: "win",
    arch: "x64",
  },
  {
    label: "MacOS - ARM based (Apple Silicon, M1, M2, M3, M4, M5)",
    postfix: "-arm64.dmg",
    os: "mac",
    arch: "arm64",
  },
  {
    label: "MacOS - x64 based (Intel)",
    postfix: "-x64.dmg",
    os: "mac",
    arch: "x64",
  },
];

// ------------------------ ^^^

function log(...args: string[]) {
  console.log(`.github/generate_download_helper/generate.ts`, ...args);
}

let version = process.argv[2];

if (!version) {
  throw new Error(
    `.github/generate_download_helper/generate.ts error: version is required - provide it as first argument`,
  );
}

version = version.replace(/^v/, "");

const verReg = /^\d+\.\d+\.\d+$/;
if (!verReg.test(version)) {
  throw new Error(
    `.github/generate_download_helper/generate.ts error: version must match >${verReg}< -> value provided >${version}<`,
  );
}

const mainReleasesPage = `${githubHomepage}/releases`;

const link = `${mainReleasesPage}/download/`;

const core = `${projectName}-`;

const generatedList = list.map((item) => {
  const file = `${core}${version}${item.postfix}`;
  const url = `${link}v${version}/${file}`;

  return `<a href="${url}" data-os="${item.os}" data-arch="${item.arch}" data-label="${item.label}" data-file="${file}"></a>`;
});

const listFragment = generatedList.join("\n");

log(`

Generated html fragment:
${listFragment}  
`);

let template = fs.readFileSync(path.join(__dirname, "template.html"), "utf-8");

template = template.replace(`<div id="links"></div>`, listFragment);
template = template.replace(
  `<h1 id="project-title"></h1>`,
  `<h1><a href="${mainReleasesPage}">${projectName} - v${version}</a></h1>`,
);
template = template.replace(`ribbonlink`, githubHomepage);
template = template.replace(`Assets`, `Assets (v${version})`);

const target = process.argv[3];

if (typeof target !== "string" || target.trim() === "") {
  throw new Error(
    `.github/generate_download_helper/generate.ts error: target is required - provide it as second argument`,
  );
}

// also make sure to mkdir -p target directory
const dir = path.dirname(target);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!target) {
  throw new Error(
    `.github/generate_download_helper/generate.ts error: target is required - provide it as second argument`,
  );
}

fs.writeFileSync(target, template);

log(`
  
  generated: >${target}<
`);
