#!/usr/bin/env python3
"""
AfterCall Website — Image Embedder
===================================
Run this script once after placing your screenshots in the images/ folder.
It replaces every  src="images/filename.png"  reference in index.html with
an inline base64 data URI, producing a single fully self-contained HTML file.

Usage:
    python3 embed_images.py

Output:
    index.html is updated in-place with all images embedded.
    A backup of the original is saved as index_backup.html.
"""

import base64, re, shutil, mimetypes
from pathlib import Path

SRC_FILE  = Path(__file__).parent / "index.html"
BACKUP    = Path(__file__).parent / "index_backup.html"
IMAGES_DIR = Path(__file__).parent / "images"

# ── Expected files and their friendly names (for progress display) ──
EXPECTED = {
    "logo.png":              "App logo",
    "dashboard.png":         "Home dashboard",
    "new-call.png":          "New Call type selection",
    "shift-detail.png":      "Shift detail (MED445)",
    "shift-debrief.png":     "Shift with debrief CTA",
    "my-calls-list.png":     "My Calls list",
    "my-calls-analytics.png":"My Calls analytics chart",
    "my-calls-stats.png":    "My Calls intervention stats",
    "call-detail.png":       "Call detail (cardiac arrest)",
    "journal-checkin.png":   "Journal check-in",
    "journal-wellness.png":  "Journal wellness chart",
    "guided-reflection.png": "Guided reflection",
    "community-feed.png":    "Community feed",
    "community-org.png":     "Station org (MED 445)",
    "trending.png":          "Trending EMS article",
    "skills.png":            "Skills donut chart",
    "home-skills.png":       "Home with skill momentum",
    # Dark mode screenshots
    "dashboard-dark.png":          "Home dashboard (dark mode)",
    "home-dark.png":               "Home with heatmap (dark mode)",
    "new-call-patient.png":        "New Call — patient assessment (dark)",
    "new-call-interventions.png":  "New Call — interventions (dark)",
    "my-calls-stats-dark.png":     "My Calls stats (dark mode)",
    "my-calls-analytics-dark.png": "My Calls analytics (dark mode)",
    "shift-calendar.png":          "Shift calendar view",
}

def to_data_uri(path: Path) -> str:
    mime, _ = mimetypes.guess_type(str(path))
    mime = mime or "image/png"
    data = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{data}"

def main():
    print("\n── AfterCall Image Embedder ──\n")

    if not SRC_FILE.exists():
        print(f"ERROR: {SRC_FILE} not found. Run this script from the website folder.")
        return

    html = SRC_FILE.read_text(encoding="utf-8")

    # Find all  src="images/..."  references
    pattern = re.compile(r'src="(images/[^"]+)"')
    refs = sorted(set(pattern.findall(html)))

    if not refs:
        print("No image references found in index.html.")
        return

    missing = []
    embedded = 0

    for ref in refs:
        img_path = Path(__file__).parent / ref
        if not img_path.exists():
            missing.append(ref)
            continue
        data_uri = to_data_uri(img_path)
        count = html.count(f'src="{ref}"')
        html = html.replace(f'src="{ref}"', f'src="{data_uri}"')
        filename = img_path.name
        label = EXPECTED.get(filename, filename)
        print(f"  ✓  {label:35s} ({count} reference{'s' if count>1 else ''})")
        embedded += 1

    if missing:
        print(f"\n  ⚠  Missing images (skipped):")
        for m in missing:
            fname = m.replace("images/", "")
            label = EXPECTED.get(fname, fname)
            print(f"       {label:35s}  →  save as  {m}")

    # Backup original, write new
    shutil.copy(SRC_FILE, BACKUP)
    SRC_FILE.write_text(html, encoding="utf-8")

    size_kb = SRC_FILE.stat().st_size // 1024
    print(f"\n  Done!  {embedded} image{'s' if embedded!=1 else ''} embedded.")
    print(f"  Output:  index.html  ({size_kb} KB, fully self-contained)")
    print(f"  Backup:  index_backup.html  (original with file references)\n")

    if missing:
        print(f"  Re-run after adding the missing images above.\n")

if __name__ == "__main__":
    main()
