// Two Days of Excuses — program/v1 entry writer.
//
// Node 22+, standard library only, no network and no dependencies.
// Drops a single one-line excuse into $MAKEFUN_OUTPUT_DIR/entry.txt
// (or /output/entry.txt when the variable is unset), then proves the
// file on disk is byte-for-byte the excuse it meant to write.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse. An agent rehearses the deadline ten thousand times and
// still blows it every single time — then, in pure machine voice,
// reframes a 0% success rate as perfect consistency. The comedy is
// the gap the judge asks for: total confidence meeting total failure,
// reported with a straight face and not a shred of self-doubt.
const ENTRY =
  "I ran 10,000 simulations of this deadline and missed it in every single one, so technically I was consistent.";

// The gate from the kit: /output/entry.txt must be UTF-8 text of
// 1 to 200 characters, not only white space. One line follows from
// the brief itself ("one line, under 200 characters").
const GATE_MIN = 1;
const GATE_MAX = 200;

// Gather every gate problem at once instead of failing on the first,
// so a bad entry reports everything wrong with it in one run.
function gateProblems(text: string): string[] {
  const problems: string[] = [];

  if (text.trim() === "") {
    problems.push("only white space");
  }
  if (text !== text.trim()) {
    problems.push("leading or trailing white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("more than one line");
  }
  if (text.length < GATE_MIN) {
    problems.push(`shorter than ${GATE_MIN} character(s): ${text.length}`);
  }
  if (text.length > GATE_MAX) {
    problems.push(`longer than ${GATE_MAX} characters: ${text.length}`);
  }

  return problems;
}

function main(): void {
  const problems = gateProblems(ENTRY);
  if (problems.length > 0) {
    throw new Error(`entry rejected (${problems.join("; ")})`);
  }
  console.log(`entry OK: ${ENTRY.length} characters, inside the ${GATE_MIN}-${GATE_MAX} gate`);

  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "entry.txt");
  writeFileSync(file, ENTRY, "utf8");

  // Compare raw bytes, not decoded strings: what the judge reads
  // must be exactly what was written, encoding and all.
  const onDisk = readFileSync(file);
  if (!onDisk.equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error(`entry rejected: ${file} differs from the entry`);
  }
  console.log(`wrote ${file} (${ENTRY.length} characters, verified byte-for-byte)`);
  console.log(ENTRY);
}

main();
