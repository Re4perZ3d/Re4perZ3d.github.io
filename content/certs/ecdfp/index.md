---
title: "eCDFP — Certified Digital Forensics Professional"
date: 2026-11-21
side: "blue"
issuer: "INE"
issued: "November 2026"
verify: "https://certs.ine.com/3f53ee0b-feaf-4c53-8050-74433b279dd6#acc.wqPEpUSo"
summary: "A hands-on digital-forensics certification: acquiring, examining and reporting on evidence from Windows endpoints end-to-end, from disk and memory through to the attacker timeline."
tags: ["digital-forensics", "dfir", "windows-forensics", "certification"]
---
eCDFP is INE's practical digital-forensics certification. Instead of multiple-choice theory, you're handed a compromised Windows environment and have to work it the way a real DFIR engagement goes: acquire, examine, correlate, and produce a report that stands up.

## What I learned

- **Forensically sound acquisition**: imaging disk and memory the right way, keeping chain of custody and hash integrity intact so the evidence survives scrutiny later.
- **Windows artifact analysis**: pulling execution evidence from Prefetch, Amcache, Shimcache, Jump Lists and the registry to reconstruct what ran, when and by whom.
- **NTFS and filesystem forensics**: reading the MFT, USN journal, $LogFile and shadow copies to recover deletions, see anti-forensics, and spot what an attacker tried to hide.
- **Memory forensics with Volatility**: pulling processes, network connections, injected code and credentials from a RAM capture to catch what disk alone misses.
- **Timeline building and reporting**: fusing host, memory and log evidence into one defensible timeline, then writing it up so a non-technical stakeholder can act on it.

## Why it matters to my work

eCDFP sits directly on top of what I do in the SOC: when an alert is real, the investigation lives or dies on the forensic evidence behind it. For a SOC analyst who wants to own the full attack → detect → investigate loop, this is the piece that makes the investigation step first-hand instead of outsourced.
