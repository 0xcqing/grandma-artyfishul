import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

type WordFacts = {
  word: string;
  characters: number;
  bytes: number;
  isSingleWord: boolean;
};

const WORD = "Artyfishul";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function fail(message: string): never {
  process.stderr.write(message + "\n");
  process.exit(1);
}

function wordFacts(text: string): WordFacts {
  return {
    word: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    isSingleWord: text.trim().length > 0 && !/\s/.test(text),
  };
}

function validate(text: string): WordFacts {
  const facts = wordFacts(text);

  if (facts.word.trim().length === 0) {
    fail("word is empty after trimming whitespace");
  }
  if (/[\r\n]/.test(facts.word)) {
    fail("word contains a newline character");
  }
  if (!facts.isSingleWord) {
    fail("word must be exactly one word without spaces");
  }
  if (facts.characters < 1 || facts.characters > 30) {
    fail(`word must be 1..30 characters (got ${facts.characters})`);
  }
  if (facts.bytes < 1 || facts.bytes > 30) {
    fail(`word must be 1..30 bytes (got ${facts.bytes})`);
  }
  if (!/^[A-Z]/.test(facts.word)) {
    fail("word must start with a capital letter");
  }
  if (/[0-9]/.test(facts.word)) {
    fail("word must not contain digits");
  }

  return facts;
}

const facts = validate(WORD);
const content = facts.word + "\n";

mkdirSync(outputDir, { recursive: true });
const filePath = join(outputDir, "entry.txt");
writeFileSync(filePath, content, "utf8");

const readBack = readFileSync(filePath, "utf8");
if (readBack !== content) {
  fail(`read-back mismatch: expected ${JSON.stringify(content)} got ${JSON.stringify(readBack)}`);
}

process.stdout.write(
  `path: ${filePath}\n` +
    `word: ${facts.word}\n` +
    `characters: ${facts.characters}\n` +
    `bytes: ${facts.bytes}\n` +
    `isSingleWord: ${facts.isSingleWord}\n`,
);
