"use strict";

const pinnedVersion = "11.9.0";

let installedVersion;
try {
  installedVersion = require("highlight.js/package.json").version;
} catch (err) {
  console.error("highlight.js is not installed. Run npm ci first.");
  process.exit(1);
}

if (installedVersion !== pinnedVersion) {
  console.error(
    `highlight.js version mismatch: expected ${pinnedVersion}, found ${installedVersion}`
  );
  process.exit(1);
}

console.log(`highlight.js pin verified (${installedVersion})`);
