#!/usr/bin/env bash
#
# Proves the AUDIT path end to end: a visitor finishes the on-site audit, and
# every person on LEAD_NOTIFY_TO gets an alert that still carries the findings
# the visitor saw.
#
# This exists because the contact form and the audit form post DIFFERENT shapes
# to the same endpoint. The audit sends auditCompleted + findings and sends no
# name and no company. Proving the contact form works proves nothing about the
# audit, which is the path the site actually sells.
#
# Checks, and each one has failed somewhere before:
#   1. the request is accepted                 (a 400 means the shape drifted)
#   2. the row lands in D1                     (the sink is authoritative)
#   3. the findings survive into the row       (an audit alert with no findings
#                                               is just a bare email address)
#   4. Resend says delivered, not just sent    (a send is not a delivery)
#   5. EVERY configured recipient is on it     (Clyde was silently missing for
#                                               the first two weeks of leads)
#   6. the body renders the audit block        (the fields existed but had never
#                                               once been rendered in production)
#
# Usage:  tools/notify-test.sh [https://fowned.live]
# Needs:  RESEND_API_KEY in the environment, or Doppler configured.
# Leaves: one row in D1 marked status=TEST, so the real pipeline stays clean.
set -euo pipefail

BASE="${1:-https://fowned.live}"
EXPECT_TO="${EXPECT_TO:-chudi@thirdi.co clyde@thirdi.co}"
STAMP="audit-test-$(date +%Y%m%d-%H%M%S)"
F1="No llms.txt"
F2="Missing Organization schema"

KEY="${RESEND_API_KEY:-$(doppler secrets get RESEND_API_KEY --plain -p personal-shared -c prd)}"
[ -n "$KEY" ] || { echo "FAIL: no RESEND_API_KEY"; exit 1; }
resend() { curl -sS -H "Authorization: Bearer $KEY" "$@"; }   # never echoed

fail() { echo "FAIL: $*"; exit 1; }
pass() { echo "  ok   $*"; }

echo "==> 1. submitting an audit-shaped lead to $BASE"
RES=$(curl -sS -X POST "$BASE/api/lead" -H 'Content-Type: application/json' -d "{
  \"contact\": \"$STAMP@example.com\",
  \"domain\": \"$STAMP.example.com\",
  \"auditCompleted\": true,
  \"findings\": [\"$F1\", \"$F2\"],
  \"attribution\": {\"source\": \"NOTIFY_TEST\", \"landingPath\": \"/audit\"}
}")
echo "$RES" | grep -q '"ok":true' || fail "endpoint rejected the audit shape: $RES"
pass "accepted"

echo "==> 2. reading the row back out of D1"
sleep 3
ROW=$(npx --yes wrangler d1 execute fowned-leads --remote --json --command \
  "SELECT id, audit_completed, key_audit_findings, notified, notify_error, source
     FROM leads WHERE contact = '$STAMP@example.com'" 2>/dev/null \
  | python3 -c 'import sys,json;t=sys.stdin.read();t=t[t.index(chr(91)):];r=json.loads(t)[0]["results"];print(json.dumps(r[0]) if r else "")')
[ -n "$ROW" ] || fail "no row in D1: the lead was accepted and then lost"
pass "stored"

python3 - "$ROW" "$F1" "$F2" <<'PY' || exit 1
import json, sys
row, f1, f2 = json.loads(sys.argv[1]), sys.argv[2], sys.argv[3]
def check(cond, msg):
    print(("  ok   " if cond else "FAIL: ") + msg)
    if not cond: sys.exit(1)
check(row["audit_completed"] == 1, "row is flagged as an audit")
finds = json.loads(row["key_audit_findings"] or "[]")
check(f1 in finds and f2 in finds, f"findings survived into the row: {finds}")
check(row["notified"] == 1, f"notification recorded as sent (error={row['notify_error']})")
PY

echo "==> 3. asking Resend what actually happened to that email"
SUBJ="Fowned lead: $STAMP.example.com"
for i in $(seq 1 10); do
  EMAIL=$(resend "https://api.resend.com/emails" | python3 -c "
import sys, json
for e in json.load(sys.stdin)['data']:
    if e.get('subject') == '''$SUBJ''': print(json.dumps(e)); break
")
  [ -n "$EMAIL" ] && break
  sleep 4
done
[ -n "$EMAIL" ] || fail "Resend has no record of an email for $SUBJ"

ID=$(echo "$EMAIL" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
BODY=$(resend "https://api.resend.com/emails/$ID")

python3 - "$BODY" "$EXPECT_TO" "$F1" "$F2" <<'PY' || exit 1
import json, sys
e = json.loads(sys.argv[1]); want = sys.argv[2].split(); f1, f2 = sys.argv[3], sys.argv[4]
def check(cond, msg):
    print(("  ok   " if cond else "FAIL: ") + msg)
    if not cond: sys.exit(1)
check(e.get("last_event") == "delivered", f"delivered, not merely sent (state={e.get('last_event')})")
to = [a.lower() for a in e.get("to") or []]
missing = [a for a in want if a.lower() not in to]
check(not missing, f"reached every recipient: {', '.join(to)}")
frm = e.get("from", "")
check("citability" not in frm.lower(), f"sender does not leak the engine: {frm}")
text = e.get("text") or ""
check("completed on site" in text, "body says the audit was completed")
check(f1 in text and f2 in text, "body lists the findings the visitor saw")
PY

echo "==> 4. marking the row as a test so it does not look like a real lead"
npx --yes wrangler d1 execute fowned-leads --remote --json --command \
  "UPDATE leads SET status='TEST' WHERE contact='$STAMP@example.com'" >/dev/null 2>&1
pass "row marked TEST"

echo
echo "PASS: an audit submission reaches every recipient with its findings intact."
