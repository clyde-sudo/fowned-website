/**
 * The lead alert's sender comes from LEAD_NOTIFY_FROM, and falls back to the
 * one domain Resend has verified today (leads@citability.dev). Switching to a
 * fowned.live sender is then an env change once its DNS records are in, not a
 * code change.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost, DEFAULT_NOTIFY_FROM } from "../functions/api/lead.js";
import { fakeD1 } from "./helpers/fake-d1.mjs";

async function sentFrom(extraEnv) {
  const outbound = [];
  globalThis.fetch = async (url, init = {}) => {
    outbound.push({ url: String(url), body: init.body });
    return new Response("{}", { status: 200 });
  };
  const env = { fowned_leads: fakeD1(), RESEND_API_KEY: "test", LEAD_NOTIFY_TO: "team@test.invalid", ...extraEnv };
  const request = new Request("https://fowned.live/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://fowned.live", "CF-Connecting-IP": "203.0.113.50" },
    body: JSON.stringify({ contact: "owner@example.com", message: "hello" }),
  });
  assert.equal((await onRequestPost({ request, env })).status, 200);
  const mail = outbound.find((o) => o.url.includes("resend"));
  assert.ok(mail, "no email was sent");
  return JSON.parse(mail.body).from;
}

test("the default sender is leads@citability.dev", () => {
  assert.equal(DEFAULT_NOTIFY_FROM, "leads@citability.dev");
});

test("with LEAD_NOTIFY_FROM unset, the alert is sent from the default", async () => {
  assert.equal(await sentFrom({}), "leads@citability.dev");
});

test("LEAD_NOTIFY_FROM, when set, is the sender", async () => {
  assert.equal(await sentFrom({ LEAD_NOTIFY_FROM: "Fowned leads <leads@fowned.live>" }), "Fowned leads <leads@fowned.live>");
});
