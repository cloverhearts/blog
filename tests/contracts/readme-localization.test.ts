import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const files = readdirSync(root).filter((name) => /^README(?:\.[a-z]{2}(?:-[A-Za-z0-9]+)*)?\.md$/u.test(name)).sort();
const readmes = Object.fromEntries(files.map((file) => [file, readFileSync(resolve(root, file), "utf8")]));
const switcherPattern = /<!-- language-switcher:start -->([\s\S]*?)<!-- language-switcher:end -->/u;
const links = (text: string) => [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/gu)].map((match) => match[1]!);
const body = (text: string) => text.replace(switcherPattern, "");

function assertLanguageNavigation(documents: Record<string, string>): void {
  for (const [file, text] of Object.entries(documents)) {
    const switcher = text.match(switcherPattern);
    assert.ok(switcher, `${file}: missing language selector`);
    assert.ok(text.indexOf(switcher[0]) < text.indexOf("\n## "), `${file}: selector must precede the first section`);
    assert.deepEqual(links(switcher[1]!).sort(),
      Object.keys(documents).filter((other) => other !== file).map((other) => `./${other}`).sort(),
      `${file}: link to every existing alternate exactly once, without self or missing links`);
  }
}

test("links every README language from a dedicated top selector", () => {
  for (const required of ["README.md", "README.ko.md", "README.ja.md"]) {
    assert.ok(readmes[required], `Missing README: ${required}`);
  }
  assertLanguageNavigation(readmes);
  for (const [file, language] of Object.entries({ "README.md": "English", "README.ko.md": "한국어", "README.ja.md": "日本語" })) {
    assert.ok(readmes[file]!.match(switcherPattern)![1]!.includes(`**${language}**`));
  }
});

test("rejects nonexistent and nonreciprocal README language links", () => {
  const invalid = { ...readmes, "README.md": readmes["README.md"]!.replace("./README.ko.md", "./README.fr.md") };
  assert.throws(() => assertLanguageNavigation(invalid), /link to every existing alternate/u);
  const expanded = { ...readmes, "README.fr.md": readmes["README.md"]! };
  assert.throws(() => assertLanguageNavigation(expanded), /link to every existing alternate/u);
});

test("keeps README prose separated while preserving sections commands and reference links", () => {
  const english = body(readmes["README.md"]!);
  const codeBlocks = (text: string) => [...text.matchAll(/```[^\n]*\n[\s\S]*?```/gu)].map((match) => match[0]);
  const headings = (text: string) => text.match(/^## .+$/gmu) ?? [];
  assert.doesNotMatch(english, /[\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}]/u);
  assert.doesNotMatch(body(readmes["README.ko.md"]!), /[\p{Script=Hiragana}\p{Script=Katakana}]/u);
  assert.doesNotMatch(body(readmes["README.ja.md"]!), /\p{Script=Hangul}/u);
  for (const [file, text] of Object.entries(readmes)) {
    assert.doesNotMatch(text, /^> /mu, `${file}: do not interleave companion translations`);
    assert.equal(headings(text).length, headings(english).length, file);
    assert.deepEqual(codeBlocks(text), codeBlocks(english), file);
    assert.deepEqual(links(body(text)).sort(), links(english).sort(), file);
    for (const link of links(text).filter((link) => link.startsWith("./"))) {
      assert.ok(existsSync(resolve(root, link)), `${file}: broken relative link ${link}`);
    }
  }
});

test("keeps agent README rules aligned with separate extensible translations", () => {
  const rules = readFileSync(resolve(root, "AGENTS.md"), "utf8");
  assert.match(rules, /README\.<language-code>\.md/u);
  assert.match(rules, /top language selector/u);
  assert.match(rules, /update all existing translations in the same change/u);
  assert.doesNotMatch(rules, /translation immediately after the corresponding/u);
});
