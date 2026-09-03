#!/usr/bin/env sh
# Announce fowned.live's URLs to the IndexNow network (Bing, Yandex, Seznam, Naver).
#
# RUN THIS AFTER A DEPLOY LANDS, never before. IndexNow is a request to come and
# fetch, so submitting URLs whose new content is not live yet just gets the old
# content re-read and burns the submission. The key-file check below exists to
# make that ordering mistake impossible rather than merely discouraged: the key
# is only reachable once the build that emitted it is actually published.
#
# Submitting an unchanged URL repeatedly is treated as spam by the endpoint, so
# this is a deploy-time action, not a cron.
set -eu
cd "$(dirname "$0")/.."

HOST=fowned.live
KEY=$(cat indexnow.key)
KEY_URL="https://$HOST/$KEY.txt"

# 1. The key must be live and must contain exactly the key. A submission with an
#    unreachable key file is rejected with a 403 that reads like a bad key.
served=$(curl -fsS "$KEY_URL") || { echo "FAIL: $KEY_URL is not reachable. Deploy first."; exit 1; }
[ "$served" = "$KEY" ] || { echo "FAIL: $KEY_URL served a different value than indexnow.key"; exit 1; }
echo "ok: key file live at $KEY_URL"

# 2. URLs come from the live sitemap, so this script can never announce a URL
#    the deployed site does not actually list.
urls=$(curl -fsS "https://$HOST/sitemap.xml" | sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p')
[ -n "$urls" ] || { echo "FAIL: no <loc> entries in the live sitemap"; exit 1; }
count=$(printf '%s\n' "$urls" | wc -l | tr -d ' ')
echo "submitting $count URLs"

payload=$(printf '%s\n' "$urls" | python3 -c '
import json,sys
urls=[l.strip() for l in sys.stdin if l.strip()]
print(json.dumps({"host":"'"$HOST"'","key":"'"$KEY"'",
                  "keyLocation":"'"$KEY_URL"'","urlList":urls}))')

code=$(printf '%s' "$payload" | curl -sS -o /tmp/indexnow.out -w '%{http_code}' \
  -X POST https://api.indexnow.org/IndexNow \
  -H 'Content-Type: application/json; charset=utf-8' --data-binary @-)

# 200 = accepted, 202 = accepted pending key validation. Anything else is a
# real failure and the body says which; do not treat a 4xx as "probably fine".
case "$code" in
  200|202) echo "IndexNow accepted ($code) for $count URLs" ;;
  *) echo "IndexNow FAILED: HTTP $code"; cat /tmp/indexnow.out; exit 1 ;;
esac
