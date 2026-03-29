# OWASP GenAI Data Security Risks and Mitigations 2026

### By Emmanuel Guilherme Junior | OWASP GenAI Data Security Initiative Lead

---

## TL;DR

GenAI systems introduce data security risks that traditional frameworks were not designed to address. This document identifies **21 critical data security risks (DSGAI01-DSGAI21)** spanning the full GenAI lifecycle — from training-time poisoning and credential exposure to inference attacks, compliance failures, and model IP theft. Each risk includes how the attack unfolds, attacker capabilities, real-world scenarios, and a three-tier mitigation model (Foundational, Hardening, Advanced). An interactive web application accompanies this document to make the research actionable.

**Interactive Web App:** [emmanuelgjr.github.io/DSGAI](https://emmanuelgjr.github.io/DSGAI/)

**Published Document:** [OWASP GenAI Data Security Guide](https://genai.owasp.org/resource/owasp-genai-data-security/)

---

## Why This Matters

The context window in GenAI systems aggregates data from multiple trust domains — system prompts, user inputs, RAG results, tool outputs, and conversation history — into a single flat namespace with no internal access control. There is no mechanism to mark a context segment as "available for reasoning but not for direct output." This architectural fusion of control and data planes creates an entirely new class of data security risk.

Organizations deploying LLMs, RAG pipelines, AI agents, and fine-tuned models need a purpose-built framework to identify, prioritize, and mitigate these risks. That is what DSGAI provides.

---

## The 21 Risks

| # | Risk | Category |
|---|------|----------|
| DSGAI01 | Sensitive Data Leakage | Leakage |
| DSGAI02 | Agent Identity & Credential Exposure | Identity & Access |
| DSGAI03 | Shadow AI & Unsanctioned Data Flows | Governance |
| DSGAI04 | Data, Model & Artifact Poisoning | Poisoning & Integrity |
| DSGAI05 | Data Integrity & Validation Failures | Poisoning & Integrity |
| DSGAI06 | Tool, Plugin & Agent Data Exchange Risks | Identity & Access |
| DSGAI07 | Data Governance, Lifecycle & Classification | Governance |
| DSGAI08 | Non-Compliance & Regulatory Violations | Compliance |
| DSGAI09 | Multimodal Capture & Cross-Channel Leakage | Leakage |
| DSGAI10 | Synthetic Data, Anonymization & Transformation Pitfalls | Governance |
| DSGAI11 | Cross-Context & Multi-User Conversation Bleed | Infrastructure |
| DSGAI12 | Unsafe Natural-Language Data Gateways | Infrastructure |
| DSGAI13 | Vector Store Platform Data Security | Infrastructure |
| DSGAI14 | Excessive Telemetry & Monitoring Leakage | Governance |
| DSGAI15 | Over-Broad Context Windows & Prompt Over-Sharing | Compliance |
| DSGAI16 | Endpoint & Browser Assistant Overreach | Adversarial |
| DSGAI17 | Data Availability & Resilience Failures | Infrastructure |
| DSGAI18 | Inference & Data Reconstruction | Adversarial |
| DSGAI19 | Human-in-the-Loop & Labeler Overexposure | Governance |
| DSGAI20 | Model Exfiltration & IP Replication | Adversarial |
| DSGAI21 | Disinformation & Integrity Attacks via Data Poisoning | Poisoning & Integrity |

---

## Mitigation Tiers

Each risk provides mitigations organized by implementation maturity:

**Tier 1 — Foundational:** Controls deployable within a single sprint. Policy enforcement, configuration hardening, access reviews, and operational hygiene that require no architectural changes.

**Tier 2 — Hardening:** Controls requiring architecture changes, new tooling, or cross-team coordination. DLP integration, advanced RAG hardening, cryptographic integrity pipelines.

**Tier 3 — Advanced:** Controls for mature security programs. Differential privacy, machine unlearning, red-team exercises, formal verification, and custom detection models.

---

## Interactive Web Application

The web app transforms the published document into a searchable, filterable, and actionable platform. Everything runs in the browser — no data leaves your machine.

**[Launch the Web App](https://emmanuelgjr.github.io/DSGAI/)**

### What's in the app

**For CISOs and Risk Managers**
- **Risk Assessment** — 20-question interactive questionnaire that profiles your GenAI stack and generates a personalized risk report with severity scoring and recommended mitigations
- **Policy Generator** — Wizard that generates downloadable Acceptable Use, Data Classification, Model Governance, and Vendor Assessment policies customized to your organization

**For Security Practitioners and SOC Teams**
- **Implementation Checklists** — Actionable task lists for all 21 risks with real tool recommendations (AWS Macie, HashiCorp Vault, Lakera Guard, Splunk, etc.), effort estimates, and browser-persisted progress tracking
- **Detection & Response Playbooks** — SIEM queries for Splunk, Microsoft Sentinel, and Elastic; detection signatures; step-by-step response runbooks; and indicators of compromise
- **Threat Model Templates** — STRIDE-based analysis for every risk with assets, trust boundaries, data flows, and exportable JSON

**For GenAI Developers and Architects**
- **Architecture Decision Records** — 10 secure-by-default patterns with Python and JavaScript code snippets covering RAG security, agent credentials, vector store hardening, LLM-to-SQL safety, plugin sandboxing, and more
- **Network Diagrams** — Animated infrastructure topology views showing how each attack unfolds across cloud, server, database, and agent components
- **Attack Paths** — Visual step-by-step attack flow diagrams with vector breakdowns

---

## Document Structure

Each of the 21 entries follows a consistent format:

1. **How the attack unfolds** — GenAI-specific attack narrative
2. **Attacker capabilities** — Who can exploit this and what they need
3. **Illustrative scenario** — Grounded in documented incidents or current research
4. **Impact** — Confidentiality, regulatory, operational, and downstream consequences
5. **Mitigations** — Three tiers with scope annotations (Buy / Build / Both)
6. **Known CVEs** — Referenced where applicable

---

## AI-DSPM (Data Security Posture Management for GenAI)

The document introduces AI-DSPM as an extension of traditional DSPM with 13 capability areas tailored to GenAI:

1. GenAI data asset discovery & inventory
2. Data classification, labeling & policy binding
3. Data flow mapping, lineage & GenAI bill of materials
4. Access governance & entitlement posture (including agents)
5. Prompt, RAG, and output-layer DLP controls
6. Vector store & embedding security posture
7. Data integrity, poisoning & tamper detection
8. Observability, telemetry & log-retention posture
9. Third-party, plugin/tool, and connector governance
10. Lifecycle management, erasure & compliance readiness
11. Training governance & privacy-enhancing fine-tuning
12. Resilience posture for GenAI data dependencies
13. Human and "Shadow AI" controls

---

## Related OWASP Projects

- [OWASP GenAI Security Project](https://genai.owasp.org)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OWASP AI Exchange](https://owaspai.org/)

---

## License

Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

You are free to share and adapt this material for any purpose, including commercial, provided you give appropriate credit and distribute contributions under the same license.

---

## Contributing

Contributions are welcome. Open an issue or submit a pull request.
