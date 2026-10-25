/**
 * Contract between js/audit.js (what the audit form sends) and
 * functions/api/lead.js (how the server recognises an audit request). If the
 * sentence drifts in either file, audit leads arrive with no owner and no due
 * date, and nothing else would notice.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { AUDIT_REQUEST_MARKER } from "../functions/api/lead.js";
import { runScript, fakeElement } from "./helpers/browser-sandbox.mjs";

test("lead.js exports a non-empty AUDIT_REQUEST_MARKER", () => {
  assert.equal(typeof AUDIT_REQUEST_MARKER, "string");
  assert.ok(AUDIT_REQUEST_MARKER.length > 0);
});

test("js/audit.js submits a message that starts with the server's marker", async () => {
  const button = fakeElement();
  const form = fakeElement({ querySelector: (sel) => (sel === "button" ? button : null) });
  const elements = {
    auditForm: form,
    auditMsg: fakeElement(),
    auditUrl: fakeElement({ value: "example.com" }),
    auditEmail: fakeElement({ value: "owner@example.com" }),
  };
  const page = runScript("js/audit.js", { elements, globals: { FOWNED: {} } });
  form.fire("submit");
  await page.flush();

  const lead = page.requests.find((r) => r.url === "/api/lead");
  assert.ok(lead, "audit form posted nothing to /api/lead");
  assert.ok(
    lead.body.message.startsWith(AUDIT_REQUEST_MARKER),
    `message ${JSON.stringify(lead.body.message)} does not start with ${JSON.stringify(AUDIT_REQUEST_MARKER)}`
  );
});
