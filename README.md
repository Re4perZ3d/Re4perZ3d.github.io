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
