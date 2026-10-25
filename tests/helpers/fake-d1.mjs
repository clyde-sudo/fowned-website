/**
 * The D1 calls functions/ makes (prepare/bind/first/run/all), backed by an
 * in-memory SQLite that has every file in migrations/ applied, so a test runs
 * the real SQL against the real schema rather than a mock that agrees with it.
 */
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";

export function fakeD1() {
  const db = new DatabaseSync(":memory:");
  for (const f of readdirSync("migrations").filter((f) => f.endsWith(".sql")).sort()) {
    db.exec(readFileSync("migrations/" + f, "utf8"));
  }
  return {
    raw: db,
    prepare(sql) {
      const st = db.prepare(sql);
      let args = [];
      const stmt = {
        bind(...a) { args = a; return stmt; },
        async first() { return st.get(...args) ?? null; },
        async run() { st.run(...args); return { success: true }; },
        async all() { return { results: st.all(...args) }; },
      };
      return stmt;
    },
  };
}
