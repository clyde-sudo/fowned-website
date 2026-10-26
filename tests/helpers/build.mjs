/**
 * Builds the site into a private temp directory and returns its path.
 *
 * Every test file used to build into the shared dist/, and node --test runs
 * files in parallel, so one file's rmSync("dist") deleted another file's
 * output mid-read: 18 false failures on a clean tree. A directory per caller
 * removes the race instead of serialising around it.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function buildSite(env = {}) {
  const out = mkdtempSync(join(tmpdir(), "fowned-build-"));
  execFileSync(process.execPath, ["build.mjs"], {
    stdio: "ignore",
    env: { ...process.env, ...env, BUILD_OUT: out },
  });
  return out;
}
