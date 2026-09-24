---
title: "Getting Started with Cyber Threat Intelligence (CTI)"
date: 2025-07-15
side: "intel"
summary: "A beginner's guide to CTI from someone learning the field: what it is, the four intelligence types, the CTI lifecycle, and the frameworks that tie it together — ATT&CK, the kill chains, the Diamond Model and ENISA's 2024 landscape."
tags: ["cti", "mitre-attack", "threat-intel", "learning"]
---
New to Cyber Threat Intelligence, I soon learned why it matters — not just for large enterprises, but for any organisation defending against ever-evolving threats. This is my beginner's breakdown of CTI: what it is, what it's used for, its main categories, and how to read a tactical threat-intelligence report, written as someone currently studying the field.

## What is threat intelligence?

At its core, **threat intelligence** is about turning raw data into useful insight. It's the collection, analysis and interpretation of information about potential or real threats to an organisation, so security teams can make faster, wiser decisions — moving from reactive defence to proactive protection.

The way I frame it: instead of waiting for someone to show up at your door, CTI tells you in advance that they're going to try, and how to stop them before they get there.

## What is CTI used for?

CTI is used to **predict, identify and respond to threats** before the damage is done. It lets security teams:

- Understand attacker behaviour
- Monitor campaigns in real time
- Spot suspicious activity early
- Put defensive measures in place ahead of time

One line stuck with me during my research, from François Deruty (COO of Sekoia.io):

> "To give you an image: I will reinforce my front door with locks and cameras. These extra layers help me deal with actors trying to force it open every day. CTI is the detection mechanism that lets me know when someone is trying to enter my home — it's all about anticipation."

At the cyber layer, those locks and cameras are IP blacklists, quarantined files, and detection rules based on attack patterns. A CTI system aggregates all of it in one place so it can be understood at a glance and — most importantly — acted on in real time.

## The four types of threat intelligence

### Strategic
- **Audience:** executives, decision-makers
- **Focus:** who is behind an attack, and why
- **Example:** a report on the long-term activity of APT28 (Fancy Bear) — motives, past operations, likely future targets.

### Operational
- **Audience:** mid-level managers, security leaders
- **Focus:** the tactics and infrastructure used in a campaign
- **Example:** a report describing a REvil ransomware campaign — how they get in (phishing), move laterally, and deliver the payload.

### Tactical
- **Audience:** SOC analysts, defenders
- **Focus:** immediate, actionable detail — how to detect and respond right now
- **Example:** a list of malicious IPs, URLs and file hashes tied to a REvil attack, used to update detections or block traffic.

### Technical
- **Audience:** security engineers, EDR/SIEM teams
- **Focus:** detailed technical data — the exact nature of a threat and when it was seen
- **Example:** phishing infrastructure — specific IPs, email content, payload hashes and timestamps.

## How I learned to read a tactical report

The first tactical CTI report I saw was intimidating — full of hashes, IPs, domains, malware indicators and odd terms like "mutex." Taken systematically, it started to make sense.

What sped up my learning was **Capture The Flag** — especially the Threat Intelligence Sherlocks on Hack The Box, and threat-intel labs on CyberDefenders that replicate real attack scenarios where you extract the IOCs, identify the attacker's TTPs, and read the reports. I also authored several forensics challenges for a beginner-friendly CTF, including one focused on threat intelligence — which forced me to practise report reading and IOC extraction in a guided context.

## The CTI lifecycle

Threat intelligence runs as a cyclical, six-stage process that turns raw data into action:

1. **Planning & Direction** — define the intelligence requirements, stakeholders and priority threats. Clear goals give purpose to everything else.
2. **Collection** — gather raw data from logs, threat feeds, OSINT, internal sensors, partners and dark-web sources.
3. **Processing** — clean, normalise, translate and filter: dedupe, decrypt, categorise, and prepare IOCs for analysis.
4. **Analysis & Production** — enrich the data, map TTPs to frameworks like MITRE ATT&CK, extract IOCs, assess relevance, and produce usable intelligence.
5. **Dissemination** — deliver the finished intelligence to its audience in the right format: strategic summaries, technical advisories, or feeds into SIEMs and firewalls.
6. **Feedback** — consumers report back on usefulness and accuracy, driving refinement for the next cycle.

Why it matters: the cycle keeps intelligence relevant, focuses limited resources on the threats that matter most, and connects analysts with consumers so the intel stays actionable and keeps improving.

## The frameworks that tie it together

### MITRE ATT&CK

ATT&CK is a **behaviour-focused** framework, not just a list of indicators. Its building blocks are **tactics** (the adversary's goal — *why*), **techniques and sub-techniques** (*how* they achieve it), plus **mitigations**, **data sources & detections**, and **groups & software**. Mapping a report to ATT&CK follows five steps: find the behaviour, research it, translate it into a tactic, identify the technique, then compare your results with other analysts to hedge bias. The hardest part is usually identifying the exact technique — and the biggest trap is mapping what you *remember* instead of what actually fits.

### Threat modelling

Thinking like an attacker before they act. OWASP frames it as four questions: **What are we building? What can go wrong? What are we doing to defend it? Are the defences working?** You don't need to be a system architect to start — even a small lab or a CTF challenge works: identify the valuable assets, how they could be attacked, and what would stop it.

### The Unified Kill Chain

Designed by Paul Pols, the UKC maps **18 phases** across three high-level goals — getting **In** (recon → resource development → delivery → social engineering → exploitation → persistence → defense evasion → C2), moving **Through** (pivoting → discovery → privilege escalation → execution → credential access → lateral movement), and going **Out** (collection → exfiltration → impact → objectives). It's the most complete of the models and great for building attack timelines.

### The Cyber Kill Chain

Lockheed Martin's original 7-step model: reconnaissance → weaponization → delivery → exploitation → installation → command & control → actions on objectives. Older and perimeter-focused, but still a great mental model — break one link and the whole attack can fail.

### The Diamond Model

Developed by Caltagirone, Pendergast and Betz, it dissects an intrusion through four vertices — **Adversary, Capability, Infrastructure, Victim** — enriched with meta-features (timestamp, phase, methodology, result, direction, resources). Its strength is **attribution and analytic pivoting**: start from one point (say an IP) and pivot around the graph to uncover related adversaries, victims or capabilities.

Each framework complements the others. Integrated, they give a fuller picture of attacker behaviour and where to focus defences.

### ENISA Threat Landscape 2024

ENISA's annual flagship report (12th edition, covering July 2023–June 2024) highlights the prime threats shaping Europe: threats against availability (DDoS), ransomware, threats against data, malware, social engineering, information manipulation, and supply-chain attacks. It logged roughly **2,945 incidents** in the EU — up from ~2,360 the year before — with hacktivism rising sharply around the European Parliament elections, and finance the third most targeted sector. For a CTI learner it's a real-world snapshot you can cross-reference against ATT&CK, the Diamond Model and the kill chains.

## Final thoughts

This is where I keep everything I've been learning as I explore CTI. If you're also starting out as a junior analyst: it's fine to feel overwhelmed. Work one report at a time, build a workflow, and you'll find your pace. We're all learning together.

### References

- [EC-Council — What is Cyber Threat Intelligence?](https://www.eccouncil.org/cybersecurity-exchange/threat-intelligence/what-is-cyber-threat-intelligence/)
- [Hack The Box Academy — CTI Fundamentals](https://academy.hackthebox.com/module/214/section/2281)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [OWASP Threat Modeling Project](https://owasp.org/www-project-threat-model)
- [Unified Kill Chain](https://www.unifiedkillchain.com/)
- [Lockheed Martin — Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html)
- [EC-Council — Diamond Model of Intrusion Analysis](https://www.eccouncil.org/cybersecurity-exchange/ethical-hacking/diamond-model-intrusion-analysis)
- [ENISA Threat Landscape 2024](https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024)
