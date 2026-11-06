---
title: "eAIS — AI Systems Security Specialist"
date: 2026-11-06
side: "purple"
issuer: "INE"
issued: "November 2026"
verify: "https://certs.ine.com/6c915cae-c9b0-422f-b341-78cf1253c4de#acc.7aYpTBkE"
summary: "A practical AI-security certification: attacking and defending LLM apps, RAG pipelines and autonomous agents — prompt injection, data leakage, agent abuse and the guardrails that stop them."
tags: ["ai-security", "llm-security", "mitre-atlas", "certification"]
---
eAIS is INE's AI Systems Security Specialist certification. It covers the full LLM-app attack surface — prompt injection, retrieval poisoning, agent tool abuse, model-output manipulation — and the defensive side: guardrails, monitoring and the controls that stop those attacks from reaching data or production.

## What I learned

- **LLM-app threat modeling**: mapping real deployments to the OWASP LLM Top 10 and MITRE ATLAS, so a chatbot, RAG pipeline or agent gets reviewed against the attacks that actually hit it.
- **Prompt injection, direct and indirect**: hijacking a model through its own prompt, through retrieved documents, through tool output and through any untrusted text a system is willing to read.
- **RAG and vector-store attacks**: poisoning embeddings, abusing retrieval to leak training data or system prompts, and the input/output filtering that makes a retrieval layer trustworthy.
- **Agent security**: how tool-using agents escalate a simple prompt injection into real actions, and how least-privilege tool design, human-in-the-loop approval and scoped credentials contain the blast radius.
- **Detection and guardrails**: logging prompts, responses and tool calls the way a SOC would log any other application, plus input/output guardrails that turn an AI app into something defenders can actually monitor.

## Why it matters to my work

I already use AI daily — in SOC triage, in offensive work, in automation — so the attack surface it adds isn't theoretical, it's already in environments I monitor and test. eAIS gives me the vocabulary and the technique set to assess LLM apps and agents the same way I assess anything else that touches production: what can an attacker make it do, what does that look like in the logs, and what control stops it. It's the piece that bridges my SOC and offensive sides into a space my clients and employers are shipping into whether the security side is ready or not.
