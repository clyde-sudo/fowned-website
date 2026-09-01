#!/usr/bin/env sh
# Assemble the publishable site into dist/.
#
# Cloudflare Pages direct-upload publishes whatever directory it is handed, and
# this repo tracks docs/ and legacy-site/ alongside the site. Deploying the repo
# root would put both on the public internet, so the deployable surface is built
# by allowlist here rather than trimmed by exclusion later.
set -eu
cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist
cp index.html dist/
cp -R css js images dist/
cp _headers dist/
echo "dist/ built: $(find dist -type f | wc -l | tr -d ' ') files"
