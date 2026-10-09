#!/usr/bin/env python3
"""
Refresh the HTB counts in data/stats.yaml from the official HTB API (v4).

Auth: HTB App Token in the HTB_API_TOKEN environment variable (never written
to disk or printed). Stdlib only.

Updated rows: machines, sherlocks, challenges.
Left alone on purpose: rank, level (the API's rank/progress fields do not
match the values shown on the site) and the season row (manual edit).

Usage:
    HTB_API_TOKEN=... python3 scripts/update-htb-stats.py [--dry-run] [--debug]
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATS_YAML = ROOT / "data" / "stats.yaml"
API = "https://labs.hackthebox.com/api/v4"
PROFILE_ID = "1720033"

# key in stats.yaml -> (endpoint, path into the JSON response)
ENDPOINTS = {
    "machines":   (f"/user/profile/basic/{PROFILE_ID}", ("profile", "system_owns")),
    "sherlocks":  (f"/user/profile/progress/sherlocks/{PROFILE_ID}", ("profile", "challenge_owns", "solved")),
    "challenges": (f"/user/profile/progress/challenges/{PROFILE_ID}", ("profile", "challenge_owns", "solved")),
}


def fetch(endpoint, token):
    req = urllib.request.Request(API + endpoint, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "User-Agent": "personal-site-stats/1.0",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def dig(obj, path):
    for k in path:
        obj = obj[k]
    return obj


def update_yaml(values, dry_run):
    text = STATS_YAML.read_text(encoding="utf-8")
    changed = False
    for key, value in values.items():
        pat = re.compile(r'(- \{ key: "' + re.escape(key) + r'",\s*value: ")([^"]*)(")')
        m = pat.search(text)
        if not m or m.group(2) == str(value):
            continue
        text = pat.sub(lambda mm: mm.group(1) + str(value) + mm.group(3), text, count=1)
        print(f"{key}: {m.group(2)!r} -> {value!r}")
        changed = True
    if not changed:
        print("No stat changes detected.")
    elif dry_run:
        print("(dry run - not writing)")
    else:
        STATS_YAML.write_text(text, encoding="utf-8")
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--debug", action="store_true", help="print raw JSON per endpoint")
    args = ap.parse_args()

    token = os.environ.get("HTB_API_TOKEN")
    if not token:
        sys.exit("HTB_API_TOKEN is not set")

    cache, values = {}, {}
    for key, (endpoint, path) in ENDPOINTS.items():
        try:
            if endpoint not in cache:
                cache[endpoint] = fetch(endpoint, token)
                if args.debug:
                    print(f"== {endpoint}\n{json.dumps(cache[endpoint])[:2000]}")
            val = dig(cache[endpoint], path)
        except Exception as e:  # leave stats untouched on any failure
            sys.exit(f"{key}: failed ({type(e).__name__}: {e}); no changes made")
        if not isinstance(val, int) or val < 0:
            sys.exit(f"{key}: unexpected value {val!r}; no changes made")
        values[key] = val
    update_yaml(values, args.dry_run)


if __name__ == "__main__":
    main()
