import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const homePath = join(root, "index.html");
const choosePath = join(root, "choose-template", "index.html");

assert.ok(existsSync(homePath), "home page should exist");
assert.ok(existsSync(choosePath), "choose-template page should exist");

const home = readFileSync(homePath, "utf8");
const choose = readFileSync(choosePath, "utf8");
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

assert.ok(visibleText(home).includes("Create a job-winning"), "home should remain the landing page");
assert.ok(home.includes('href="choose-template/"'), "home should link to choose-template with a Pages-safe relative URL");
assert.ok(!home.includes('href="/choose-template"'), "home should not use root-relative choose-template links");

assert.ok(choose.includes("Select job-winning"), "choose-template should contain the captured template heading");
assert.ok(choose.includes("Start with this template"), "choose-template should include template CTAs");
assert.ok(choose.includes("strassburg-black-nophoto"), "choose-template should include the expanded template catalog assets");
assert.ok(!choose.includes("https://fonts.googleapis.com"), "choose-template should not depend on external Google Fonts CSS");

[
  "choose-template/assets/images/choose-template-bg.duhx0mtv-4420dba4a8a0cac5.png",
  "choose-template/assets/images/strassburg-black-nophoto-1column.d15hxvk7-4e2323ea5d1cf2c2.png",
  "choose-template/assets/styles/css2-33095772f2c6b87a.css",
].forEach((assetPath) => assert.ok(existsSync(join(root, assetPath)), `asset should exist: ${assetPath}`));
