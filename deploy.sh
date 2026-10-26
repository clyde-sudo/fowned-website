#!/usr/bin/env sh
# Production deploy for fowned.live. The ONLY supported way to deploy.
#
# Why this exists: `wrangler pages deploy --branch=main` labels ANY upload as
# production "main", whatever git branch it came from. On 2026-09-10 a deploy of
# upstream/main replaced a deploy of an unmerged local branch, and nine commits
# (guide links, menu fix, Sprint price, GA4) vanished from the live site with
# every deploy still reading "main". Production is now only ever built from a
# clean checkout of upstream/main, so the last deploy can never drop work.
set -eu
cd "$(dirname "$0")"

git fetch -q upstream main
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "refuse: not on main (merge your branch via PR first)"; exit 1; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "refuse: tracked changes are uncommitted"; exit 1; }
[ "$(git rev-parse HEAD)" = "$(git rev-parse upstream/main)" ] || { echo "refuse: main is not upstream/main (pull or push first)"; exit 1; }

BOOKING_URL=https://calendly.com/clyde-thrulead/30min SITE_ORIGIN=https://fowned.live node build.mjs
npx wrangler pages deploy dist --project-name=fowned --branch=main --commit-hash="$(git rev-parse HEAD)"

# The CDN answers crawlers before robots.txt is ever read. Cloudflare's AI bot
# policy refused GPTBot, ClaudeBot and the other training crawlers while
# robots.txt said Allow, and no audit noticed for the life of the site. Every
# deploy now fetches the live site as each crawler. A failure here means the
# site is live but a crawler is refused: fix it in Cloudflare, not in this repo.
sleep 10
node tools/crawler-access.mjs fowned.live
