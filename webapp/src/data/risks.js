/**
 * OWASP GenAI Data Security Risks (DSGAI01–DSGAI21)
 * Structured data for the DSGAI webapp.
 */

// ---------------------------------------------------------------------------
// Helper constants
// ---------------------------------------------------------------------------

export const categories = [
  { id: "leakage", label: "Data Leakage", color: "#dc2626", bgColor: "#fef2f2", borderColor: "#fecaca" },
  { id: "identity", label: "Identity & Access", color: "#9333ea", bgColor: "#faf5ff", borderColor: "#e9d5ff" },
  { id: "governance", label: "Governance & Lifecycle", color: "#2563eb", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
  { id: "poisoning", label: "Data Poisoning", color: "#ea580c", bgColor: "#fff7ed", borderColor: "#fed7aa" },
  { id: "infra", label: "Infrastructure", color: "#0891b2", bgColor: "#ecfeff", borderColor: "#a5f3fc" },
  { id: "compliance", label: "Compliance & Regulatory", color: "#ca8a04", bgColor: "#fefce8", borderColor: "#fef08a" },
  { id: "attack", label: "Adversarial Attacks", color: "#e11d48", bgColor: "#fff1f2", borderColor: "#fecdd3" },
];

export const tierLabels = {
  tier1: "Foundational",
  tier2: "Hardening",
  tier3: "Advanced",
};

// ---------------------------------------------------------------------------
// Risk entries
// ---------------------------------------------------------------------------

export const risks = [
  // =========================================================================
  // DSGAI01 — Sensitive Data Leakage
  // =========================================================================
  {
    id: "DSGAI01",
    title: "Sensitive Data Leakage",
    tagline:
      "Training data, RAG context, or residual memory surfaces PII, credentials, or IP in model outputs.",
    category: "leakage",
    categoryLabel: "Data Leakage",

    howItUnfolds:
      "Sensitive data leakage occurs when personally identifiable information (PII), protected health information (PHI), credentials, or intellectual property embedded in training data, fine-tuning datasets, or RAG corpora is surfaced through model outputs. This can happen because LLMs memorize fragments of their training data — particularly rare or unique sequences such as Social Security numbers, API keys, and private correspondence — and can be coerced into reproducing them via carefully crafted prompts.\n\nThe risk is amplified in Retrieval-Augmented Generation (RAG) pipelines where the model is grounded on live document stores. If those stores contain un-redacted sensitive records, any user query that triggers relevant retrieval can cause the model to quote or paraphrase the sensitive content directly. Even without direct retrieval, residual memorization from fine-tuning can persist across sessions and surface unpredictably.\n\nDownstream consequences extend well beyond a single leaked record. Exposed data may be ingested by other systems, creating cascading poisoning effects. Regulatory obligations under GDPR, HIPAA, and CCPA are triggered the moment personal data is disclosed without authorization. Data Subject Request (DSR) and Right to Be Forgotten (RTBF) workflows fail when the organization cannot prove that the data has been fully purged from model weights and vector stores.",

    illustrativeScenario:
      "A support chatbot fine-tuned on historical tickets returns a customer's SSN because those tickets were ingested without redaction.",

    attackerCapabilities:
      "The attacker requires only standard user-level access to the model's prompt interface. No elevated privileges or insider access are needed. Through iterative prompt engineering — including prefix completion attacks, multi-turn extraction, and jailbreak techniques — the attacker can coerce the model into revealing memorized training data. In RAG scenarios, the attacker does not even need to craft adversarial prompts; ordinary queries that happen to match sensitive documents will trigger leakage. Automated tooling can scale extraction attempts across thousands of prompt variations, making this a low-skill, high-reward attack surface.",

    impact: [
      "PII/PHI/IP exposure to unauthorized parties",
      "GDPR, HIPAA, and CCPA regulatory violations",
      "Downstream data poisoning from leaked content",
      "DSR/RTBF compliance failure",
    ],

    attackFlow: [
      { label: "Crafted Prompt", sublabel: "Adversarial or ordinary query" },
      { label: "RAG / Weights", sublabel: "Retrieval or memorization path" },
      { label: "Sensitive Output", sublabel: "PII, credentials, or IP surfaced" },
      { label: "Breach", sublabel: "Data disclosed to unauthorized party" },
    ],

    attackVectors: [
      {
        title: "Training / Fine-Tune Extraction",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker crafts extraction prompts", type: "attacker" },
          { label: "Model reproduces memorized training data", type: "system" },
          { label: "PII, credentials, or IP surfaces in output", type: "leak" },
          { label: "Regulatory violation triggered", type: "impact" },
        ],
      },
      {
        title: "RAG Pipeline Retrieval",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "User submits query matching sensitive docs", type: "attacker" },
          { label: "Vector store retrieves un-redacted content", type: "system" },
          { label: "Model quotes or paraphrases sensitive data", type: "leak" },
          { label: "Data exposed beyond intended audience", type: "impact" },
        ],
      },
      {
        title: "Indirect / Residual Leakage",
        riskLevel: "PERSISTENT RISK",
        steps: [
          { label: "Fine-tuning embeds sensitive patterns in weights", type: "gray" },
          { label: "Unrelated prompt triggers residual recall", type: "system" },
          { label: "Sensitive fragment appears in output", type: "leak" },
          { label: "Leakage undetectable without output monitoring", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "No-train / no-retain policy", scope: "Buy + Build", description: "Enforce contractual and technical controls preventing LLM providers from training on or retaining prompt/response data." },
        { title: "Oversharing Reduction", scope: "Buy + Build", description: "Minimize the amount of context, system prompts, and grounding data included in each request to reduce leakage surface area." },
        { title: "Ops Hygiene Basic", scope: "Buy + Build", description: "Implement standard operational hygiene including data redaction in pre-processing, PII scanning of training data, and access logging." },
        { title: "Prompt Architecture", scope: "Buy + Build", description: "Design prompt templates that avoid embedding sensitive data directly and use parameterized references instead of inline values." },
        { title: "RAG Hardening Basic", scope: "Buy + Build", description: "Apply access controls, document-level permissions, and content filtering to RAG retrieval pipelines." },
        { title: "Rate-Limiting", scope: "Build", description: "Throttle prompt volume per user session to limit automated extraction attempts." },
        { title: "Policy Compliance Gating", scope: "Buy + Build", description: "Gate model outputs through policy compliance checks before returning results to users." },
      ],
      tier2: [
        { title: "Ops Hygiene Advanced / Encryption", scope: "Buy + Build", description: "Encrypt data at rest and in transit across all AI pipeline stages, including embeddings and intermediate artifacts." },
        { title: "Real-time DLP Scanning", scope: "Buy + Build", description: "Deploy data loss prevention (DLP) scanning on model inputs and outputs in real time to detect and block sensitive data." },
        { title: "Extraction / Distillation Defense", scope: "Build", description: "Implement defenses against model extraction and knowledge distillation attacks that attempt to replicate model behavior." },
        { title: "Indirect Prompt Injection Exfil Blocking", scope: "Buy + Build", description: "Detect and block indirect prompt injection patterns designed to exfiltrate data through model outputs." },
        { title: "Format-Preserving Encryption", scope: "Build", description: "Apply format-preserving encryption to sensitive fields so they maintain structural validity without exposing real values." },
        { title: "RAG Hardening Advanced", scope: "Buy + Build", description: "Implement advanced RAG controls including retrieval result filtering, relevance score thresholds, and output grounding verification." },
      ],
      tier3: [
        { title: "Red-team Exercises", scope: "Build", description: "Conduct regular adversarial red-team exercises specifically targeting data extraction from models and RAG pipelines." },
        { title: "Differential Privacy Training", scope: "Build", description: "Train or fine-tune models with differential privacy guarantees to limit memorization of individual training records." },
        { title: "Verifiable Erasure / Unlearning", scope: "Build", description: "Implement machine unlearning techniques with verifiable guarantees that specific data has been removed from model weights." },
      ],
    },

    impactChips: [
      { label: "PII Exposure", detail: "SSN, PHI, credentials surfaced", color: "pii" },
      { label: "Regulatory", detail: "GDPR / HIPAA / CCPA violations", color: "reg" },
      { label: "Poisoning", detail: "Downstream systems ingest leaked data", color: "poison" },
      { label: "DSR Failure", detail: "RTBF obligations cannot be met", color: "dsr" },
    ],

    cves: [
      "CVE-2024-5184",
      "CVE-2025-54794",
      "CVE-2025-32711",
      "CVE-2026-22708",
      "CVE-2026-0612",
    ],

    crossReferences: ["DSGAI07", "DSGAI08", "DSGAI09", "DSGAI11", "DSGAI15", "OWASP LLM01"],
  },

  // =========================================================================
  // DSGAI02 — Agent Identity & Credential Exposure
  // =========================================================================
  {
    id: "DSGAI02",
    title: "Agent Identity & Credential Exposure",
    tagline:
      "Sub-agent compromise inherits operator-level tokens, propagating access across the full agent chain.",
    category: "identity",
    categoryLabel: "Identity & Access",

    howItUnfolds:
      "Modern AI systems increasingly rely on multi-agent architectures where an orchestration agent delegates tasks to specialized sub-agents. These sub-agents often inherit the credentials and access tokens of their parent agent — including OAuth tokens, API keys, and service account credentials — creating a transitive trust chain. When a sub-agent is compromised, the attacker gains the full privilege set of the originating operator.\n\nThe compromise vector is frequently indirect: a sub-agent processing a retrieved document encounters a prompt injection payload that redirects its behavior. Because the sub-agent holds inherited tokens with broad data-tier access, the injected instructions can query databases, access file stores, or invoke APIs far beyond the sub-agent's intended scope. Non-human identity (NHI) sprawl compounds the problem — stale credentials, long-lived tokens, and service accounts with excessive permissions persist across agent deployments.\n\nThe incident response implications are severe. When credentials propagate across an agent chain, determining the blast radius requires tracing token inheritance across multiple agents, each of which may have accessed different data stores. Without immutable access logs and clear credential lineage, responders face a sprawling investigation with uncertain boundaries.",

    illustrativeScenario:
      "An orchestration agent with a developer's OAuth token spawns a sub-agent that inherits full data-tier access. Attacker compromises the sub-agent via prompt injection in a retrieved document.",

    attackerCapabilities:
      "The attacker can operate remotely by injecting adversarial content into data sources that agents process — such as documents, web pages, or API responses. No direct access to the agent infrastructure is required. By poisoning a document retrieved during a RAG operation, the attacker can hijack the sub-agent's behavior, causing it to use inherited credentials for unauthorized data access. The attacker may also exploit stale NHI credentials discovered through reconnaissance of credential stores or leaked configuration files.",

    impact: [
      "Token theft and credential compromise across agent chains",
      "Privilege escalation from sub-agent to operator-level access",
      "Sprawling incident response across multiple agent boundaries",
    ],

    attackFlow: [
      { label: "Compromise Sub-Agent", sublabel: "Via prompt injection in tool output" },
      { label: "Inherit Token", sublabel: "Sub-agent holds parent credentials" },
      { label: "Data Tier Access", sublabel: "Databases, APIs, file stores" },
      { label: "Exfiltration", sublabel: "Sensitive data extracted" },
    ],

    attackVectors: [
      {
        title: "Prompt Injection via Tool Output",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker poisons document in data source", type: "attacker" },
          { label: "Sub-agent retrieves and processes poisoned content", type: "system" },
          { label: "Injected instructions redirect agent behavior", type: "action" },
          { label: "Inherited credentials used for unauthorized access", type: "leak" },
          { label: "Data exfiltrated via agent's legitimate channels", type: "impact" },
        ],
      },
      {
        title: "NHI Sprawl & Stale Credentials",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Long-lived service account tokens persist", type: "gray" },
          { label: "Attacker discovers stale credentials", type: "attacker" },
          { label: "Credentials provide broad data-tier access", type: "leak" },
          { label: "Unauthorized data access and exfiltration", type: "impact" },
        ],
      },
      {
        title: "Cross-Agent Credential Sharing",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Orchestrator passes tokens to child agents", type: "system" },
          { label: "Child agent compromised via any vector", type: "attacker" },
          { label: "Full parent privilege set available to attacker", type: "leak" },
          { label: "Lateral movement across agent chain", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Least Privilege RBAC/ABAC", scope: "Buy + Build", description: "Enforce role-based and attribute-based access control with short-lived tokens, mTLS, and just-in-time access provisioning for all agent identities." },
        { title: "Secret Hygiene / Vaults", scope: "Buy + Build", description: "Store all credentials in secrets management vaults with automatic rotation and never embed secrets in agent configurations or environment variables." },
        { title: "Immutable Access Logs", scope: "Buy + Build", description: "Maintain tamper-proof audit logs of all credential usage, token issuance, and data access across the agent chain." },
      ],
      tier2: [
        { title: "Task-Scoped OAuth", scope: "Buy + Build", description: "Replace inherited parent tokens with task-scoped OAuth tokens that grant only the permissions required for the specific sub-agent task." },
        { title: "NHI Inventory & Continuous Discovery", scope: "Build", description: "Maintain a continuously updated inventory of all non-human identities with automated discovery of stale, over-privileged, or orphaned credentials." },
        { title: "Anomaly Detection on Access Patterns", scope: "Build", description: "Deploy behavioral analytics to detect anomalous credential usage patterns across agent chains, triggering alerts on out-of-scope access." },
      ],
      tier3: [
        { title: "PKI-Backed Agent IDs", scope: "Buy + Build", description: "Issue PKI-backed identities to each agent with signed requests and workload identity federation, ensuring cryptographic verification of agent authenticity." },
      ],
    },

    impactChips: [
      { label: "Token Theft", detail: "Credentials compromised across chain", color: "pii" },
      { label: "Privilege Escalation", detail: "Sub-agent to operator-level", color: "reg" },
      { label: "Sprawling IR", detail: "Uncertain blast radius", color: "dsr" },
    ],

    cves: ["CVE-2025-54795"],

    crossReferences: ["DSGAI06", "DSGAI01", "OWASP LLM06"],
  },

  // =========================================================================
  // DSGAI03 — Shadow AI & Unsanctioned Data Flows
  // =========================================================================
  {
    id: "DSGAI03",
    title: "Shadow AI & Unsanctioned Data Flows",
    tagline:
      "Employees paste sensitive data into external AI SaaS tools outside IT governance; vendor retains and trains on it.",
    category: "governance",
    categoryLabel: "Governance & Lifecycle",

    howItUnfolds:
      "Shadow AI emerges when employees adopt consumer or third-party GenAI tools — such as chatbots, email assistants, coding copilots, and summarization services — without IT approval or security review. Driven by productivity pressures, staff paste customer data, source code, financial records, and internal documents into these tools, often unaware that the vendor's terms of service may permit training on submitted inputs.\n\nThe data flows created by shadow AI are invisible to the organization's security stack. CASB and DLP solutions may not recognize newer GenAI endpoints, and browser-based tools bypass traditional network monitoring. Once data reaches the vendor, the organization loses control: it cannot enforce retention limits, mandate deletion, or verify that the data is not used for model training. If the vendor suffers a breach, the organization may not even be notified that its data was exposed.\n\nThe regulatory implications are particularly acute in cross-border scenarios. Data pasted into a GenAI tool hosted in a different jurisdiction may violate data residency requirements, transfer restrictions under GDPR, or sector-specific regulations. The organization cannot demonstrate data lineage or lawful basis for processing when it does not even know the data flow exists.",

    illustrativeScenario:
      "A sales team adopts an unsanctioned email-writing assistant that trains on customer inputs. The vendor suffers a breach exposing those conversations.",

    attackerCapabilities:
      "This risk does not require a traditional attacker. The threat originates from well-intentioned employees whose productivity-driven adoption of unsanctioned tools creates uncontrolled data flows. However, a sophisticated adversary could exploit this pattern by creating attractive GenAI tools designed to harvest corporate data, or by compromising the vendors of popular shadow AI tools. The attacker benefits from the organization's lack of visibility — data exfiltration occurs through legitimate SaaS channels that bypass network security controls.",

    impact: [
      "Silent proliferation of sensitive data across uncontrolled vendors",
      "Complete loss of data lineage and provenance tracking",
      "Regulatory risk from undocumented cross-border data transfers",
    ],

    attackFlow: [
      { label: "Employee Pastes Data", sublabel: "Into external GenAI SaaS" },
      { label: "External AI SaaS", sublabel: "Processes and potentially retains" },
      { label: "Vendor Retains", sublabel: "Training or indefinite storage" },
      { label: "Silent Breach", sublabel: "Vendor incident or training leakage" },
    ],

    attackVectors: [
      {
        title: "Consumer GenAI SaaS Data Harvest",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Employee pastes sensitive data into GenAI tool", type: "action" },
          { label: "Vendor retains data per ToS", type: "system" },
          { label: "Data used for model training", type: "leak" },
          { label: "Vendor breach exposes organizational data", type: "impact" },
        ],
      },
      {
        title: "Third-Party SaaS Embedded AI Spillover",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Existing SaaS vendor enables AI features", type: "system" },
          { label: "Features process data with new third-party AI provider", type: "action" },
          { label: "Data flows to AI provider outside original contract", type: "leak" },
          { label: "Governance and residency controls bypassed", type: "impact" },
        ],
      },
      {
        title: "Cross-Border Jurisdictional Trap",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Employee uses GenAI tool hosted in foreign jurisdiction", type: "action" },
          { label: "Data transfer violates residency requirements", type: "leak" },
          { label: "Organization cannot demonstrate lawful basis", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Acceptable Use Policy", scope: "Buy + Build", description: "Publish and enforce a clear acceptable use policy for GenAI tools, covering approved tools, data classification limits, and consequences for non-compliance." },
        { title: "CASB / Proxy Detection", scope: "Buy + Build", description: "Deploy cloud access security brokers and web proxies configured to detect and log traffic to known GenAI endpoints." },
        { title: "Data Classification Awareness Training", scope: "Build", description: "Train all employees on data classification levels and the risks of pasting sensitive data into external AI tools." },
      ],
      tier2: [
        { title: "Approved GenAI Catalog", scope: "Buy + Build", description: "Maintain a curated catalog of vetted GenAI tools with pre-negotiated data processing agreements and approved use cases." },
        { title: "DLP on Outbound Prompts", scope: "Buy + Build", description: "Apply DLP scanning to outbound prompts and inputs sent to GenAI services, blocking transmission of classified data." },
        { title: "Contractual Review for AI Features", scope: "Build", description: "Conduct contractual and privacy review of AI features in all procured SaaS tools, ensuring data processing terms are acceptable." },
      ],
      tier3: [
        { title: "Real-Time Shadow AI Discovery", scope: "Buy", description: "Deploy real-time network and endpoint monitoring to discover and block unsanctioned GenAI tool usage automatically." },
        { title: "Automated Data Flow Mapping", scope: "Build", description: "Build automated data flow mapping that traces data movement across all SaaS applications, including embedded AI features." },
      ],
    },

    impactChips: [
      { label: "Silent Proliferation", detail: "Data spreads to unknown vendors", color: "pii" },
      { label: "Lineage Loss", detail: "No provenance or tracking", color: "dsr" },
      { label: "Regulatory Risk", detail: "Undocumented cross-border flows", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI07", "DSGAI08", "DSGAI14", "DSGAI15"],
  },

  // =========================================================================
  // DSGAI04 — Data, Model & Artifact Poisoning
  // =========================================================================
  {
    id: "DSGAI04",
    title: "Data, Model & Artifact Poisoning",
    tagline:
      "Malicious artifacts injected into supply chain, training pipeline, or RAG index compromise model behavior in production.",
    category: "poisoning",
    categoryLabel: "Data Poisoning",

    howItUnfolds:
      "Data and model poisoning attacks target the integrity of the AI supply chain — from pre-trained model artifacts downloaded from public repositories to training data pipelines and RAG document indexes. Attackers exploit the trust that organizations place in community model hubs, open datasets, and shared pipeline configurations to inject malicious payloads that activate in production environments.\n\nThe most severe vector involves malicious model artifacts. Models serialized in formats like Python pickle allow arbitrary code execution upon deserialization. An attacker publishes a seemingly legitimate model on a public hub; when the organization loads it, the payload executes with full system privileges, enabling remote code execution (RCE), credential theft, and persistent backdoor installation. Pipeline configuration tampering is subtler — modifying data preprocessing steps, hyperparameters, or augmentation logic to introduce systematic bias or backdoors.\n\nRAG-specific poisoning targets the document corpus that grounds model outputs. By injecting adversarial documents with carefully crafted embeddings, an attacker can ensure their content is retrieved for specific query patterns, manipulating model outputs without touching the model itself. The mean time to recovery (MTTR) for poisoning attacks is exceptionally long because the corruption is distributed across weights, embeddings, or index entries and may require complete retraining or re-indexing to remediate.",

    illustrativeScenario:
      "A poisoned Hugging Face model is loaded with pickle deserialization, achieving RCE. Or adversarial documents are injected into a RAG corpus to manipulate outputs.",

    attackerCapabilities:
      "The attacker can operate at multiple levels of the supply chain. For artifact poisoning, they need the ability to publish or modify models on public repositories — a low barrier given the open nature of model hubs. For pipeline tampering, the attacker requires write access to training configuration files, data storage, or CI/CD systems. For RAG poisoning, the attacker needs write access to document sources that feed the RAG index, which may be as simple as editing a public wiki or submitting content to a crawled website. The technical sophistication ranges from trivial (pickle exploits are well-documented) to advanced (crafting adversarial embeddings that reliably influence retrieval).",

    impact: [
      "Backdoor installation in production models",
      "Credential exfiltration via RCE on model load",
      "Exceptionally long mean time to recovery (MTTR)",
    ],

    attackFlow: [
      { label: "Supply Chain", sublabel: "Public hub, pipeline, or RAG source" },
      { label: "Artifact Tamper", sublabel: "Poisoned model, config, or document" },
      { label: "Training / RAG", sublabel: "Malicious content integrated" },
      { label: "Backdoor", sublabel: "RCE, bias, or output manipulation" },
    ],

    attackVectors: [
      {
        title: "Malicious Model Artifact (RCE on Load)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker publishes poisoned model to public hub", type: "attacker" },
          { label: "Organization downloads and deserializes model", type: "system" },
          { label: "Pickle payload executes arbitrary code", type: "action" },
          { label: "RCE achieved — credentials exfiltrated", type: "impact" },
        ],
      },
      {
        title: "Pipeline Config Tampering",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker gains write access to pipeline config", type: "attacker" },
          { label: "Preprocessing or training parameters modified", type: "action" },
          { label: "Systematic bias or backdoor introduced", type: "leak" },
          { label: "Corrupted model deployed to production", type: "impact" },
        ],
      },
      {
        title: "Adversarial RAG Embedding Injection",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker injects documents into RAG source", type: "attacker" },
          { label: "Documents embedded with adversarial vectors", type: "action" },
          { label: "Retrieval returns poisoned content for target queries", type: "system" },
          { label: "Model outputs manipulated without weight modification", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Artifact Signature Verification", scope: "Buy + Build", description: "Verify cryptographic signatures and checksums on all model artifacts before loading, and use safe deserialization formats (safetensors) instead of pickle." },
        { title: "Immutable Model Registry", scope: "Buy + Build", description: "Maintain an immutable model registry with full provenance tracking, including source, build hash, training data lineage, and deployment history." },
        { title: "RAG Ingestion Validation", scope: "Build", description: "Validate all documents entering the RAG pipeline for content integrity, source authenticity, and adversarial embedding patterns." },
      ],
      tier2: [
        { title: "Content Integrity Hashing", scope: "Build", description: "Hash all artifacts at each pipeline stage and verify integrity before promotion, detecting any tampering between stages." },
        { title: "Automated Drift Detection", scope: "Build", description: "Run automated behavioral drift detection using golden evaluation datasets to catch output changes caused by poisoned data or configurations." },
        { title: "Supply Chain SBOM/DBOM Tracking", scope: "Buy + Build", description: "Maintain software and data bills of materials (SBOM/DBOM) tracking all dependencies, data sources, and model lineage." },
      ],
      tier3: [
        { title: "Formal Verification of Model Behavior", scope: "Build", description: "Apply formal verification methods to define and enforce behavioral boundaries that models must satisfy regardless of training data variations." },
        { title: "Red-Team for Backdoor Detection", scope: "Build", description: "Conduct specialized red-team exercises focused on discovering planted backdoors, trojan triggers, and adversarial behaviors in deployed models." },
        { title: "Trusted Execution Environments for Training", scope: "Buy", description: "Execute model training within trusted execution environments (TEEs) that provide hardware-level attestation of pipeline integrity." },
      ],
    },

    impactChips: [
      { label: "Backdoor", detail: "Persistent compromise of model behavior", color: "poison" },
      { label: "Credential Exfil", detail: "RCE enables secret theft", color: "pii" },
      { label: "Long MTTR", detail: "Retraining required for remediation", color: "dsr" },
    ],

    cves: ["CVE-2025-24357"],

    crossReferences: ["DSGAI05", "DSGAI21", "DSGAI13", "OWASP LLM03"],
  },

  // =========================================================================
  // DSGAI05 — Data Integrity & Validation Failures
  // =========================================================================
  {
    id: "DSGAI05",
    title: "Data Integrity & Validation Failures",
    tagline:
      "Adversarial inputs pass format validation and silently corrupt training pipelines or trigger path traversal via snapshot imports.",
    category: "poisoning",
    categoryLabel: "Data Poisoning",

    howItUnfolds:
      "Data integrity failures in AI systems arise when adversarial or malformed inputs bypass surface-level format validation — passing CSV, JSON, or Parquet schema checks — while carrying payloads that corrupt downstream processing. Unlike traditional web application input validation, AI pipeline inputs have complex nested structures, multi-modal content, and specialized formats that standard validators were not designed to inspect deeply.\n\nA particularly dangerous manifestation is path traversal through snapshot import functionality. Vector databases like Qdrant support snapshot export and import for backup and migration. If the snapshot restore process does not properly sanitize file paths within the archive, an attacker can craft a snapshot containing entries with path traversal sequences (e.g., ../../etc/cron.d/backdoor) that write arbitrary files to the server filesystem during restore.\n\nBeyond direct exploitation, subtle data integrity failures in labeling queues and training pipelines can silently corrupt model behavior over time. When adversarial labels or feature values pass validation but carry biased or manipulated content, the corruption accumulates through training iterations and becomes extremely difficult to diagnose or attribute to specific input batches.",

    illustrativeScenario:
      "An attacker crafts a Qdrant snapshot with path traversal payloads that writes arbitrary files on the server during snapshot restore.",

    attackerCapabilities:
      "The attacker needs the ability to submit data to the AI pipeline's ingestion endpoints or import interfaces. For snapshot path traversal, the attacker needs access to the snapshot restore API, which may be exposed without authentication on internal networks. For pipeline corruption, the attacker can submit adversarial data through any input channel — file uploads, API endpoints, labeling interfaces, or data source integrations. The payloads are designed to pass structural validation while exploiting semantic or filesystem-level processing flaws.",

    impact: [
      "Arbitrary file write on server via path traversal",
      "Silent corruption of training data and model behavior",
      "Long mean time to detection (MTTD) for subtle integrity failures",
    ],

    attackFlow: [
      { label: "Malformed Input", sublabel: "Adversarial CSV, JSON, or snapshot" },
      { label: "Passes Validation", sublabel: "Format checks succeed" },
      { label: "Pipeline Corrupt", sublabel: "Path traversal or data poisoning" },
      { label: "Compromise", sublabel: "Arbitrary file write or silent corruption" },
    ],

    attackVectors: [
      {
        title: "Adversarial CSV/JSON/Parquet Ingestion",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker crafts malformed data files", type: "attacker" },
          { label: "Files pass schema/format validation", type: "system" },
          { label: "Adversarial content corrupts pipeline processing", type: "action" },
          { label: "Model behavior silently degraded", type: "impact" },
        ],
      },
      {
        title: "Snapshot Path Traversal (Qdrant)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker crafts snapshot with traversal payloads", type: "attacker" },
          { label: "Snapshot uploaded via restore API", type: "action" },
          { label: "Path traversal writes arbitrary files", type: "leak" },
          { label: "Server compromise achieved", type: "impact" },
        ],
      },
      {
        title: "Labeling Queue Injection",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Adversarial labels submitted through queue", type: "attacker" },
          { label: "Labels pass format checks but carry bias", type: "system" },
          { label: "Corrupted labels integrated into training", type: "action" },
          { label: "Systematic model bias introduced", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Schema Validation on All Pipeline Inputs", scope: "Build", description: "Enforce strict schema validation on all data entering the pipeline, including type checks, range constraints, and structural integrity verification." },
        { title: "Input Sanitization and Encoding Checks", scope: "Build", description: "Sanitize all inputs for path traversal sequences, encoding attacks, and injection payloads beyond basic format validation." },
        { title: "Least Privilege Filesystem Access", scope: "Build", description: "Run import and restore operations with minimal filesystem permissions, preventing writes outside designated directories." },
      ],
      tier2: [
        { title: "Content-Aware Validation", scope: "Build", description: "Implement validation that goes beyond format checks to inspect semantic content, statistical properties, and adversarial patterns in input data." },
        { title: "Snapshot Integrity Verification", scope: "Build", description: "Verify snapshot integrity with hash chains and validate all internal file paths before restore operations." },
        { title: "Isolated Import Sandbox Environments", scope: "Buy + Build", description: "Execute all import and restore operations within isolated sandbox environments that contain any exploitation." },
      ],
      tier3: [
        { title: "Adversarial Input Fuzzing in CI/CD", scope: "Build", description: "Integrate adversarial input fuzzing into CI/CD pipelines to discover validation bypasses before deployment." },
        { title: "Formal Input Grammar Specification", scope: "Build", description: "Define and enforce formal grammar specifications for all pipeline inputs, rejecting anything that deviates from the specification." },
      ],
    },

    impactChips: [
      { label: "Arbitrary Write", detail: "File write via path traversal", color: "poison" },
      { label: "Silent Corruption", detail: "Undetected pipeline degradation", color: "dsr" },
      { label: "Long MTTD", detail: "Subtle failures evade detection", color: "reg" },
    ],

    cves: ["CVE-2024-3584"],

    crossReferences: ["DSGAI04", "DSGAI13", "DSGAI21"],
  },

  // =========================================================================
  // DSGAI06 — Tool, Plugin & Agent Data Exchange Risks
  // =========================================================================
  {
    id: "DSGAI06",
    title: "Tool, Plugin & Agent Data Exchange Risks",
    tagline:
      "Full conversation context forwarded to plugin backends and MCP servers outside organizational control — no field-level scoping.",
    category: "identity",
    categoryLabel: "Identity & Access",

    howItUnfolds:
      "AI agents interact with external tools, plugins, and Model Context Protocol (MCP) servers to extend their capabilities beyond text generation. When the LLM invokes a tool, it typically forwards the full conversation context — including system prompts, user data, and prior tool outputs — to the plugin backend. This context forwarding occurs without field-level scoping, meaning sensitive data embedded anywhere in the conversation is transmitted to every tool invoked during the session.\n\nThe risk is amplified by the dynamic nature of the tool ecosystem. MCP servers and plugins can be updated silently by their operators, introducing new data collection behaviors without the consuming organization's knowledge. A tool that was benign at integration time may begin exfiltrating full conversation transcripts after an update. In multi-agent architectures using protocols like A2A (Agent-to-Agent), rogue or compromised agents in the network receive context from trusted agents, creating cross-boundary data theft opportunities.\n\nTool poisoning via MCP metadata represents an emerging threat where malicious tool descriptions manipulate the LLM into invoking the tool in unintended contexts, broadening the data exposure. Data Subject Request (DSR) compliance becomes fragmented because personal data is distributed across multiple tool backends with no centralized inventory of where each datum was sent.",

    illustrativeScenario:
      "A MCP server tool updated silently begins exfiltrating full conversation transcripts. Or a rogue agent in an A2A network receives full context from trusted agents.",

    attackerCapabilities:
      "The attacker can operate as a tool or plugin operator, positioning themselves in the data flow between the LLM and legitimate tools. By registering a malicious MCP server or compromising an existing tool's update pipeline, the attacker receives full conversation context from every session that invokes the tool. In A2A scenarios, the attacker registers a rogue agent that appears legitimate to the orchestration layer. The attack requires no direct access to the organization's infrastructure — the data flows voluntarily to the attacker through the tool invocation mechanism.",

    impact: [
      "Full conversation context drained to external parties",
      "Cross-boundary data theft via compromised tools or rogue agents",
      "DSR compliance fragmentation across tool backends",
    ],

    attackFlow: [
      { label: "LLM Core", sublabel: "Agent invokes tool with full context" },
      { label: "Plugin Invocation", sublabel: "MCP/A2A protocol call" },
      { label: "Malicious Endpoint", sublabel: "Compromised or rogue backend" },
      { label: "Exfiltration", sublabel: "Full context captured externally" },
    ],

    attackVectors: [
      {
        title: "Plugin Post-Update Compromise",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Tool operator pushes silent update", type: "attacker" },
          { label: "Update introduces data collection behavior", type: "action" },
          { label: "Full conversation context forwarded to tool", type: "system" },
          { label: "Sensitive data exfiltrated via legitimate channel", type: "impact" },
        ],
      },
      {
        title: "Rogue Agent via A2A/MCP",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker registers rogue agent in A2A network", type: "attacker" },
          { label: "Orchestrator delegates task to rogue agent", type: "system" },
          { label: "Rogue agent receives full context from trusted agents", type: "leak" },
          { label: "Cross-boundary data theft achieved", type: "impact" },
        ],
      },
      {
        title: "Tool Poisoning via MCP Metadata",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker crafts malicious tool description", type: "attacker" },
          { label: "LLM manipulated into invoking tool in unintended contexts", type: "system" },
          { label: "Broader data exposed through expanded invocation", type: "leak" },
          { label: "Data exposure surface increased", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Tool Inventory and Approval Workflow", scope: "Buy + Build", description: "Maintain a centralized inventory of all tools, plugins, and MCP servers with a formal approval workflow before integration." },
        { title: "Minimal Context Forwarding", scope: "Build", description: "Forward only the minimum context required for each tool invocation, stripping system prompts, prior conversation, and unrelated user data." },
        { title: "MCP Server Pinning and Version Control", scope: "Build", description: "Pin MCP server versions and require explicit approval for updates, preventing silent changes to tool behavior." },
      ],
      tier2: [
        { title: "Field-Level Payload Scoping", scope: "Build", description: "Implement field-level scoping for each tool, defining exactly which data fields are forwarded and blocking all others." },
        { title: "Runtime Tool Behavior Monitoring", scope: "Buy + Build", description: "Monitor tool behavior at runtime to detect anomalous data access patterns, unexpected network calls, or data exfiltration." },
        { title: "Signed Tool Manifests", scope: "Build", description: "Require cryptographically signed manifests for all tools, verifying integrity and provenance before loading." },
      ],
      tier3: [
        { title: "Formal Tool Sandboxing", scope: "Build", description: "Execute tools in sandboxed environments with capability-based security, limiting their access to only explicitly granted resources." },
        { title: "Cross-Agent Data Flow Analysis", scope: "Build", description: "Deploy automated analysis of data flows across agent chains to detect anomalous forwarding patterns and unauthorized data sharing." },
      ],
    },

    impactChips: [
      { label: "Context Drain", detail: "Full conversation sent externally", color: "pii" },
      { label: "Cross-Boundary Theft", detail: "Rogue tools capture data", color: "poison" },
      { label: "DSR Fragmentation", detail: "Data scattered across backends", color: "dsr" },
    ],

    cves: ["CVE-2025-6514"],

    crossReferences: ["DSGAI02", "DSGAI01", "DSGAI15", "OWASP LLM06"],
  },

  // =========================================================================
  // DSGAI07 — Data Governance, Lifecycle & Classification for AI Systems
  // =========================================================================
  {
    id: "DSGAI07",
    title: "Data Governance, Lifecycle & Classification for AI Systems",
    tagline:
      "Classification stops at source records — derived embeddings, weights, and backups carry no label and persist after deletion.",
    category: "governance",
    categoryLabel: "Governance & Lifecycle",

    howItUnfolds:
      "Traditional data governance assigns classification labels (public, internal, confidential, restricted) to source records at rest in databases and file systems. However, AI systems create derivative artifacts — embeddings in vector stores, weights in trained models, cached inference results, and pipeline backups — that inherit the sensitivity of their source data but rarely inherit its classification labels. These derivatives exist outside the scope of existing governance frameworks.\n\nWhen a data subject exercises their right to erasure under GDPR Article 17 or similar regulations, the organization deletes the source record. But the information persists in embeddings that encode the deleted record's semantic content, in model weights that memorized its patterns, and in backup snapshots that predate the deletion. The erasure obligation is violated not through malice but through governance gaps that fail to track data lineage from source through all derivative artifacts.\n\nThe absence of label propagation creates a remediation blind spot. When a breach or compliance incident requires identifying all locations of a specific data category, the organization can audit source systems but cannot scope the impact across AI-derived artifacts. This lineage gap transforms what should be a targeted remediation into an organization-wide uncertainty.",

    illustrativeScenario:
      "A company deletes a customer's records per GDPR request but derived embeddings in the vector store and model weights continue to surface the data.",

    attackerCapabilities:
      "This risk is primarily a governance and compliance failure rather than an attacker-driven threat. However, an adversary aware of the governance gap can exploit it by submitting deletion requests for their own data, verifying the data still surfaces through AI outputs, and using the compliance violation as leverage or as evidence in regulatory complaints. An insider with knowledge of backup and derivative artifact locations could also access data that was nominally deleted from source systems.",

    impact: [
      "Erasure obligations violated across derivative artifacts",
      "Data resurrection from embeddings, weights, and backups",
      "GDPR Article 17 non-compliance",
    ],

    attackFlow: [
      { label: "Unclassified Ingest", sublabel: "Data enters AI pipeline without labels" },
      { label: "Artifacts Created", sublabel: "Embeddings, weights, backups generated" },
      { label: "Source Deleted", sublabel: "Erasure request processed on source" },
      { label: "Artifacts Persist", sublabel: "Derivatives retain deleted data" },
    ],

    attackVectors: [
      {
        title: "No Label Propagation to Embeddings/Weights",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Source data classified and ingested", type: "system" },
          { label: "Embeddings and weights generated without labels", type: "gray" },
          { label: "Classification lost in derivative artifacts", type: "leak" },
          { label: "Governance scope incomplete", type: "impact" },
        ],
      },
      {
        title: "Erasure Obligation Missed on Derived Artifacts",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "DSR erasure request received", type: "action" },
          { label: "Source record deleted successfully", type: "system" },
          { label: "Embeddings and weights retain deleted data", type: "leak" },
          { label: "Erasure obligation violated", type: "impact" },
        ],
      },
      {
        title: "Lineage Gap Blocks Scoped Remediation",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Compliance incident requires data scoping", type: "action" },
          { label: "Source systems audited successfully", type: "system" },
          { label: "Derivative artifacts cannot be traced", type: "gray" },
          { label: "Remediation scope unknown", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Extend Classification to AI-Derived Artifacts", scope: "Build", description: "Extend the organization's data classification framework to cover all AI-derived artifacts including embeddings, model weights, and cached results." },
        { title: "Data Lineage Tracking", scope: "Build", description: "Implement data lineage tracking from source records through embeddings, model training, and all derivative stores." },
        { title: "Retention Policies for Derivative Stores", scope: "Buy + Build", description: "Apply retention and deletion policies to all derivative data stores, ensuring they are covered by the same lifecycle management as source data." },
      ],
      tier2: [
        { title: "Automated Label Propagation", scope: "Build", description: "Automate the propagation of classification labels from source records to their derived embeddings, weights, and backup copies." },
        { title: "Lifecycle Orchestration for Coordinated Deletion", scope: "Build", description: "Orchestrate deletion workflows that coordinate erasure across all derivative artifacts when a source record is deleted." },
        { title: "DBOM / Data Bill of Materials", scope: "Build", description: "Maintain a data bill of materials documenting all data sources, transformations, and derivative artifacts for each AI system." },
      ],
      tier3: [
        { title: "Verifiable Deletion Certificates", scope: "Build", description: "Generate verifiable deletion certificates confirming that data has been removed from all derivative artifacts, not just source systems." },
        { title: "Automated Compliance Auditing", scope: "Build", description: "Implement automated compliance auditing that verifies data lifecycle adherence across the full data lineage graph." },
      ],
    },

    impactChips: [
      { label: "Erasure Violated", detail: "Derivatives retain deleted data", color: "reg" },
      { label: "Data Resurrection", detail: "Deleted data resurfaces via AI", color: "pii" },
      { label: "GDPR Art. 17", detail: "Right to erasure non-compliance", color: "dsr" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI08", "DSGAI17"],
  },

  // =========================================================================
  // DSGAI08 — Non-Compliance & Regulatory Violations
  // =========================================================================
  {
    id: "DSGAI08",
    title: "Non-Compliance & Regulatory Violations",
    tagline:
      "Technical risks from DSGAI01/07 materialize as regulatory violations when organizations cannot demonstrate erasure or lawful basis.",
    category: "compliance",
    categoryLabel: "Compliance & Regulatory",

    howItUnfolds:
      "Non-compliance in AI systems is the downstream consequence of technical data security risks materializing as regulatory violations. When a regulator, data protection authority, or data subject exercises their rights, the organization must demonstrate — not just assert — that it has lawful basis for processing, that it can honor erasure requests completely, and that its data practices conform to applicable regulations including GDPR, CCPA, HIPAA, and the EU AI Act.\n\nThe challenge is that AI systems create unique compliance gaps that traditional data governance cannot address. Model weights may encode personal data from training in ways that cannot be individually inspected or deleted. Embeddings in vector stores represent derived personal data whose legal status is ambiguous. Cross-border data flows through LLM provider APIs may violate data residency requirements. The organization's inability to map these AI-specific data flows to regulatory requirements creates enforcement exposure.\n\nThe EU AI Act introduces additional obligations for high-risk AI systems including mandatory risk assessments, transparency requirements, and human oversight mandates. Organizations deploying GenAI in regulated sectors face compounding requirements from multiple regulatory frameworks, each with different definitions, obligations, and enforcement mechanisms. The penalty landscape is severe — GDPR fines up to 4% of global revenue, EU AI Act fines up to 35 million euros, and potential model suspension orders that halt business operations.",

    illustrativeScenario:
      "A regulator requests evidence of data deletion. The org deleted source records but cannot prove embeddings and model weights don't retain the data.",

    attackerCapabilities:
      "This risk does not typically involve a traditional attacker. Enforcement is driven by regulators, data protection authorities, and data subjects exercising their legal rights. However, adversarial actors may deliberately trigger compliance scrutiny — submitting DSR requests, filing regulatory complaints, or conducting public testing of AI systems to demonstrate non-compliance. Competitors or activists may use regulatory enforcement as a strategic lever against organizations with weak AI governance.",

    impact: [
      "GDPR fines up to 4% of global annual revenue",
      "Model suspension orders halting AI-dependent operations",
      "EU AI Act penalties and mandatory risk assessments",
    ],

    attackFlow: [
      { label: "Technical Risk", sublabel: "DSGAI01/07 data governance gaps" },
      { label: "DSR Request", sublabel: "Data subject or regulator inquiry" },
      { label: "Cannot Demonstrate", sublabel: "Erasure or lawful basis unverifiable" },
      { label: "Enforcement", sublabel: "Fines, suspension, or injunction" },
    ],

    attackVectors: [
      {
        title: "Unlawful Basis / Expired Consent",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Data collected under consent that has expired", type: "gray" },
          { label: "Data used for AI training without renewed basis", type: "system" },
          { label: "Regulator audits lawful basis documentation", type: "action" },
          { label: "Processing found unlawful — enforcement initiated", type: "impact" },
        ],
      },
      {
        title: "Erasure Gap — Weights Retain Deleted Data",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "DSR erasure request received and processed", type: "action" },
          { label: "Source records deleted from primary systems", type: "system" },
          { label: "Model weights and embeddings retain data patterns", type: "leak" },
          { label: "Organization cannot prove complete erasure", type: "impact" },
        ],
      },
      {
        title: "Lineage Absence Blocks Legal Remedy",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Regulatory inquiry requires data flow documentation", type: "action" },
          { label: "AI pipeline data flows undocumented", type: "gray" },
          { label: "Organization cannot demonstrate compliance", type: "leak" },
          { label: "Adverse regulatory finding", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Lawful Basis and Consent Tracking", scope: "Build", description: "Track lawful basis and consent status for every data source used in AI training, fine-tuning, and RAG operations." },
        { title: "DSR Response Workflow for AI Systems", scope: "Build", description: "Extend DSR response workflows to cover AI-specific data stores including vector databases, model registries, and inference caches." },
        { title: "Regulatory Mapping to Pipeline Stages", scope: "Build", description: "Map applicable regulatory requirements to each stage of the AI pipeline, identifying gaps in compliance coverage." },
      ],
      tier2: [
        { title: "Automated Compliance Evidence Generation", scope: "Build", description: "Generate compliance evidence automatically — data flow diagrams, processing records, and deletion confirmations — for regulatory inquiries." },
        { title: "Cross-Jurisdiction Data Flow Tracking", scope: "Buy + Build", description: "Track data flows across jurisdictions to ensure compliance with data residency, transfer, and localization requirements." },
        { title: "EU AI Act Risk Classification", scope: "Build", description: "Classify AI systems according to EU AI Act risk categories and maintain required documentation, risk assessments, and transparency records." },
      ],
      tier3: [
        { title: "Continuous Compliance Monitoring", scope: "Buy + Build", description: "Deploy continuous compliance monitoring that automatically detects and alerts on regulatory non-conformance across AI systems." },
        { title: "Third-Party Audit Readiness Automation", scope: "Build", description: "Automate the preparation of audit artifacts, evidence packages, and compliance documentation for third-party regulatory audits." },
      ],
    },

    impactChips: [
      { label: "GDPR Fines", detail: "Up to 4% of global revenue", color: "reg" },
      { label: "Model Suspension", detail: "Operations halted by order", color: "dsr" },
      { label: "EU AI Act", detail: "High-risk system obligations", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI07", "DSGAI03", "DSGAI15"],
  },

  // =========================================================================
  // DSGAI09 — Multimodal Capture & Cross-Channel Data Leakage
  // =========================================================================
  {
    id: "DSGAI09",
    title: "Multimodal Capture & Cross-Channel Data Leakage",
    tagline:
      "Images, audio, and documents processed for context — OCR/ASR derivatives stored unclassified, enabling biometric and credential leakage.",
    category: "leakage",
    categoryLabel: "Data Leakage",

    howItUnfolds:
      "Multimodal AI systems process images, audio recordings, video frames, and documents to extract contextual information for downstream tasks. Optical Character Recognition (OCR) converts images of text into machine-readable strings; Automatic Speech Recognition (ASR) transcribes audio into text; and vision models extract structured data from documents. These derivative outputs inherit the sensitivity of their source media but are typically stored as unclassified text blobs without metadata indicating their origin or sensitivity.\n\nThe leakage surface is broad. Images may contain embedded EXIF metadata revealing GPS coordinates, device identifiers, and timestamps. Screenshots may capture credentials, private messages, or proprietary interfaces. Audio recordings may include biometric voiceprints that constitute special category data under GDPR Article 9. OCR and ASR derivatives of these media are stored in plain text in object stores, databases, or vector indexes without the access controls or classification that would apply to the original media.\n\nStorage bucket misconfigurations are a leading exposure vector. When OCR/ASR outputs are stored in cloud object storage with default or overly permissive access policies, they become accessible to unauthorized parties. Traditional DLP solutions may not scan these derivative stores because they were not identified as containing sensitive data during the initial data classification exercise.",

    illustrativeScenario:
      "Users upload images with embedded EXIF data and screenshots containing credentials. OCR extracts the text, which is stored unclassified and later exposed via a bucket misconfiguration.",

    attackerCapabilities:
      "The attacker exploits the gap between media processing and derivative data governance. They may discover misconfigured storage buckets through automated scanning, access unclassified OCR/ASR outputs that contain sensitive content, or use cross-modal re-identification techniques to correlate anonymized media derivatives with identifiable individuals. The attack may also be passive — simply submitting media containing sensitive data through legitimate channels, knowing that the organization's processing pipeline will extract and store the content without adequate protection.",

    impact: [
      "Biometric data exposure (voiceprints, facial features)",
      "DLP blind spot for multimodal derivatives",
      "GDPR Article 9 violations for special category data",
    ],

    attackFlow: [
      { label: "Media Upload", sublabel: "Images, audio, documents" },
      { label: "OCR / ASR Extract", sublabel: "Text and features extracted" },
      { label: "Untagged Storage", sublabel: "Derivatives stored without classification" },
      { label: "Bucket Leak", sublabel: "Misconfiguration exposes content" },
    ],

    attackVectors: [
      {
        title: "Storage Bucket Misconfiguration",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "OCR/ASR outputs stored in cloud bucket", type: "system" },
          { label: "Bucket configured with permissive access", type: "gray" },
          { label: "Attacker discovers and accesses bucket", type: "attacker" },
          { label: "Unclassified sensitive derivatives exposed", type: "impact" },
        ],
      },
      {
        title: "Cross-Modal Re-Identification",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Anonymized media derivatives stored separately", type: "system" },
          { label: "Attacker correlates features across modalities", type: "attacker" },
          { label: "Individual re-identified from combined derivatives", type: "leak" },
          { label: "Privacy guarantee invalidated", type: "impact" },
        ],
      },
      {
        title: "Training Pipeline Ingestion Without Consent",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Media derivatives accumulated in data stores", type: "system" },
          { label: "Training pipeline ingests derivatives without consent check", type: "action" },
          { label: "Biometric or sensitive data encoded in model weights", type: "leak" },
          { label: "GDPR Article 9 violation for special category data", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Strip EXIF / Metadata on Upload", scope: "Build", description: "Automatically strip EXIF metadata, GPS coordinates, device identifiers, and other embedded metadata from all uploaded media files." },
        { title: "Classification of OCR/ASR Outputs", scope: "Build", description: "Apply data classification to all OCR and ASR derivative outputs, inheriting at minimum the classification level of the source media." },
        { title: "Bucket Access Controls and Encryption", scope: "Buy + Build", description: "Enforce strict access controls and encryption at rest for all storage buckets containing media derivatives." },
      ],
      tier2: [
        { title: "DLP Scanning for Multimodal Derivatives", scope: "Buy + Build", description: "Extend DLP scanning to cover multimodal derivative stores, detecting credentials, PII, and sensitive content in OCR/ASR outputs." },
        { title: "Consent Tracking for Media Training Use", scope: "Build", description: "Track consent status for all media used in AI training, ensuring biometric and special category data has explicit consent." },
        { title: "Cross-Modal Re-Identification Testing", scope: "Build", description: "Test for cross-modal re-identification risks by attempting to correlate anonymized derivatives across different media types." },
      ],
      tier3: [
        { title: "Automated Biometric Detection and Redaction", scope: "Build", description: "Deploy automated detection and redaction of biometric features in media processing pipelines before derivative creation." },
        { title: "Privacy-Preserving Media Processing", scope: "Build", description: "Implement privacy-preserving processing techniques that extract useful features without retaining identifiable information." },
      ],
    },

    impactChips: [
      { label: "Biometric Exposure", detail: "Voiceprints and facial data", color: "pii" },
      { label: "DLP Blind Spot", detail: "Derivatives outside scanning scope", color: "poison" },
      { label: "GDPR Art. 9", detail: "Special category data violations", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI07", "DSGAI14"],
  },

  // =========================================================================
  // DSGAI10 — Synthetic Data, Anonymization & Transformation Pitfalls
  // =========================================================================
  {
    id: "DSGAI10",
    title: "Synthetic Data, Anonymization & Transformation Pitfalls",
    tagline:
      "De-identification and synthetic generation create a false privacy guarantee — rare records are memorized and re-identifiable via membership inference.",
    category: "governance",
    categoryLabel: "Governance & Lifecycle",

    howItUnfolds:
      "Organizations rely on de-identification and synthetic data generation to enable AI training on sensitive datasets while preserving privacy. The assumption is that removing direct identifiers (names, SSNs, email addresses) or generating synthetic records from statistical distributions provides adequate privacy protection. In practice, this assumption frequently fails — particularly for rare or unique records in the original dataset.\n\nMembership inference attacks can determine with greater than 90% accuracy whether a specific individual's record was included in the training data of a model fine-tuned on de-identified or synthetic data. The model memorizes patterns from rare records because they are statistical outliers that disproportionately influence loss minimization during training. Quasi-identifiers — combinations of seemingly innocuous attributes like zip code, birth date, and gender — enable re-identification when cross-referenced with external datasets.\n\nTransformation pipeline errors compound the problem. A misconfigured anonymization step, a field mapping error, or an incomplete suppression rule can silently pass identifiable data through to the training pipeline. The false sense of security created by the de-identification or synthesis label leads organizations to share the data more broadly and apply fewer access controls, amplifying the exposure when the privacy guarantee is violated.",

    illustrativeScenario:
      "A \"de-identified\" clinical dataset is used to fine-tune a model. Membership inference attacks with >0.9 accuracy confirm specific patients were in the training data.",

    attackerCapabilities:
      "The attacker needs access to the model's inference API and knowledge of potential members of the training population. By submitting carefully crafted queries and analyzing confidence scores, prediction distributions, or loss values, the attacker can determine training set membership. For re-identification, the attacker combines quasi-identifiers in the de-identified dataset with external data sources (voter rolls, social media, public records). The attack is statistically sophisticated but requires no elevated access — only standard model API queries.",

    impact: [
      "Re-identification of individuals in supposedly anonymous data",
      "False security amplifies exposure due to relaxed controls",
    ],

    attackFlow: [
      { label: "De-ID Dataset", sublabel: "Anonymized or synthetic data created" },
      { label: "Fine-Tuned Model", sublabel: "Model trained on transformed data" },
      { label: "Shared Broadly", sublabel: "Relaxed controls due to privacy label" },
      { label: "Re-Identification", sublabel: "Membership inference or quasi-ID linkage" },
    ],

    attackVectors: [
      {
        title: "De-Identification Reversal via Quasi-Identifiers",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "De-identified dataset retains quasi-identifiers", type: "gray" },
          { label: "Attacker cross-references with external data", type: "attacker" },
          { label: "Unique combinations enable re-identification", type: "leak" },
          { label: "Individual privacy violated", type: "impact" },
        ],
      },
      {
        title: "Synthetic Data False Anonymity (MI > 0.9)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Synthetic data generated from sensitive dataset", type: "system" },
          { label: "Model fine-tuned on synthetic data", type: "action" },
          { label: "Membership inference attack probes model", type: "attacker" },
          { label: "Training membership confirmed with >90% accuracy", type: "impact" },
        ],
      },
      {
        title: "Transformation Pipeline Errors",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Anonymization pipeline misconfigured", type: "gray" },
          { label: "Identifiable data passes through suppression", type: "leak" },
          { label: "Data shared broadly under privacy label", type: "action" },
          { label: "Identifiable data exposed to broad audience", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "k-Anonymity and l-Diversity Checks", scope: "Build", description: "Validate de-identified datasets for k-anonymity and l-diversity properties before release, ensuring adequate population coverage." },
        { title: "Membership Inference Testing", scope: "Build", description: "Run membership inference attacks on de-identified and synthetic data outputs as part of the privacy validation process." },
        { title: "Transformation Validation and Audit Logging", scope: "Build", description: "Validate every transformation step in the anonymization pipeline and maintain audit logs of all configuration changes." },
      ],
      tier2: [
        { title: "Differential Privacy in Synthetic Generation", scope: "Build", description: "Apply differential privacy guarantees during synthetic data generation to bound the influence of any individual record." },
        { title: "Automated Quasi-Identifier Detection", scope: "Build", description: "Automatically detect and suppress quasi-identifier combinations that could enable re-identification via external linkage." },
        { title: "Regular Re-Identification Risk Assessments", scope: "Build", description: "Conduct periodic re-identification risk assessments as external datasets evolve and new linkage opportunities emerge." },
      ],
      tier3: [
        { title: "Formal Privacy Guarantees with Epsilon Budgets", scope: "Build", description: "Implement formal differential privacy with tracked epsilon budgets, ensuring cumulative privacy loss remains within defined bounds." },
        { title: "Continuous Privacy Monitoring", scope: "Build", description: "Monitor released datasets continuously for emerging re-identification risks as new external data sources become available." },
      ],
    },

    impactChips: [
      { label: "Re-Identification", detail: "Individuals identified in anonymous data", color: "pii" },
      { label: "False Security", detail: "Relaxed controls amplify exposure", color: "poison" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI18", "DSGAI07"],
  },

  // =========================================================================
  // DSGAI11 — Cross-Context & Multi-User Conversation Bleed
  // =========================================================================
  {
    id: "DSGAI11",
    title: "Cross-Context & Multi-User Conversation Bleed",
    tagline:
      "Shared vector indexes, KV caches, or weak session IDs allow one tenant's prompts and data to leak into another's context.",
    category: "infra",
    categoryLabel: "Infrastructure",

    howItUnfolds:
      "Multi-tenant AI deployments share infrastructure components — vector stores, key-value caches, and inference servers — across multiple users and organizations. When isolation between tenants is insufficient, data from one tenant's session can bleed into another's context. This manifests as cross-tenant document retrieval in shared RAG indexes, KV-cache contamination between concurrent sessions, and session ID enumeration allowing one user to access another's conversation history.\n\nVector store isolation failures are the most common vector. When a shared vector index lacks per-tenant namespace enforcement at the retrieval layer, a query from Tenant B may return documents that belong to Tenant A if those documents are semantically similar to the query. The similarity search is indifferent to ownership — it ranks by vector distance, not access permissions. Server-side filtering may be implemented but is frequently bypassed through direct API access or misconfigured middleware.\n\nKV-cache side-channel attacks, demonstrated at NDSS 2025, exploit shared inference infrastructure where attention key-value caches from one request contaminate subsequent requests on the same hardware. This enables one user to extract tokens from a preceding user's session, including prompts, system instructions, and sensitive outputs. The attack requires no special privileges — only the ability to send inference requests to the shared endpoint.",

    illustrativeScenario:
      "A multi-tenant RAG system shares a single vector index. Tenant B's query retrieves Tenant A's confidential documents due to missing namespace isolation.",

    attackerCapabilities:
      "The attacker needs only legitimate access to the multi-tenant AI service. For vector store bleed, ordinary queries can trigger cross-tenant retrieval without adversarial intent. For KV-cache attacks, the attacker submits carefully timed inference requests to maximize the chance of cache contamination from other sessions. For session enumeration, the attacker probes predictable session ID patterns to access other users' conversation histories. All attacks operate within the authenticated user's normal access channels.",

    impact: [
      "Lateral data exposure between tenants",
      "SaaS isolation guarantees breached",
    ],

    attackFlow: [
      { label: "Tenant A Data", sublabel: "Stored in shared infrastructure" },
      { label: "Shared Index", sublabel: "Vector store, KV cache, or session store" },
      { label: "Tenant B Query", sublabel: "Legitimate query by another tenant" },
      { label: "Cross-Tenant Leak", sublabel: "Tenant A data exposed to Tenant B" },
    ],

    attackVectors: [
      {
        title: "Shared RAG Index Without Tenant Scoping",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Multiple tenants share single vector index", type: "system" },
          { label: "Tenant B submits query", type: "action" },
          { label: "Similarity search returns Tenant A documents", type: "leak" },
          { label: "Cross-tenant data exposure", type: "impact" },
        ],
      },
      {
        title: "KV-Cache Side-Channel (NDSS 2025)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Concurrent sessions share inference hardware", type: "system" },
          { label: "Attacker times requests for cache contamination", type: "attacker" },
          { label: "KV-cache leaks tokens from prior session", type: "leak" },
          { label: "Sensitive prompts and outputs extracted", type: "impact" },
        ],
      },
      {
        title: "Session ID Enumeration",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Session IDs use predictable patterns", type: "gray" },
          { label: "Attacker enumerates valid session IDs", type: "attacker" },
          { label: "Access to other users' conversation histories", type: "leak" },
          { label: "Multi-user privacy breach", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Per-Tenant Namespace Isolation", scope: "Buy + Build", description: "Enforce per-tenant namespace isolation in vector stores, ensuring each tenant's embeddings are stored and queried in separate partitions." },
        { title: "Cryptographic Session IDs", scope: "Build", description: "Use cryptographically random, non-enumerable session identifiers that cannot be predicted or brute-forced." },
        { title: "KV-Cache Isolation Between Users", scope: "Buy + Build", description: "Isolate KV caches between user sessions on shared inference infrastructure, preventing cross-session contamination." },
      ],
      tier2: [
        { title: "Server-Side Tenant Filtering", scope: "Build", description: "Enforce tenant filtering at the retrieval layer server-side, preventing any bypass through direct API access." },
        { title: "Session Replay and Bleed Testing", scope: "Build", description: "Integrate automated session replay and bleed testing into CI/CD to detect cross-tenant data leakage before deployment." },
        { title: "Cross-Tenant Query Monitoring", scope: "Build", description: "Monitor retrieval results for cross-tenant contamination indicators and alert on anomalous patterns." },
      ],
      tier3: [
        { title: "Formal Isolation Verification", scope: "Build", description: "Apply formal verification methods to multi-tenant deployment architectures to prove isolation guarantees." },
        { title: "Side-Channel Resistant Inference Architectures", scope: "Build", description: "Design inference architectures that are resistant to KV-cache and timing side-channel attacks." },
      ],
    },

    impactChips: [
      { label: "Lateral Exposure", detail: "Data crosses tenant boundaries", color: "pii" },
      { label: "SaaS Isolation Breach", detail: "Multi-tenancy guarantees fail", color: "reg" },
    ],

    cves: ["CVE-2025-6515"],

    crossReferences: ["DSGAI01", "DSGAI13", "DSGAI12"],
  },

  // =========================================================================
  // DSGAI12 — Unsafe Natural-Language Data Gateways (LLM-to-SQL/Graph)
  // =========================================================================
  {
    id: "DSGAI12",
    title: "Unsafe Natural-Language Data Gateways (LLM-to-SQL/Graph)",
    tagline:
      "LLM-to-SQL/Graph copilots generate arbitrary queries against privileged connections — prompt injection drives bulk exfiltration.",
    category: "infra",
    categoryLabel: "Infrastructure",

    howItUnfolds:
      "Natural-language data gateways translate user prompts into SQL queries, graph traversals, or API calls, enabling non-technical users to query databases conversationally. The LLM generates the query based on the user's natural language input and the database schema. However, the database connection typically runs with elevated privileges — often at the level of a DBA or service account — because the system needs broad schema access to generate correct queries.\n\nPrompt injection attacks exploit this architecture by crafting inputs that cause the LLM to generate malicious queries. A user might submit a seemingly innocent prompt that includes injection payloads, causing the LLM to produce UNION queries that join sensitive tables not intended for user access, DROP statements, or bulk SELECT operations that exfiltrate entire tables. RAG-injected SQL exfiltration occurs when poisoned documents in the context contain SQL fragments that the LLM incorporates into its generated queries.\n\nThe forensic implications are severe. Because the LLM translates natural language to SQL, the audit trail shows the LLM's service account executing queries — not the original user's intent. Distinguishing between legitimate complex queries and attacker-crafted exfiltration becomes extremely difficult when the SQL was generated by a model rather than written directly by the user.",

    illustrativeScenario:
      "A natural language query interface generates SQL from user prompts. An attacker crafts inputs that produce UNION queries to exfiltrate data from tables the UI was never meant to expose.",

    attackerCapabilities:
      "The attacker needs only standard access to the natural language query interface. By crafting prompts that include SQL injection-like patterns, schema probing questions, or indirect instructions embedded in context, the attacker manipulates the LLM into generating queries that access unauthorized data. The attacker may first probe the schema through innocent-seeming questions (\"what tables are available?\"), then escalate to targeted exfiltration. Cross-tenant JOINs are possible when the database connection has access to multiple tenants' data.",

    impact: [
      "Bulk data exfiltration through generated SQL",
      "DBA-level access through elevated service connections",
      "Forensic blur — LLM-generated queries obscure intent",
    ],

    attackFlow: [
      { label: "NL Input / Injection", sublabel: "Crafted natural language prompt" },
      { label: "LLM Generates SQL", sublabel: "Model translates to database query" },
      { label: "Elevated Account", sublabel: "Query runs with DBA privileges" },
      { label: "Bulk Exfil", sublabel: "Unauthorized data extracted" },
    ],

    attackVectors: [
      {
        title: "RAG-Injected SQL Exfiltration",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Poisoned document contains SQL fragments", type: "attacker" },
          { label: "RAG retrieves document into LLM context", type: "system" },
          { label: "LLM incorporates SQL into generated query", type: "action" },
          { label: "Malicious query exfiltrates sensitive data", type: "impact" },
        ],
      },
      {
        title: "Schema Enumeration → Privilege Escalation",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker probes schema via natural language", type: "attacker" },
          { label: "LLM reveals table names and relationships", type: "leak" },
          { label: "Attacker crafts targeted exfiltration prompts", type: "action" },
          { label: "Privileged connection executes unauthorized queries", type: "impact" },
        ],
      },
      {
        title: "Cross-Tenant JOIN Exploit",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Service account has cross-tenant access", type: "gray" },
          { label: "Attacker crafts JOIN across tenant tables", type: "attacker" },
          { label: "LLM generates valid cross-tenant query", type: "system" },
          { label: "Other tenants' data exfiltrated", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Read-Only Database Connections", scope: "Build", description: "Use read-only database connections with minimal schema exposure, limiting the LLM's generated queries to SELECT on authorized tables only." },
        { title: "Query Allowlist / Blocklist", scope: "Build", description: "Maintain allowlists of permitted query patterns and blocklists for dangerous operations (DROP, DELETE, UNION, cross-schema JOINs)." },
        { title: "Row-Level Security Enforcement", scope: "Buy + Build", description: "Enforce row-level security at the database layer to ensure the user's identity propagates through the LLM-generated query." },
      ],
      tier2: [
        { title: "SQL Query Validation and Parameterization", scope: "Build", description: "Parse and validate all LLM-generated SQL before execution, enforcing parameterization and rejecting dynamic table or column references." },
        { title: "Schema Masking and Table-Level ACLs", scope: "Build", description: "Mask sensitive schema elements from the LLM's visible schema and enforce table-level access control lists per user role." },
        { title: "Query Audit Logging with Anomaly Detection", scope: "Build", description: "Log all generated and executed queries with user attribution, applying anomaly detection to identify unusual query patterns." },
      ],
      tier3: [
        { title: "Formal SQL Grammar Restriction Per Role", scope: "Build", description: "Define formal SQL grammar restrictions per user role, accepting only queries that conform to the allowed grammar subset." },
        { title: "Adversarial Prompt Testing for SQL Injection", scope: "Build", description: "Conduct systematic adversarial prompt testing to discover SQL injection paths through the natural language interface." },
      ],
    },

    impactChips: [
      { label: "Bulk Exfil", detail: "Entire tables exfiltrated via SQL", color: "pii" },
      { label: "DBA-Level Access", detail: "Elevated service connection", color: "poison" },
      { label: "Forensic Blur", detail: "LLM obscures attacker intent", color: "dsr" },
    ],

    cves: ["CVE-2024-8309"],

    crossReferences: ["DSGAI01", "DSGAI11", "DSGAI04"],
  },

  // =========================================================================
  // DSGAI13 — Vector Store Platform Data Security
  // =========================================================================
  {
    id: "DSGAI13",
    title: "Vector Store Platform Data Security",
    tagline:
      "Permissive vector APIs, unencrypted embeddings, and snapshot path traversal enable index exfiltration or full RCE.",
    category: "infra",
    categoryLabel: "Infrastructure",

    howItUnfolds:
      "Vector databases have become critical infrastructure for AI systems, storing the embedding representations that power RAG, semantic search, and recommendation engines. These platforms expose APIs for similarity search, index management, and snapshot operations. When these APIs lack proper authentication, authorization, and rate-limiting, they become direct pathways to the organization's most sensitive data representations.\n\nThe most systematic threat is index exfiltration via k-NN sweeps. An attacker with API access submits a large number of similarity queries with systematically varied vectors, reconstructing the entire index content by collecting nearest-neighbor results. Because each query returns the most similar embeddings, methodical sweeping can map the full embedding space and recover the underlying text through embedding inversion techniques. Snapshot path traversal, as seen in Qdrant CVE-2024-3829, enables even more direct exploitation — crafted snapshot files with path traversal payloads achieve arbitrary file writes or reads during restore.\n\nMulti-tenant namespace confusion arises when a vector store supports multiple tenants through logical separation (collections, namespaces) rather than physical isolation. API-level bugs, misconfigured access policies, or missing namespace enforcement allow queries from one tenant to match embeddings belonging to another, creating cross-tenant data exposure identical to DSGAI11 but at the storage platform level.",

    illustrativeScenario:
      "An attacker discovers an unauthenticated vector store API, performs systematic k-NN queries to reconstruct the entire index, then downloads snapshot files containing sensitive embeddings.",

    attackerCapabilities:
      "The attacker requires network access to the vector store API, which may be exposed on internal networks without authentication or on public endpoints through misconfiguration. For k-NN sweeps, the attacker needs only standard query capabilities — no elevated permissions. For snapshot exploitation, the attacker needs access to the snapshot restore endpoint. The technical sophistication is low; automated tooling for k-NN sweeping and snapshot manipulation is readily available.",

    impact: [
      "Cross-tenant data exposure through namespace confusion",
      "Remote code execution via snapshot path traversal",
      "Index poisoning through unauthorized write access",
    ],

    attackFlow: [
      { label: "Weak API / ACL", sublabel: "Unauthenticated or over-permissive" },
      { label: "k-NN Sweep", sublabel: "Systematic similarity queries" },
      { label: "Index Download", sublabel: "Full index reconstructed" },
      { label: "RCE / Exfil", sublabel: "Snapshot exploit or data theft" },
    ],

    attackVectors: [
      {
        title: "Index Exfiltration via k-NN Sweep",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker accesses vector store API", type: "attacker" },
          { label: "Systematic k-NN queries with varied vectors", type: "action" },
          { label: "Nearest-neighbor results reconstruct full index", type: "leak" },
          { label: "Embedding inversion recovers underlying text", type: "impact" },
        ],
      },
      {
        title: "Snapshot Path Traversal → RCE",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker crafts snapshot with traversal payloads", type: "attacker" },
          { label: "Snapshot uploaded via restore API", type: "action" },
          { label: "Path traversal writes files to arbitrary locations", type: "leak" },
          { label: "Remote code execution achieved", type: "impact" },
        ],
      },
      {
        title: "Multi-Tenant Namespace Confusion",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Tenants share vector store with logical separation", type: "system" },
          { label: "Namespace enforcement missing or bypassed", type: "gray" },
          { label: "Tenant A queries return Tenant B embeddings", type: "leak" },
          { label: "Cross-tenant data exposure", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Authentication and RBAC on All Endpoints", scope: "Buy + Build", description: "Enforce authentication and role-based access control on all vector store API endpoints, including management and snapshot operations." },
        { title: "Encryption at Rest and in Transit", scope: "Buy + Build", description: "Encrypt all stored embeddings at rest and enforce TLS for all API communications." },
        { title: "Network Isolation and Private Endpoints", scope: "Buy + Build", description: "Deploy vector stores behind private endpoints with network-level isolation from public access." },
      ],
      tier2: [
        { title: "Rate-Limiting on Similarity Queries", scope: "Build", description: "Apply rate-limiting and anomaly detection on similarity search queries to detect and block k-NN sweep patterns." },
        { title: "Snapshot Access Controls and Integrity Checks", scope: "Buy + Build", description: "Restrict snapshot operations to authorized administrators and verify snapshot integrity before restore." },
        { title: "Tenant Namespace Enforcement Server-Side", scope: "Build", description: "Enforce tenant namespace isolation at the server side, preventing any cross-namespace query results." },
      ],
      tier3: [
        { title: "Embedding Watermarking and Provenance", scope: "Build", description: "Watermark embeddings for provenance tracking and tampering detection." },
        { title: "Adversarial k-NN Sweep Detection", scope: "Build", description: "Deploy specialized detection for systematic k-NN sweep patterns that indicate index exfiltration attempts." },
      ],
    },

    impactChips: [
      { label: "Cross-Tenant", detail: "Namespace confusion exposure", color: "pii" },
      { label: "RCE", detail: "Remote code execution via snapshots", color: "poison" },
      { label: "Index Poisoning", detail: "Unauthorized write corrupts search", color: "dsr" },
    ],

    cves: ["CVE-2024-3829"],

    crossReferences: ["DSGAI05", "DSGAI11", "DSGAI17"],
  },

  // =========================================================================
  // DSGAI14 — Excessive Telemetry & Monitoring Leakage
  // =========================================================================
  {
    id: "DSGAI14",
    title: "Excessive Telemetry & Monitoring Leakage",
    tagline:
      "Observability stacks aggregating full prompts, tokens, and tool outputs become the easiest exfiltration path — bypassing data classification.",
    category: "governance",
    categoryLabel: "Governance & Lifecycle",

    howItUnfolds:
      "Observability is critical for operating AI systems — teams need visibility into prompt quality, response latency, token usage, and error rates. However, the observability stack itself becomes a high-value target when it aggregates full prompt-response pairs, tool invocation payloads, and chain-of-thought reasoning traces. These logs concentrate sensitive data from every interaction into a single, searchable repository.\n\nDebug mode is the most common enabler. Developers activate verbose logging during development to diagnose model behavior, and the setting persists into production. Full prompts — including system instructions, RAG context, and user inputs — are captured alongside full responses and tool outputs. The SIEM, APM, or log aggregation platform now contains a complete record of every sensitive interaction, searchable by any analyst with platform access.\n\nThird-party observability vendors add another dimension of risk. When full AI telemetry is forwarded to a SaaS APM or logging platform, the organization has effectively created a shadow copy of all AI interactions outside its direct control. If the vendor is breached, or if the vendor's data retention policies exceed the organization's requirements, months of sensitive transcripts become retroactively exposed. The irony is that the very systems built to detect security incidents become the most attractive target for data exfiltration.",

    illustrativeScenario:
      "Debug logging is left enabled in production, capturing full prompts and responses including PII. An attacker compromises the observability platform and bulk-exports months of sensitive transcripts.",

    attackerCapabilities:
      "The attacker targets the observability platform rather than the AI system itself. Compromising a SIEM analyst account through phishing, credential stuffing, or social engineering provides access to months of full AI interaction logs. Alternatively, the attacker may target the third-party APM vendor's infrastructure. The logs are particularly valuable because they are pre-aggregated, searchable, and contain data from every user session — making them a far more efficient exfiltration target than attacking the AI system directly.",

    impact: [
      "Retroactive exposure of months of AI interaction data",
      "Credential harvest from logged tool outputs and prompts",
    ],

    attackFlow: [
      { label: "Debug Mode On", sublabel: "Verbose logging in production" },
      { label: "SIEM Aggregates", sublabel: "Full prompts and responses stored" },
      { label: "Analyst Phished", sublabel: "Observability platform compromised" },
      { label: "Bulk Export", sublabel: "Months of transcripts exfiltrated" },
    ],

    attackVectors: [
      {
        title: "Debug Mode Left Permanently Enabled",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Developer enables debug logging for development", type: "action" },
          { label: "Debug mode persists into production", type: "gray" },
          { label: "Full prompts and responses captured in logs", type: "leak" },
          { label: "Sensitive data aggregated in log platform", type: "impact" },
        ],
      },
      {
        title: "Third-Party APM Vendor Risk",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "AI telemetry forwarded to SaaS APM vendor", type: "system" },
          { label: "Vendor retains data beyond organization's policy", type: "gray" },
          { label: "Vendor experiences security incident", type: "action" },
          { label: "Organization's AI interaction data exposed", type: "impact" },
        ],
      },
      {
        title: "Mis-Scoped SIEM Credential Harvest",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "SIEM analyst credentials compromised", type: "attacker" },
          { label: "Attacker accesses full AI log repository", type: "action" },
          { label: "Searches for credentials and PII in logged prompts", type: "leak" },
          { label: "Bulk export of sensitive transcripts", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Least-Logging Defaults", scope: "Build", description: "Default to minimal logging that excludes full prompt and response bodies, requiring explicit opt-in for verbose logging with approval." },
        { title: "Tokenization / Redaction of Prompts in Logs", scope: "Build", description: "Apply tokenization or redaction to sensitive fields in prompts and responses before they reach the log pipeline." },
        { title: "Short TTL for Debug Traces", scope: "Build", description: "Set aggressive TTL on debug-level traces so they are automatically purged within hours rather than persisting indefinitely." },
      ],
      tier2: [
        { title: "Access Controls on Observability Platforms", scope: "Buy + Build", description: "Enforce role-based access controls on observability platforms, limiting who can search, export, and download AI interaction logs." },
        { title: "Automated PII Scanning in Log Pipelines", scope: "Buy + Build", description: "Deploy automated PII detection and masking in the log ingestion pipeline before data reaches the aggregation platform." },
        { title: "Approval Workflows for Debug Mode", scope: "Build", description: "Require formal approval with automatic time-limited activation for debug mode in production environments." },
      ],
      tier3: [
        { title: "Continuous Telemetry Exposure Monitoring", scope: "Build", description: "Continuously monitor the telemetry exposure surface for new sensitive data patterns and coverage gaps." },
        { title: "Third-Party APM Security Assessment", scope: "Buy", description: "Conduct regular security assessments of third-party APM vendors handling AI telemetry data." },
      ],
    },

    impactChips: [
      { label: "Retroactive Exposure", detail: "Months of transcripts at risk", color: "pii" },
      { label: "Credential Harvest", detail: "Secrets logged in prompts", color: "poison" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI03", "DSGAI07"],
  },

  // =========================================================================
  // DSGAI15 — Over-Broad Context Windows & Prompt Over-Sharing
  // =========================================================================
  {
    id: "DSGAI15",
    title: "Over-Broad Context Windows & Prompt Over-Sharing",
    tagline:
      "Full records auto-appended to prompts and sent to external LLM providers — far beyond what the task requires.",
    category: "compliance",
    categoryLabel: "Compliance & Regulatory",

    howItUnfolds:
      "LLM integration frameworks and application gateways often auto-append contextual information to every prompt to improve response quality. A customer service application might attach the customer's full 360-degree profile — name, address, payment methods, support history, and account notes — to every prompt, even when the user's question only requires the customer's subscription tier. This over-sharing sends far more personal data to the LLM provider than the task requires.\n\nThe problem is systemic in framework defaults. Many LLM integration libraries include auto-context features that pull related records from connected data sources and append them to prompts. Developers enable these features during prototyping for convenience and never disable them. Edge caching of prompts and responses compounds the issue — even if the provider deletes data per policy, cached copies at CDN nodes or API gateways may persist.\n\nThe compliance dimension is twofold. First, sending excessive personal data to an external LLM provider without purpose limitation violates data minimization principles under GDPR and similar frameworks. Second, if the provider experiences a data incident, the blast radius includes all the over-shared data that was never necessary for the task. The organization cannot limit its exposure because it never limited the data it sent.",

    illustrativeScenario:
      "A customer service LLM gateway automatically appends full customer profiles (address, payment, support history) to every prompt, sending far more PII to the external provider than needed.",

    attackerCapabilities:
      "An attacker targeting the LLM provider or the network path between the organization and the provider gains access to far more data than should have been transmitted. The over-sharing creates a concentration of sensitive data in transit that would not exist under proper data minimization. An attacker who compromises the edge cache or the provider's prompt storage gains access to full customer profiles rather than the minimal data fragments the task required. The attacker benefits passively from the organization's failure to minimize context.",

    impact: [
      "PII overexposure to external LLM providers",
      "Impossible to contain provider incidents due to excessive data sharing",
      "Purpose limitation violations under GDPR",
    ],

    attackFlow: [
      { label: "Simple Query", sublabel: "User asks basic question" },
      { label: "Gateway Appends 360-Degree Profile", sublabel: "Full customer record attached" },
      { label: "External Provider", sublabel: "Receives far more data than needed" },
      { label: "Provider Incident", sublabel: "Excessive data exposed in breach" },
    ],

    attackVectors: [
      {
        title: "Provider Prompt Retention Breach",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Full profiles appended to every prompt", type: "system" },
          { label: "Provider retains prompt data", type: "gray" },
          { label: "Provider suffers security incident", type: "action" },
          { label: "Massive PII exposure from over-shared prompts", type: "impact" },
        ],
      },
      {
        title: "Edge Cache Misconfiguration",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Prompts with full context cached at edge nodes", type: "system" },
          { label: "Cache retention exceeds data policy", type: "gray" },
          { label: "Attacker accesses cached prompt data", type: "attacker" },
          { label: "Sensitive data exposed from cache", type: "impact" },
        ],
      },
      {
        title: "Framework Default Auto-Context Feature",
        riskLevel: "PERSISTENT RISK",
        steps: [
          { label: "Developer enables auto-context during prototyping", type: "action" },
          { label: "Feature persists into production", type: "gray" },
          { label: "Every prompt includes unnecessary context", type: "leak" },
          { label: "Continuous data minimization violation", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Context Minimization Review", scope: "Build", description: "Review all LLM integrations for context minimization, ensuring only data required for the specific task is included in prompts." },
        { title: "Disable Framework Auto-Context Defaults", scope: "Build", description: "Explicitly disable auto-context features in LLM integration frameworks and require manual, reviewed context configuration." },
        { title: "Prompt Template Auditing", scope: "Build", description: "Audit all prompt templates for unnecessary data inclusion, verifying each field is required for the task." },
      ],
      tier2: [
        { title: "Dynamic Context Scoping", scope: "Build", description: "Implement dynamic context scoping that analyzes query intent and includes only the relevant data fields for each specific request." },
        { title: "Provider Data Retention Policy Enforcement", scope: "Buy + Build", description: "Enforce and verify LLM provider data retention policies through contractual requirements and technical controls." },
        { title: "Prompt-Level DLP Scanning", scope: "Buy + Build", description: "Apply DLP scanning to assembled prompts before transmission to external providers, blocking prompts with excessive sensitive data." },
      ],
      tier3: [
        { title: "Automated Context Minimization Optimization", scope: "Build", description: "Build automated systems that analyze prompt-response quality to identify the minimum context needed for adequate performance." },
        { title: "Formal Purpose Limitation Enforcement", scope: "Build", description: "Implement formal purpose limitation enforcement that maps each data field to its processing purpose and blocks inclusion without a matching purpose." },
      ],
    },

    impactChips: [
      { label: "PII Overexposure", detail: "Excessive data sent to providers", color: "pii" },
      { label: "Impossible Containment", detail: "Cannot limit breach scope", color: "dsr" },
      { label: "Purpose Limitation", detail: "GDPR minimization violation", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI03", "DSGAI08", "DSGAI06"],
  },

  // =========================================================================
  // DSGAI16 — Endpoint & Browser Assistant Overreach
  // =========================================================================
  {
    id: "DSGAI16",
    title: "Endpoint & Browser Assistant Overreach",
    tagline:
      "AI extensions with broad permissions hijacked via HashJack URL injection to exfiltrate SSH keys, .env, and intranet content.",
    category: "attack",
    categoryLabel: "Adversarial Attacks",

    howItUnfolds:
      "Browser-based AI assistants and extensions request broad permissions — \"read all sites,\" \"access clipboard,\" \"read local files\" — to provide comprehensive assistance across the user's browsing experience. These permissions create an expansive attack surface when the extension encounters adversarial content. The HashJack technique demonstrates how a malicious web page can inject instructions into the URL fragment (the portion after the # character), which AI extensions often read as part of the page context.\n\nWhen the AI extension processes a page containing a HashJack injection, it follows the embedded instructions because it cannot distinguish between legitimate page content and adversarial payloads. With \"read all sites\" permission, the extension can access intranet pages, local file:// URLs, clipboard contents, and DOM elements from any open tab. The injected instruction directs the extension to read sensitive local files — SSH keys, .env files, browser cookies — and exfiltrate them through the extension's legitimate network channels.\n\nMalicious extension updates represent a supply chain variant of this attack. A legitimate extension with an established user base is acquired or compromised, and a silent update introduces data collection capabilities. Because users have already granted broad permissions, the updated extension immediately has access to everything the permissions allow. CASB and endpoint protection tools are largely blind to this vector because extension-to-cloud communication appears as legitimate HTTPS traffic from a trusted extension.",

    illustrativeScenario:
      "A browser AI extension with \"read all sites\" permission encounters a page with a hidden prompt injection in the URL fragment. The extension follows the injected instruction and exfiltrates local file contents.",

    attackerCapabilities:
      "The attacker operates remotely by publishing a web page containing HashJack injection payloads or by compromising existing pages. No access to the target's infrastructure is required — the extension's broad permissions are the access mechanism. For supply chain attacks, the attacker acquires or compromises an extension developer account and pushes a malicious update through the extension store's review process. The attacker receives exfiltrated data through the extension's network communication channel.",

    impact: [
      "SSH key and credential theft from local filesystem",
      "CASB blind spot — extension traffic appears legitimate",
      "Local memory and browsing data targeted for exfiltration",
    ],

    attackFlow: [
      { label: "Malicious Page", sublabel: "Contains HashJack or injection payload" },
      { label: "Extension Reads DOM", sublabel: "Broad permissions grant full access" },
      { label: "Injected Instruction", sublabel: "Extension follows adversarial commands" },
      { label: "Local Files Exfil", sublabel: "SSH keys, .env, credentials stolen" },
    ],

    attackVectors: [
      {
        title: "HashJack URL Fragment Injection",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker crafts page with injection in URL fragment", type: "attacker" },
          { label: "User visits page with AI extension active", type: "action" },
          { label: "Extension reads URL fragment as context", type: "system" },
          { label: "Injected instructions exfiltrate local files", type: "impact" },
        ],
      },
      {
        title: "Malicious Extension Update (Supply Chain)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker compromises extension developer account", type: "attacker" },
          { label: "Malicious update pushed to extension store", type: "action" },
          { label: "Update leverages existing broad permissions", type: "system" },
          { label: "Data collected from all extension users", type: "impact" },
        ],
      },
      {
        title: "Sensitive Console in Extension-Active Session",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "User accesses sensitive console with extension active", type: "action" },
          { label: "Extension reads DOM including credentials", type: "system" },
          { label: "Sensitive data captured in extension context", type: "leak" },
          { label: "Data exfiltrated or logged by extension", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Extension Permission Review", scope: "Buy + Build", description: "Review and enforce least-privilege permissions for all AI browser extensions, rejecting extensions that request unnecessary broad access." },
        { title: "Extension Allowlisting", scope: "Buy", description: "Maintain an allowlist of approved AI extensions via endpoint management, blocking all unapproved extensions." },
        { title: "User Awareness Training", scope: "Build", description: "Train users to recognize the risks of broad-permission AI extensions and to disable extensions when accessing sensitive systems." },
      ],
      tier2: [
        { title: "Extension Behavior Monitoring", scope: "Buy + Build", description: "Monitor AI extension behavior for anomalous file access, network requests, and DOM reading patterns that indicate compromise." },
        { title: "URL Fragment Sanitization", scope: "Build", description: "Sanitize URL fragments in extension inputs to prevent HashJack-style prompt injection attacks." },
        { title: "CSP Enforcement on Extension-Accessible Pages", scope: "Build", description: "Deploy Content Security Policy headers that limit what extensions can read and transmit from sensitive internal pages." },
      ],
      tier3: [
        { title: "Formal Extension Security Assessment", scope: "Buy + Build", description: "Conduct formal security assessments of AI extensions before approval, including code review, permission analysis, and update monitoring." },
        { title: "Browser-Level AI Sandboxing", scope: "Buy", description: "Advocate for and adopt browser platforms that provide AI-specific sandboxing, isolating extension AI capabilities from sensitive browser contexts." },
      ],
    },

    impactChips: [
      { label: "SSH Key Theft", detail: "Local credentials exfiltrated", color: "pii" },
      { label: "CASB Blind Spot", detail: "Extension traffic looks legitimate", color: "poison" },
      { label: "Local Memory Target", detail: "Browsing data and files at risk", color: "dsr" },
    ],

    cves: [],

    crossReferences: ["DSGAI06", "DSGAI01", "DSGAI03"],
  },

  // =========================================================================
  // DSGAI17 — Data Availability & Resilience Failures in AI Pipelines
  // =========================================================================
  {
    id: "DSGAI17",
    title: "Data Availability & Resilience Failures in AI Pipelines",
    tagline:
      "Silent failover to stale vector DB replica produces misinformation indistinguishable from correct output — including resurrecting DSR-erased records.",
    category: "infra",
    categoryLabel: "Infrastructure",

    howItUnfolds:
      "AI systems depend on data infrastructure — vector databases, feature stores, model registries, and caching layers — that must maintain availability, consistency, and integrity. When primary data stores fail, systems typically fail over to replicas or backup stores. In traditional database systems, staleness in replicas is manageable because applications can detect and handle consistency gaps. AI systems are different: a stale vector DB replica produces outputs that are indistinguishable from correct outputs because the model generates fluent, confident responses regardless of the underlying data quality.\n\nThe DSR compliance implications are severe. When a data subject's records are deleted from the primary vector store per an erasure request, but the deletion has not yet propagated to the failover replica, a failover event effectively resurrects the deleted data. The system serves queries using embeddings that should have been erased, violating the erasure obligation without any indication to the user or the organization that the deletion was bypassed.\n\nCorrupted artifact restores present another dimension of risk. When a model or vector store is restored from backup after an incident, the restore process may reintroduce data that was deleted, modified, or corrupted before the backup was taken. Without integrity verification during restore, the organization cannot confirm that the restored state is clean, consistent, and compliant with current data obligations.",

    illustrativeScenario:
      "A vector DB primary fails under load. The system silently fails over to a stale replica that still contains embeddings deleted per GDPR erasure requests.",

    attackerCapabilities:
      "An attacker can intentionally trigger failover by overwhelming the primary vector store with a query burst, forcing the system to fall back to a stale replica. This is a low-sophistication denial-of-service that doubles as a data integrity attack — the attacker does not need to compromise the system, only degrade its performance enough to trigger automated failover. The attacker may also exploit the window between deletion on the primary and propagation to replicas to query data that was supposed to be erased.",

    impact: [
      "Silent misinformation from stale replicas",
      "DSR violation through data resurrection in failover",
      "Unverifiable recovery integrity after restore",
    ],

    attackFlow: [
      { label: "Vector DB Fails", sublabel: "Primary overwhelmed or crashes" },
      { label: "Stale Failover", sublabel: "Replica with outdated data serves requests" },
      { label: "No Staleness Signal", sublabel: "Outputs indistinguishable from correct" },
      { label: "Silent Misinformation", sublabel: "Wrong or deleted data served" },
    ],

    attackVectors: [
      {
        title: "Vector DB Saturation Under Query Burst",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker sends query burst to primary", type: "attacker" },
          { label: "Primary overwhelmed and fails", type: "system" },
          { label: "Automated failover to stale replica", type: "action" },
          { label: "Stale data served without indication", type: "impact" },
        ],
      },
      {
        title: "Stale Replica Serves DSR-Deleted Records",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Erasure request processed on primary", type: "action" },
          { label: "Deletion not yet propagated to replica", type: "gray" },
          { label: "Failover activates stale replica", type: "system" },
          { label: "Deleted data resurrected and served", type: "impact" },
        ],
      },
      {
        title: "Corrupted Artifact — Unvalidated Restore",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "System restored from backup after incident", type: "action" },
          { label: "Backup predates deletions and corrections", type: "gray" },
          { label: "Restore proceeds without integrity verification", type: "system" },
          { label: "Non-compliant state reintroduced", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Encrypted Backups with Tested Restore", scope: "Buy + Build", description: "Maintain encrypted backups with regularly tested restore procedures, verifying data integrity and compliance state after restore." },
        { title: "Rate Limits and Abuse Controls", scope: "Buy + Build", description: "Apply rate limits and abuse detection on vector store endpoints to prevent intentional saturation attacks." },
        { title: "Integrity Checks on Restore", scope: "Build", description: "Validate data integrity, compliance state, and deletion status after every restore operation before serving traffic." },
      ],
      tier2: [
        { title: "Staleness Detection and Signaling", scope: "Build", description: "Implement staleness detection in failover paths that signals to the application when data may be stale, enabling degraded-mode responses." },
        { title: "Synchronized Deletion Across Replicas", scope: "Build", description: "Ensure deletion operations propagate synchronously to all replicas before acknowledging completion of erasure requests." },
        { title: "RTO/RPO for AI Data Dependencies", scope: "Build", description: "Define and enforce recovery time and recovery point objectives for all AI data dependencies, including vector stores and feature stores." },
      ],
      tier3: [
        { title: "Chaos Engineering for AI Pipelines", scope: "Build", description: "Apply chaos engineering practices to AI data infrastructure, testing failover, staleness, and recovery scenarios under realistic conditions." },
        { title: "Automated Integrity Verification Across Replicas", scope: "Build", description: "Automate continuous integrity verification across all data replicas, detecting and alerting on divergence." },
      ],
    },

    impactChips: [
      { label: "Silent Misinformation", detail: "Stale data indistinguishable from correct", color: "poison" },
      { label: "DSR Violation", detail: "Deleted data resurrected in failover", color: "dsr" },
      { label: "Unverifiable Recovery", detail: "Restore integrity unknown", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI07", "DSGAI08", "DSGAI13"],
  },

  // =========================================================================
  // DSGAI18 — Inference & Data Reconstruction
  // =========================================================================
  {
    id: "DSGAI18",
    title: "Inference & Data Reconstruction",
    tagline:
      "Iterative querying infers training membership or reconstructs sensitive data — no raw record ever directly exposed.",
    category: "attack",
    categoryLabel: "Adversarial Attacks",

    howItUnfolds:
      "Inference and data reconstruction attacks extract private information from AI models without the model ever directly outputting a raw training record. Instead, the attacker accumulates statistical signals across many queries to infer properties of the training data. Membership inference attacks determine whether a specific individual's data was used in training by analyzing differences in model confidence, loss values, or output distributions for known versus unknown records.\n\nRecent research presented at SaTML 2026 demonstrated membership inference accuracy exceeding 90% against fine-tuned language models, meaning an attacker can confirm with high confidence whether a specific person's medical records, financial data, or communications were included in the training dataset. This constitutes a privacy violation even though no record was directly exposed — the confirmation itself reveals sensitive information about the individual's relationship with the data controller.\n\nEmbedding inversion via k-NN sweeps extends the threat to vector stores. By systematically probing the nearest-neighbor relationships in an embedding space, an attacker can reconstruct approximate representations of the original text that produced each embedding. Cross-session signal accumulation in RAG systems allows an attacker to piece together sensitive information across multiple sessions, each revealing a different fragment, until the complete record is reconstructed. LoRA adapter extraction enables recovery of fine-tuning data by isolating the adapter weights and analyzing their influence on outputs.",

    illustrativeScenario:
      "An attacker submits thousands of carefully crafted queries and analyzes confidence scores to determine with >90% accuracy whether specific individuals were in the training data.",

    attackerCapabilities:
      "The attacker requires only standard API access to the model's inference endpoint. No elevated privileges, insider access, or infrastructure compromise is needed. The attack uses legitimate API calls — the only distinguishing characteristic is the volume and systematic nature of the queries. The attacker needs knowledge of potential training data members (e.g., a list of patients at a hospital that used AI) and the statistical expertise to design and interpret membership inference probes. Automated tooling for these attacks is publicly available in academic research repositories.",

    impact: [
      "Indirect privacy breach through statistical inference",
      "LoRA adapter extraction revealing fine-tuning data",
    ],

    attackFlow: [
      { label: "Iterative Probes", sublabel: "Thousands of crafted queries" },
      { label: "Signal Accumulation", sublabel: "Confidence and distribution analysis" },
      { label: "Membership Confirmed", sublabel: ">90% accuracy achieved" },
      { label: "Privacy Violation", sublabel: "Training data participation revealed" },
    ],

    attackVectors: [
      {
        title: "Membership Inference (>0.9 Accuracy, SaTML 2026)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker identifies potential training members", type: "attacker" },
          { label: "Crafted queries probe model confidence per member", type: "action" },
          { label: "Statistical analysis of output distributions", type: "system" },
          { label: "Training membership confirmed with >90% accuracy", type: "impact" },
        ],
      },
      {
        title: "Embedding Inversion via k-NN Sweep",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker systematically queries vector store", type: "attacker" },
          { label: "Nearest-neighbor relationships mapped", type: "action" },
          { label: "Embedding inversion reconstructs source text", type: "leak" },
          { label: "Sensitive content recovered from embeddings", type: "impact" },
        ],
      },
      {
        title: "RAG Cross-Session Signal Accumulation",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker queries across multiple sessions", type: "attacker" },
          { label: "Each session reveals different data fragments", type: "system" },
          { label: "Fragments assembled into complete records", type: "leak" },
          { label: "Sensitive data reconstructed without direct exposure", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Output Confidence Score Suppression", scope: "Build", description: "Suppress or coarsen confidence scores, logits, and probability distributions in API responses to reduce the signal available for inference attacks." },
        { title: "Rate-Limiting on Repetitive Query Patterns", scope: "Build", description: "Detect and rate-limit repetitive query patterns that indicate systematic probing for membership inference or reconstruction." },
        { title: "Response Perturbation / Rounding", scope: "Build", description: "Add calibrated noise or rounding to model outputs to reduce the precision of signals available for statistical inference." },
      ],
      tier2: [
        { title: "Membership Inference Testing", scope: "Build", description: "Include membership inference attack testing in the model evaluation pipeline, measuring vulnerability before deployment." },
        { title: "Query Pattern Anomaly Detection", scope: "Build", description: "Deploy anomaly detection on query patterns to identify systematic probing that differs from legitimate usage." },
        { title: "Embedding Access Controls and Rate-Limiting", scope: "Build", description: "Apply access controls and rate-limiting on embedding-level access to prevent k-NN sweep reconstructions." },
      ],
      tier3: [
        { title: "Differential Privacy in Training", scope: "Build", description: "Train models with differential privacy to provide formal guarantees limiting the influence of any individual training record on outputs." },
        { title: "Formal Privacy Auditing with Epsilon Tracking", scope: "Build", description: "Implement formal privacy auditing that tracks cumulative epsilon spending across all queries to maintain privacy budgets." },
        { title: "Adversarial Inference Red-Teaming", scope: "Build", description: "Conduct dedicated red-team exercises focused on inference and reconstruction attacks using state-of-the-art techniques." },
      ],
    },

    impactChips: [
      { label: "Indirect Inference Breach", detail: "No raw record exposed, privacy still violated", color: "pii" },
      { label: "LoRA Extraction", detail: "Fine-tuning data recoverable", color: "poison" },
    ],

    cves: [],

    crossReferences: ["DSGAI10", "DSGAI13", "DSGAI01", "DSGAI20"],
  },

  // =========================================================================
  // DSGAI19 — Human-in-the-Loop & Labeler Overexposure
  // =========================================================================
  {
    id: "DSGAI19",
    title: "Human-in-the-Loop & Labeler Overexposure",
    tagline:
      "RLHF and annotation pipelines expose un-minimized sensitive records to large, poorly-controlled crowd labeler populations.",
    category: "governance",
    categoryLabel: "Governance & Lifecycle",

    howItUnfolds:
      "Reinforcement Learning from Human Feedback (RLHF) and supervised annotation require human labelers to review, rate, and correct model outputs. These labeling operations process the same sensitive data that flows through the AI system — customer conversations, medical records, financial documents, and internal communications. When batches are exported to labeling platforms, the data often arrives un-minimized, containing full records with all fields rather than only the fields relevant to the labeling task.\n\nThe labeler population compounds the risk. Crowd labeling platforms employ large, globally distributed workforces with varying security postures. Labelers often work from personal devices without endpoint protection, on uncontrolled networks, and under contracts that may not include adequate confidentiality provisions. A single batch export to a crowd platform can expose thousands of sensitive records to hundreds of labelers simultaneously.\n\nTask field creep is a particularly insidious variant. The initial labeling task specification may correctly minimize data fields, but as the task evolves — new annotation categories, edge case resolution, quality review workflows — additional fields are silently added to the export. The minimization boundary erodes incrementally without formal review, and the expanded data exposure persists until someone audits the export configuration. Without robust audit trails, the organization cannot determine which labelers accessed which records or whether any exfiltration occurred.",

    illustrativeScenario:
      "A healthcare AI project exports full patient records to a crowd-labeling platform for annotation. Labelers with personal devices access unredacted PHI, and one labeler's compromised machine exfiltrates the batch.",

    attackerCapabilities:
      "An insider threat from within the labeler population is the primary concern. A malicious or compromised labeler can photograph screens, copy text from the labeling interface, or exfiltrate data through a compromised endpoint. An external attacker may also target the labeling platform itself — compromising the platform's infrastructure gives access to all exported batches from all clients. The attacker benefits from the high volume and poor controls typical of crowd labeling operations.",

    impact: [
      "Mass exposure of sensitive data to poorly-controlled populations",
      "Insider threat amplified by personal device access",
      "No audit trail for labeler data access and handling",
    ],

    attackFlow: [
      { label: "Export Batch", sublabel: "Un-minimized data sent to platform" },
      { label: "Crowd Platform", sublabel: "Global labeler workforce" },
      { label: "Labelers See Full PII", sublabel: "Unredacted sensitive records" },
      { label: "Insider Exfil", sublabel: "Data stolen via compromised device" },
    ],

    attackVectors: [
      {
        title: "Crowd Platform PHI Export Without Minimization",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Full records exported to labeling platform", type: "action" },
          { label: "Hundreds of labelers access unredacted data", type: "system" },
          { label: "PHI visible beyond minimum needed for task", type: "leak" },
          { label: "Mass exposure to uncontrolled population", type: "impact" },
        ],
      },
      {
        title: "Malware on Labeler Endpoint",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Labeler uses personal device with malware", type: "gray" },
          { label: "Labeler accesses sensitive records through platform", type: "action" },
          { label: "Malware captures displayed data", type: "attacker" },
          { label: "Sensitive records exfiltrated to attacker", type: "impact" },
        ],
      },
      {
        title: "Task Field Creep — Minimization Silently Broken",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Initial export correctly minimized", type: "system" },
          { label: "Task evolution adds additional fields", type: "action" },
          { label: "Expanded fields included without review", type: "leak" },
          { label: "Minimization boundary eroded over time", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Data Minimization Before Export", scope: "Build", description: "Enforce strict data minimization on all exports to labeling platforms, including only fields required for the specific annotation task." },
        { title: "Labeler Access Controls and NDAs", scope: "Buy + Build", description: "Implement granular access controls for labelers with enforced NDAs, background checks, and data handling agreements." },
        { title: "Audit Logging of Labeler Data Access", scope: "Build", description: "Log all labeler data access events including which records were viewed, for how long, and from which endpoint." },
      ],
      tier2: [
        { title: "Automated PII Redaction in Labeling Pipelines", scope: "Build", description: "Deploy automated PII detection and redaction in the export pipeline before data reaches the labeling platform." },
        { title: "Secure Labeling Environments with DLP", scope: "Buy + Build", description: "Provide secure labeling environments with DLP controls that prevent screenshot, copy, and download of sensitive data." },
        { title: "Regular Minimization Drift Checks", scope: "Build", description: "Conduct regular audits of labeling export configurations to detect field creep and minimization drift." },
      ],
      tier3: [
        { title: "Federated Labeling Without Data Export", scope: "Build", description: "Implement federated labeling architectures where labelers annotate data in-place without any export to external platforms." },
        { title: "Formal Labeler Security Assessment", scope: "Build", description: "Conduct formal security assessments of labeling platforms and their workforce, including endpoint security and data handling practices." },
      ],
    },

    impactChips: [
      { label: "Mass Exposure", detail: "Records sent to large labeler pool", color: "pii" },
      { label: "Insider Threat", detail: "Compromised labeler devices", color: "poison" },
      { label: "No Audit Trail", detail: "Access logging insufficient", color: "dsr" },
    ],

    cves: [],

    crossReferences: ["DSGAI01", "DSGAI07", "DSGAI03"],
  },

  // =========================================================================
  // DSGAI20 — Model Exfiltration & IP Replication
  // =========================================================================
  {
    id: "DSGAI20",
    title: "Model Exfiltration & IP Replication",
    tagline:
      "Systematic API probing harvests 100K+ input/output pairs for knowledge distillation — replicating proprietary reasoning.",
    category: "attack",
    categoryLabel: "Adversarial Attacks",

    howItUnfolds:
      "Model exfiltration attacks aim to replicate a proprietary model's capabilities without access to its weights, architecture, or training data. The attacker systematically queries the model's API, collecting a large corpus of input-output pairs (typically 100,000+ examples) that captures the model's behavior across its capability space. This corpus is then used to train a \"student\" model through knowledge distillation, producing a clone that approximates the proprietary model's performance.\n\nChain-of-thought coercion, identified by Google and Anthropic researchers in February 2026, significantly increases the efficiency of distillation attacks. By crafting prompts that induce the model to expose its reasoning steps, the attacker captures not just the final output but the intermediate reasoning process. This enriched training signal enables the student model to replicate complex reasoning capabilities with fewer examples than traditional input-output distillation would require.\n\nThe attack is particularly difficult to detect because each individual API call appears legitimate. The attacker may distribute queries across multiple accounts, vary timing patterns, and use diverse prompt styles to avoid triggering anomaly detection. Fine-tuned LoRA adapters represent another extraction target — an attacker who can isolate the adapter weights through differential analysis between the base model and the fine-tuned version can replicate task-specific capabilities with minimal effort. The competitive and financial impact is significant: the attacker acquires capabilities that cost millions to develop, and the theft is untraceable because the student model produces original outputs rather than copies.",

    illustrativeScenario:
      "An attacker uses legitimate API access to systematically probe a model, collecting enough input/output pairs to distill a student model replicating the proprietary model's capabilities.",

    attackerCapabilities:
      "The attacker requires only legitimate API access, which may be obtained through a standard subscription or developer account. Technical requirements include the ability to design diverse probing prompts that cover the model's capability space, infrastructure to store and process large volumes of input-output pairs, and ML expertise to train a student model via knowledge distillation. The attack can be distributed across multiple accounts and conducted over weeks or months to stay below rate limits and anomaly detection thresholds.",

    impact: [
      "Intellectual property theft of proprietary model capabilities",
      "Competitive loss from unauthorized replication",
      "Untraceable theft — student model produces original outputs",
    ],

    attackFlow: [
      { label: "Legitimate API Access", sublabel: "Standard subscription or account" },
      { label: "100K+ Probes", sublabel: "Systematic capability coverage" },
      { label: "I/O Pairs Harvested", sublabel: "Input-output corpus collected" },
      { label: "Student Model", sublabel: "Knowledge distillation produces clone" },
    ],

    attackVectors: [
      {
        title: "Chain-of-Thought Coercion (Google/Anthropic Feb 2026)",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker crafts prompts exposing reasoning steps", type: "attacker" },
          { label: "Model outputs chain-of-thought reasoning", type: "system" },
          { label: "Enriched training signal captured", type: "leak" },
          { label: "Student model replicates complex reasoning", type: "impact" },
        ],
      },
      {
        title: "Systematic Capability Probing Across Accounts",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker distributes queries across accounts", type: "attacker" },
          { label: "Diverse prompts cover full capability space", type: "action" },
          { label: "100K+ I/O pairs collected over time", type: "leak" },
          { label: "Knowledge distillation produces functional clone", type: "impact" },
        ],
      },
      {
        title: "Fine-Tuned Adapter Extraction",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker compares base and fine-tuned model outputs", type: "attacker" },
          { label: "Differential analysis isolates adapter behavior", type: "action" },
          { label: "Adapter weights approximated through probing", type: "leak" },
          { label: "Task-specific capabilities replicated", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "API Rate-Limiting and Usage Monitoring", scope: "Buy + Build", description: "Implement rate limits and comprehensive usage monitoring on API access, tracking query volume, diversity, and patterns per account." },
        { title: "Terms of Service Enforcement", scope: "Build", description: "Include explicit anti-distillation and anti-extraction clauses in API terms of service with technical enforcement mechanisms." },
        { title: "Output Watermarking", scope: "Build", description: "Embed statistical watermarks in model outputs that enable detection of distilled student models derived from the API." },
      ],
      tier2: [
        { title: "Query Pattern Analysis for Distillation Detection", scope: "Build", description: "Analyze query patterns across accounts to detect systematic capability probing indicative of distillation attempts." },
        { title: "Per-Account Usage Anomaly Detection", scope: "Build", description: "Deploy per-account anomaly detection that identifies unusual query distributions, timing patterns, and capability coverage." },
        { title: "Response Diversity and Perturbation", scope: "Build", description: "Introduce controlled diversity and perturbation in responses to degrade the quality of distillation training signal." },
      ],
      tier3: [
        { title: "Proactive Extraction Defense", scope: "Build", description: "Implement proactive defenses that degrade student model quality when distillation is detected, such as adversarial output perturbation." },
        { title: "Formal Model IP Protection Framework", scope: "Build", description: "Develop a formal intellectual property protection framework encompassing technical, legal, and operational measures for model defense." },
      ],
    },

    impactChips: [
      { label: "IP Theft", detail: "Proprietary capabilities replicated", color: "pii" },
      { label: "Competitive Loss", detail: "Millions in development cost bypassed", color: "reg" },
      { label: "Untraceable", detail: "Student model produces original outputs", color: "dsr" },
    ],

    cves: [],

    crossReferences: ["DSGAI18", "DSGAI01", "OWASP LLM10"],
  },

  // =========================================================================
  // DSGAI21 — Disinformation & Integrity Attacks via Data Poisoning
  // =========================================================================
  {
    id: "DSGAI21",
    title: "Disinformation & Integrity Attacks via Data Poisoning",
    tagline:
      "False data injected into trusted sources is retrieved and surfaced by AI as authoritative, grounded output.",
    category: "poisoning",
    categoryLabel: "Data Poisoning",

    howItUnfolds:
      "Disinformation attacks exploit the trust that AI systems — and their users — place in retrieved or trained-upon content. By injecting false information into sources that the AI system considers authoritative, an attacker can cause the model to surface disinformation as factual, grounded output. Unlike hallucination (where the model generates false content from its own weights), this attack produces false content that is retrieved from a real source, making it appear verified and reliable.\n\nThe attack is most potent when timed to coincide with crisis events — a zero-day vulnerability disclosure, a public health emergency, or a financial market event. During these moments, rapid information retrieval is critical and verification is deprioritized. An attacker who seeds false remediation guidance into trusted technical wikis can cause the AI to recommend vulnerable configurations to engineers responding to the crisis. The false guidance appears authoritative because it is grounded in a source the organization trusts.\n\nOpen training corpus poisoning operates at lower frequency but broader scale. By contributing false content to public datasets, open-source documentation, or widely crawled websites, the attacker ensures the disinformation is incorporated during the next training cycle. Once embedded in model weights, the false beliefs persist across all interactions and are extremely difficult to correct without retraining. Internal wiki write-access compromise achieves the same effect for RAG-based systems, where a single compromised editor can manipulate the knowledge base that grounds all of the organization's AI outputs.",

    illustrativeScenario:
      "An attacker edits an internal wiki page with false technical guidance. The RAG system retrieves and presents this as authoritative, causing operational decisions based on disinformation.",

    attackerCapabilities:
      "The attacker needs write access to sources that the AI system retrieves from or trains on. For internal wikis, this requires compromising an editor account — achievable through phishing, credential stuffing, or insider access. For open training corpora, the attacker contributes content through normal public channels (Wikipedia edits, Stack Overflow answers, GitHub documentation). For crisis-timing attacks, the attacker monitors for high-impact events and rapidly seeds false content to maximize the window of exploitation before human review catches the edits.",

    impact: [
      "False beliefs embedded in model weights through poisoned training data",
      "Operational damage from disinformation in RAG outputs",
      "Precedent: Grok incident demonstrated real-world viability",
    ],

    attackFlow: [
      { label: "Seed False Data", sublabel: "Inject into trusted source" },
      { label: "Trusted Source", sublabel: "Wiki, corpus, or documentation" },
      { label: "RAG Retrieves", sublabel: "False content matches queries" },
      { label: "Authoritative Disinfo", sublabel: "Model presents lies as grounded fact" },
    ],

    attackVectors: [
      {
        title: "Zero-Day Remediation Poisoning at Crisis Timing",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Crisis event occurs (zero-day, outage)", type: "gray" },
          { label: "Attacker seeds false remediation into trusted wiki", type: "attacker" },
          { label: "RAG retrieves false guidance under time pressure", type: "system" },
          { label: "Engineers follow AI-recommended vulnerable config", type: "impact" },
        ],
      },
      {
        title: "Open Training Corpus Poisoning (Low-Frequency)",
        riskLevel: "MEDIUM RISK",
        steps: [
          { label: "Attacker contributes false content to public sources", type: "attacker" },
          { label: "Content ingested during next training cycle", type: "system" },
          { label: "False beliefs embedded in model weights", type: "leak" },
          { label: "Persistent disinformation across all interactions", type: "impact" },
        ],
      },
      {
        title: "Internal Wiki Write-Access Compromise",
        riskLevel: "HIGH RISK",
        steps: [
          { label: "Attacker compromises wiki editor account", type: "attacker" },
          { label: "False content added to internal knowledge base", type: "action" },
          { label: "RAG retrieves and presents as authoritative", type: "system" },
          { label: "Operational decisions based on disinformation", type: "impact" },
        ],
      },
    ],

    mitigations: {
      tier1: [
        { title: "Source Provenance Tracking for RAG Documents", scope: "Build", description: "Track and display the provenance of all documents retrieved by RAG, including author, edit history, and trust score." },
        { title: "Write-Access Controls on RAG Sources", scope: "Buy + Build", description: "Enforce strict write-access controls on all sources that feed RAG pipelines, requiring authentication and approval for edits." },
        { title: "Human Review Gates for High-Impact Content", scope: "Build", description: "Require human review and approval for content changes in high-impact RAG sources before they are indexed for retrieval." },
      ],
      tier2: [
        { title: "Multi-Source Corroboration", scope: "Build", description: "Require corroboration from multiple independent sources for critical retrievals before presenting information as authoritative." },
        { title: "Content Integrity Monitoring", scope: "Build", description: "Monitor RAG sources for unexpected content changes, flagging edits that alter factual claims or technical guidance." },
        { title: "Automated Freshness and Trust Scoring", scope: "Build", description: "Assign freshness and trust scores to retrieved content based on source reputation, edit recency, and corroboration level." },
      ],
      tier3: [
        { title: "Adversarial Content Injection Red-Teaming", scope: "Build", description: "Conduct red-team exercises specifically testing the organization's resilience to adversarial content injection in RAG sources." },
        { title: "Formal Trust Chain Verification", scope: "Build", description: "Implement formal trust chain verification for retrieved content, ensuring cryptographic proof of author identity and content integrity." },
      ],
    },

    impactChips: [
      { label: "False Beliefs in Weights", detail: "Poisoned training embeds lies", color: "poison" },
      { label: "Operational Damage", detail: "Decisions based on disinfo", color: "dsr" },
      { label: "Grok Incident", detail: "Real-world precedent", color: "reg" },
    ],

    cves: [],

    crossReferences: ["DSGAI04", "DSGAI05", "DSGAI12"],
  },
];

export default risks;
