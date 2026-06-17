import { computeStreakStats } from "./streakUtils.mjs";
import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("./sample-data.json", "utf-8"));
const records = data.data.records;

function run(label, recs) {
  const stats = computeStreakStats(recs);
  console.log(`\n--- ${label} ---`);
  console.log("current streak:", stats.current);
  console.log("longest streak:", stats.longest);
  console.log("totalSober:", stats.totalSober, "/", stats.days.length);
  console.log("last 3 streaks:", stats.streaks.slice(-3));
}

// Forward order (as exported)
run("Records in original (ascending) order", records);

// Reversed order — simulates a parent component that sorts newest-first.
// Should produce IDENTICAL results if the defensive sort works.
run("Records reversed (newest first)", [...records].reverse());

// Sanity assertion
const forward = computeStreakStats(records);
const reversed = computeStreakStats([...records].reverse());

const pass =
  forward.current === reversed.current &&
  forward.current === 6 &&
  forward.longest === reversed.longest;

console.log("\n=== RESULT ===");
console.log(pass ? "PASS: current streak = 6, order-independent" : "FAIL");
if (!pass) process.exit(1);
