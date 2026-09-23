---
title: "Improving Threat Intelligence in a SOC"
date: 2025-06-30
side: "intel"
summary: "An open-source SOC that automates alert-to-context: Wazuh, Shuffle and OpenCTI wired together, with AI-generated incident reports surfaced in a custom Next.js dashboard I built."
tags: ["cti", "wazuh", "opencti", "automation"]
---
Final-year project (License) at **ANCS**, 2024–2025, with Koussay Bedoui. Supervised by Mr. Chekib Hantous and Mrs. Rim Bouhouch.

## What it does

- **Wazuh** handles detection.
- **Shuffle** orchestrates the response workflow.
- **OpenCTI** enriches alerts with threat intelligence from OTX and VirusTotal.
- A local **Mistral 7B** model writes contextual, real-time incident reports.
- Everything is surfaced in a **custom Next.js dashboard** I built (dashboard, incidents, detection performance, threat intelligence and AI-generated reports views).

I moved deliberately away from heavier components (TheHive, Kibana) in favour of the custom dashboard, so the analyst starts from context instead of a raw alert.

## Stack

Wazuh · Shuffle · OpenCTI · Mistral 7B (GGUF) · FastAPI · Next.js

> Add: architecture diagram and 2–3 dashboard screenshots.
