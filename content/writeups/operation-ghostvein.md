---
title: "Operation GhostVein: Linux DFIR"
date: 2026-09-23
side: "blue"
summary: "Reconstructing an OFBiz exploitation, PAM backdoor, SSH pivot and DNS exfiltration from host artifacts and PCAPs."
tags: ["dfir", "linux", "authored"]
---
A DFIR challenge I authored for CyberTEK: a multi-stage attack against two Linux servers, reconstructed from host artifacts, network captures and staged malware.

## Attack chain

| Stage | Activity | MITRE ATT&CK |
|---|---|---|
| Initial access | Apache OFBiz exploitation (CVE-2024-38856) | T1190 |
| Execution | Webshell and reverse shell | T1059 |
| Credential access / persistence | PAM backdoor | T1556.003 |
| Persistence | Cron job | T1053.003 |
| Lateral movement | SSH pivot | T1021.004 |
| Exfiltration | DNS tunneling | T1048.003 |

## Full writeup

The complete walkthrough, evidence package and questions are on [GitHub](https://github.com/Re4perZ3d/CyberTEK-Writeup).

> Replace this summary with the full writeup when you migrate it here.
