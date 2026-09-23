#!/bin/bash
# Sync static HTML pages from osaka-timeline repo into toursync/public/
# Run from the toursync repo root: bash scripts/sync-timeline.sh

set -euo pipefail

OSAKA_TIMELINE="${OSAKA_TIMELINE_DIR:-$(dirname "$0")/../../osaka-timeline}"
TOURSYNC_PUBLIC="$(dirname "$0")/../public"

if [ ! -d "$OSAKA_TIMELINE" ]; then
  echo "ERROR: osaka-timeline directory not found at $OSAKA_TIMELINE"
  echo "Set OSAKA_TIMELINE_DIR env var or run from the toursync repo."
  exit 1
fi

echo "Syncing from: $OSAKA_TIMELINE"
echo "Syncing to:   $TOURSYNC_PUBLIC"

# toursync/public is the source of truth for HTML deployed to osakacastletours.com.
# Only pull CSS/images from the sibling repo so local HTML fixes (NCP CTAs, JSON-LD,
# Home links) are not overwritten on deploy.

# CSS
echo "→ Copying CSS..."
mkdir -p "$TOURSYNC_PUBLIC/css"
cp "$OSAKA_TIMELINE"/css/styles.css "$TOURSYNC_PUBLIC/css/"

# Root-level .webp images
echo "→ Copying root-level images..."
cp "$OSAKA_TIMELINE"/*.webp "$TOURSYNC_PUBLIC/"



# Logo: convert PNG → WebP and copy to public/images/
if [ -f "$OSAKA_TIMELINE/images/osaka-history-investigations.png" ]; then
  echo "→ Converting logo PNG → WebP..."
  mkdir -p "$TOURSYNC_PUBLIC/images"
  node -e "
    const sharp = require('sharp');
    sharp('$OSAKA_TIMELINE/images/osaka-history-investigations.png')
      .webp({ quality: 80 })
      .toFile('$TOURSYNC_PUBLIC/images/osaka-history-investigations.webp')
      .then(() => console.log('  ✓ Logo converted'))
      .catch(e => { console.error('  ✗ Logo conversion failed:', e.message); process.exit(1); });
  "
fi

# Fix before-the-castle path (it's in articles/ subdir in osaka-timeline)
if [ -f "$OSAKA_TIMELINE/articles/before-the-castle-prehistoric-osaka.html" ] && [ ! -f "$TOURSYNC_PUBLIC/before-the-castle-prehistoric-osaka.html" ]; then
  echo "→ Fixing before-the-castle path..."
  cp "$OSAKA_TIMELINE/articles/before-the-castle-prehistoric-osaka.html" "$TOURSYNC_PUBLIC/"
fi

# Articles: only copy files that don't exist yet (do not clobber local fixes)
if [ -d "$OSAKA_TIMELINE/articles" ]; then
  echo "→ Syncing articles (new files only)..."
  mkdir -p "$TOURSYNC_PUBLIC/articles"
  for f in "$OSAKA_TIMELINE"/articles/*.html; do
    base=$(basename "$f")
    if [ ! -f "$TOURSYNC_PUBLIC/articles/$base" ]; then
      cp "$f" "$TOURSYNC_PUBLIC/articles/"
    fi
  done
fi

echo "✓ Sync complete (HTML not overwritten)."
echo "  EN HTML: $(ls "$TOURSYNC_PUBLIC"/*.html | wc -l | tr -d ' ') files"
echo "  JA HTML: $(ls "$TOURSYNC_PUBLIC"/ja/*.html | wc -l | tr -d ' ') files"
echo "  Images:  $(ls "$TOURSYNC_PUBLIC"/*.webp | wc -l | tr -d ' ') files"
