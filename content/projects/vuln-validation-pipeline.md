---
title: "AI-assisted vulnerability validation & purple team pipeline"
date: 2026-06-30
side: "purple"
summary: "From CVE to evidence-based verdict: asset matching, reachability, controlled exploitation and detection validation with Wazuh."
tags: ["purple-team", "vulnerability-management", "wazuh"]
---
A pipeline I supervised in 2026.

## Flow

CVE → affected asset → applicability check → reachability → controlled validation → evidence → telemetry → verdict

## Key pieces

- CVE intelligence from NVD, CISA KEV and OSV.dev, matched deterministically against the software inventory
- AI-assisted analysis with a **human approval gate** before any exploitation
- Isolated multi-VM environment with out-of-band verification, evidence collection and snapshot rollback
- Wazuh correlation to check whether each validated attack was actually detected

> Add: pipeline diagram and one sample verdict (sanitized).
