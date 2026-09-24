---
title: "Defensy — AI-assisted vulnerability validation & purple team pipeline"
date: 2026-08-15
side: "purple"
summary: "An autonomous pipeline that takes a CVE to an evidence-based verdict — asset matching, reachability, controlled exploitation and Wazuh detection validation, gated by human approval at every trust boundary."
tags: ["purple-team", "vulnerability-management", "wazuh", "ai"]
---
**Role:** I supervised (encadrant) this project, guiding two INSAT students through the design and build during their summer internship.

## The problem

Dozens of CVEs are published every day. The hard question is never "does a CVE exist for this software?" but "does this CVE actually affect *this* deployment, and is the vulnerable code reachable by an attacker?" — a slow, manual, expert task. Defensy automates the repetitive, verifiable parts of that chain without removing human judgement.

## Flow

CVE → affected asset → applicability check → reachability → controlled validation → evidence → telemetry → verdict

## How it works

- **Ingestion & matching** — CVEs from NVD and CISA KEV over a rolling window, matched exactly against a target's real software inventory (OSV.dev across eight ecosystems; verified CPE fingerprints for platform software). Transitive-only dependencies are routed as informational, never queued for exploitation.
- **Human-gated source transfer** — a match never triggers anything on its own. Source code moves to the lab only after explicit `sudo defensy-host approve-job`, through single-use, short-lived SSH keys, with quarantine, validation and SHA-256 receipts.
- **Two LLM agents** — a *research agent* reads the real published package source and the deployed handler to confirm the vulnerable path is actually reachable; an *exploitation agent* builds and verifies a real exploit against a cloned service, confirmed out-of-band. Runs on two independent providers (Google Gemini and OpenAI).
- **Isolated lab** — five systems across two isolated network segments, disposable sandbox restored from a golden snapshot before and after every test in a guaranteed cleanup block.
- **Purple-team correlation** — after each attempt, Wazuh is queried (read-only) to check whether the validated attack actually generated an alert — closing the loop between exploitation and detection coverage.

## Results

Run end-to-end against a real four-VM lab, two RCE vulnerabilities were confirmed and verified on both providers with out-of-band confirmation:

- **CVE-2025-43858** (OS command injection) — verified.
- **CVE-2026-55685** (prototype pollution → RCE) — verified.

A third match on the same service (**CVE-2026-42211**) was honestly classified *not exploitable*: the research agent read the deployed route, found it used its own merge function and never invoked the vulnerable deserialiser, and recorded the evidence instead of forcing a positive. The same service producing both a verified exploit and an honest not-exploitable verdict is the point — the agent distinguishes a reachable route from one that isn't.
