# Image tracking

Where every non-generated image on the site comes from and what it's used for.
Update this whenever you add, replace or remove an image.

## content/writeups/sherlock-teamwork/
Source: Notion export, "Challenge: Sherlock - TeamWork" page, exported to
C:\Users\medba\Downloads\Pictures (numbered from 0, in page order).

| File | Shows |
|---|---|
| sherlock-01.png | WHOIS: developingdreams.site creation date |
| sherlock-02.png | ATT&CK T1583.001 (Acquire Infrastructure: Domains) |
| sherlock-03.png | Archived developingdreams.site homepage |
| sherlock-04.png | X/Twitter icon → company profile link |
| sherlock-05.png | ATT&CK T1585.001 (Establish Accounts: Social Media) |
| sherlock-06.png | Archived site showing game name "DeTankWar" |
| sherlock-07.png | Downloading the beta release zip |
| sherlock-08.png | Extracting password-protected archive, sha256sum |
| sherlock-09.png | VirusTotal result for the hash |
| sherlock-10.png | ATT&CK T1608.001 (Stage Capabilities: Upload Malware) |
| sherlock-11.png | Microsoft blog excerpt naming PuTTY |
| sherlock-12.png | ATT&CK T1195.002 (Compromise Software Supply Chain) |
| sherlock-13.png | Datadog Security Labs: harthat-hash v1.3.3 |
| sherlock-14.png | C2 server IP evidence |
| sherlock-15.png | ATT&CK T1218.011 (Rundll32 proxy execution) |

## content/articles/cyber-threat-intelligence/
Source: Notion "Cyber Threat Intel (CTI)" page + the PDF export (images there
don't expire, unlike Notion's own image links).

| File | Shows |
|---|---|
| cti-threat-analysis-process.png | "Threat Analysis Process" infographic |
| cti-ukc.png | Unified Kill Chain: In / Through / Out circles |
| cti-diamond-model.png | Diamond Model diagram |

**Not included, on purpose:**
- Plain screenshots of the MITRE ATT&CK website UI (tactic/technique list pages) —
  low value once you can link straight to attack.mitre.org, and there were a lot of them.
- "Cybereason Cobalt Kitty - answers.pdf" and "ticket-473845 answers.pdf" — these are
  answer keys from a paid ATT&CK-mapping training course, not something to redistribute.

## static/img/cheatsheets/
| File | Shows |
|---|---|
| mft-offset.png | Hex-editor view of the MFT offset calculation (forensics cheat sheet, MFTECmd section). Source: Downloads\CaptureNotion.png |

## content/certs/*/ (certificate images)
Each certificate page shows every file named `certificate*` (png/jpg) in its folder.
Source: Downloads\Certifss (PDF, first page rendered to PNG).

| Folder | Files |
|---|---|
| crtp/ | certificate.png |
| ecpptv3/ | certificate.png |
| ejptv3/ | certificate.png |
| ecir/ | certificate.png |
| ccna/ | certificate-1.png, certificate-2.png, certificate-3.png (CCNA 1, 2, 3) |

The CTI certificate has no page on purpose: its card links straight to the arcX verify page.

## content/writeups/ — authored CTF challenge writeups (verbatim imports)
Source: cloned read-only from the author's own public repos
`github.com/Re4perZ3d/Securinets-Beginner-CTF-2025` and
`github.com/Re4perZ3d/CyberSparkCTF`. Each writeup's `index.md` body is the
unmodified README.md from that challenge's folder (front matter only added on
top); every `.png`/`.jpg` in the challenge folder was copied alongside it.
Non-image handout files (`.pcap`, `.rar`, `.txt`) were intentionally **not**
copied — they aren't referenced inline in the writeups and aren't needed to
display the page.

| Folder | Source repo / challenge | Images |
|---|---|---|
| intro-to-volatility/ | Securinets-Beginner-CTF-2025 / IntroToVolatility | Screenshot_16–22.png |
| obfuscated/ | Securinets-Beginner-CTF-2025 / Obfuscated | Screenshot_13–15.png |
| punkvania/ | Securinets-Beginner-CTF-2025 / PunkVania | Screenshot_28–34.png |
| red-penguin/ | Securinets-Beginner-CTF-2025 / RedPenguin | none (README has no images) |
| solarwinds-campaign/ | Securinets-Beginner-CTF-2025 / SolarWinds | Screenshot_23–27.png |
| vigenere/ | Securinets-Beginner-CTF-2025 / Vigenère | Screenshot_11–12.png |
| arcane-door/ | CyberSparkCTF / ArcaneDoor | none (README has no images) |
| backdoor/ | CyberSparkCTF / Backdoor | none (README has no images) |
| discord-bot/ | CyberSparkCTF / DiscordBadyyyy | Screenshot_1547–1553.png |
| hello/ | CyberSparkCTF / Hello | Screenshot_1555–1562.png |
| magic-bytes/ | CyberSparkCTF / MagicBytes | Screenshot_1542–1545.png, Screenshot_1554.png |
