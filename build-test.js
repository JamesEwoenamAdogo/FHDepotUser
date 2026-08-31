import { execSync } from "child_process";
try {
  console.log(execSync("npx tsc --noEmit", { encoding: "utf8" }));
} catch (e) {
  console.error(e.stdout);
  console.error(e.stderr);
}