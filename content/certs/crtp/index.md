---
title: "CRTP — Certified Red Team Professional"
date: 2026-07-01
side: "red"
issuer: "Altered Security"
issued: "July 2026"
verify: "https://www.credential.net/d709c3d2-d7ed-4789-b4f5-b7da514b6350#acc.Tg1Cyh2l"
summary: "Hands-on Active Directory attack and defense: enumeration, privilege escalation, persistence and abusing trusts across a multi-domain forest."
tags: ["active-directory", "red-team", "certification"]
---
CRTP is a practical Active Directory certification. Everything happens inside a live multi-domain Windows environment, so the learning is by doing, not by memorising.

## What I learned

- **Enumerating a domain** with PowerView and BloodHound: users, groups, ACLs, trusts and the shortest path to a privileged account.
- **Privilege escalation** locally and across the domain, including Kerberos abuse such as Kerberoasting and delegation.
- **Lateral movement and persistence** with Rubeus, Mimikatz and Impacket, and what each technique leaves behind.
- **Trusts and forests**: moving between domains and across a forest, and why controls like SID filtering matter.
- **Working around defenses** such as AMSI and restricted PowerShell, and reading the detection side of every attack.

## Why it matters to my work

I work in a SOC, so the most valuable part was seeing each attack from both sides: how it is executed, then which Windows events and telemetry it produces. That is the attack → detect loop I try to practise, and it is the idea behind my [Active Directory cheat sheet](/cheatsheets/active-directory/).
