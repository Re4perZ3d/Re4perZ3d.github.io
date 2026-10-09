#!/usr/bin/env python3
"""
Fetch Mohamed's public Hack The Box profile stats and update data/stats.yaml.

HTB's profile page (https://app.hackthebox.com/profile/<id>) is a client-side
rendered Vue app with no documented public JSON API, so this script drives a
headless browser, waits for the profile to render, and reads the numbers
straight off the page text. That makes it resilient to not knowing HTB's
internal API, but it DOES depend on the profile page's wording/labels — if
HTB changes its profile layout, the regexes below may need updating.

Requires the "Public Profile" setting to be ON for this HTB account
(HTB Settings -> Profile -> make profile public), otherwise the page will
show a "this profile is private" message instead of stats and the script
will exit without making changes.

Usage:
    python3 scripts/update-htb-stats.py [--profile-id 1720033] [--dry-run]

Run via Playwright (pip install playwright && playwright install chromium).
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATS_YAML = ROOT / "data" / "stats.yaml"

DEFAULT_PROFILE_ID = "1720033"  # Re4perZ3d — https://app.hackthebox.com/profile/1720033

# Maps the stat `key` already used in data/stats.yaml -> a list of regexes
# tried in order against the rendered page's visible text. First match wins.
# NOTE: these patterns are a best-effort starting point written without being
# able to reach hackthebox.com from the sandbox that authored this script.
# Verify each one against the live profile page (e.g. with Playwright's
# codegen/inspector, or just view-source after letting the page render) and
# adjust before trusting the scheduled run to auto-commit.
PATTERNS = {
    "rank":       [r"Rank\s*\n?\s*([A-Za-z ]+?)\s*\n"],
    "level":      [r"(?:Level|Rank Progress)\s*\n?\s*(\d{1,3})\b"],
    "machines":   [r"(\d+)\s*\n?\s*(?:Machines|User Owns|System Owns)\b"],
    "sherlocks":  [r"(\d+)\s*\n?\s*Sherlocks?\b"],
    "challenges": [r"(\d+)\s*\n?\s*Challenges?\b"],
}


def scrape(profile_id: str) -> dict:
    from playwright.sync_api import sync_playwright

    url = f"https://app.hackthebox.com/profile/{profile_id}"
    found = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=45000)
        # The Vue app needs a beat after networkidle to paint stat widgets.
        page.wait_for_timeout(3000)
        body_text = page.inner_text("body")
        browser.close()

    if re.search(r"private", body_text, re.I) and not re.search(r"Rank", body_text, re.I):
        print("Profile looks private or stats not visible — enable "
              "'Public Profile' in HTB settings. No changes made.", file=sys.stderr)
        return {}

    for key, patterns in PATTERNS.items():
        for pat in patterns:
            m = re.search(pat, body_text)
            if m:
                found[key] = m.group(1).strip()
                break
    return found


def update_yaml(new_values: dict, dry_run: bool = False) -> bool:
    text = STATS_YAML.read_text(encoding="utf-8")
    changed = False
    for key, value in new_values.items():
        # Matches one htb: row line, e.g.: - { key: "rank", value: "Prodigy", color: "green" }
        pat = re.compile(
            r'(- \{ key: "' + re.escape(key) + r'",\s*value: ")([^"]*)(")'
        )
        m = pat.search(text)
        if not m:
            continue
        old_value = m.group(2)
        if old_value == str(value):
            continue
        text = pat.sub(lambda mm: mm.group(1) + str(value) + mm.group(3), text, count=1)
        print(f"{key}: {old_value!r} -> {value!r}")
        changed = True

    if changed and not dry_run:
        STATS_YAML.write_text(text, encoding="utf-8")
    elif changed:
        print("(dry run — not writing)")
    else:
        print("No stat changes detected.")
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile-id", default=DEFAULT_PROFILE_ID)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    values = scrape(args.profile_id)
    if not values:
        print("No stats scraped; leaving data/stats.yaml untouched.")
        sys.exit(0)

    changed = update_yaml(values, dry_run=args.dry_run)
    # Exit code 0 either way; the workflow checks `git status` to decide
    # whether to commit, so a no-op run is not a failure.
    sys.exit(0)


if __name__ == "__main__":
    main()
