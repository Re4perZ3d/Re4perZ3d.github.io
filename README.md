# re4perz3d.github.io

Personal site of Re4perZ3d, built with Hugo and a custom terminal theme.

## Go live (once)

1. On GitHub, create a **public** repo named exactly `Re4perZ3d.github.io`.
2. Upload these files (or `git init`, `git add .`, `git commit -m "init"`, `git push`).
3. Repo **Settings → Pages → Source: GitHub Actions**.
4. Wait ~1 minute (Actions tab), then open https://re4perz3d.github.io

## Before publishing

- Add `static/resume.pdf` (use a version **without** your phone number).
- Put your HTB profile link in `hugo.toml` → `hackthebox`.
- Update HTB stats and certs in `data/stats.yaml`.

## Write a post

```bash
hugo new writeups/htb-machine-name.md   # or research/, projects/, cheatsheets/
```

Front matter:

- `side`: `red` | `blue` | `purple` | `intel` (the colored tag in listings)
- `tags`: e.g. `["active-directory", "dfir"]`
- `draft: false` when it's ready

Images: put them next to the post (`content/writeups/my-post/index.md` + `shot.png`) and use `![alt](shot.png)`.

## Preview locally

Install Hugo extended, then `hugo server` and open http://localhost:1313

## Rules for content

- HTB: retired machines/Sherlocks only.
- No employer or client data.
- No certification exam or course-lab content.

## Personalize

- The emblem/favicon live in `static/img/` (`icon-512.png`, `favicon.png`). Swap them to change the logo.
- CTF photos: drop any images into `assets/img/ctf/` — the gallery auto-catalogs them with thumbnails and a lightbox. Optional captions in `data/gallery.yaml` (keyed by filename).
- Certs, CTF wins and HTB stats are data — edit `data/stats.yaml`. Projects shown on the home page: `data/projects.yaml`.

## Articles

`hugo new articles/my-article.md` (or a folder `articles/my-article/index.md` with images alongside). Same front matter as writeups; `side: intel` gives the yellow tag.

## Share buttons

Writeups and articles get a `$ share --to` row automatically (LinkedIn, X, copy link) — nothing to configure.

## Visual effects

- Background: `static/img/bg-wallpaper.jpg` (your RZ emblem art), dimmed with `.bg-overlay` for text readability. Matrix rain draws on top in `static/js/matrix.js`.
- Terminal lives at the TOP of every page now (`layouts/_partials/terminal.html`), not the footer.
- `static/js/effects.js`: periodic glitch flicker on the home banner, a "decrypt" scramble-in animation for section headings on scroll, and mouse-parallax tilt on the hero emblem. All respect prefers-reduced-motion.
- Type `matrix` in the terminal for a temporary intense burst of the rain.

## Certificates

Cards come from `data/stats.yaml` (`certs`). A card with `page: slug` opens `content/certs/<slug>/`; a card with only `url` links straight to the verify page. On a cert page: front matter `verify:` adds the Verify button, and any `certificate*.png` in the folder is shown at the top.

## HTB stats auto-update

`.github/workflows/htb-stats.yml` runs daily (and can be triggered manually
from the Actions tab) to refresh the `htb:` block in `data/stats.yaml`
straight from the public profile page, instead of editing it by hand.

It needs two things to work:
1. **Public Profile** turned on in HTB account settings (Settings → Profile),
   otherwise the page shows nothing to scrape and the run is a no-op.
2. The scraper (`scripts/update-htb-stats.py`) uses Playwright to open
   `https://app.hackthebox.com/profile/<id>` and read the stat numbers off
   the rendered page by matching their labels (Rank, Machines, Sherlocks,
   Challenges…). It was written without the ability to load that page from
   the sandbox that built it, so the label patterns are a best guess —
   **run it once locally (or via `workflow_dispatch`) and check the diff
   before trusting the daily schedule**, and adjust the regexes near the
   top of the script if a stat doesn't update correctly.

The `season 9` row is left alone by the script (HTB season numbers/names
change periodically) — update that one by hand when a new season starts.
If you'd rather not run a browser-based scraper on a schedule, the
fallback is still the old way: edit `data/stats.yaml` by hand.
