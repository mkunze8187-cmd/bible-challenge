#!/usr/bin/env node
// Verifies the admin console's electron/main.js resolves the same userData folder as the
// installed/dev main Bible Challenge app, by writing a sentinel value from one process and
// reading it back from the other. Run this from a normal terminal (not this sandboxed
// session, which sets ELECTRON_RUN_AS_NODE=1 and cannot launch real Electron windows).
//
// Usage (from this repo's root, after `npm install` and `npm run build` in both repos):
//   1. Start this admin console:      npm run start
//   2. Click "Write sentinel value" in the app that opens.
//   3. Start the main app:            (in ../Personal) npm run start
//   4. Confirm main app sees it, e.g. via DevTools console:
//        window.desktopHost.getAppSettings().then(s => console.log(s.__userDataSentinel))
//   5. Reverse direction: write a sentinel from the main app the same way (there is no UI
//      for it there; use DevTools: window.desktopHost.saveAppSettings({...(await window.desktopHost.getAppSettings()), __userDataSentinel: "from-main-app"}))
//      then click "Read sentinel value" here and confirm it shows "from-main-app".
//
// This script itself just prints the userData path Electron WOULD resolve to for each
// app's package.json productName, as a quick non-interactive sanity check you can run
// without launching either app's window (still requires a real Electron binary, so it
// also cannot run inside this session's sandboxed shell).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronBinary = path.resolve(__dirname, "../node_modules/electron/dist/electron.exe");

const checkScript = `
const { app } = require("electron");
app.setName("Bible Challenge");
app.whenReady().then(() => {
  console.log("USERDATA_PATH:" + app.getPath("userData"));
  app.exit(0);
});
`;

const tempScriptPath = path.join(__dirname, ".userdata-check.tmp.js");
const { writeFileSync, rmSync } = await import("node:fs");
writeFileSync(tempScriptPath, checkScript, "utf8");

try {
  const output = execFileSync(electronBinary, [tempScriptPath], {
    encoding: "utf8",
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "" }
  });
  console.log(output.trim());
  console.log("\nExpected: C:\\Users\\<you>\\AppData\\Roaming\\Bible Challenge");
  console.log("Compare this against the main app's own resolved path (it has no app.setName call,");
  console.log("so it resolves the same way from its package.json's productName: \"Bible Challenge\").");
} finally {
  rmSync(tempScriptPath, { force: true });
}
