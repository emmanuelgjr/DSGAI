import {
  Shield, BookOpen, Layers, ExternalLink, Database,
  Eye, Lock, FileText, AlertTriangle, Network,
  CheckCircle, ArrowRight, Download, Scale,
  Cpu, Search, Tag, Map, Users, ShieldCheck, Bug,
  Activity, Plug, Trash2, GraduationCap, HardDrive, UserX,
} from 'lucide-react'

const dspmCapabilities = [
  {
    num: 1,
    icon: Search,
    title: 'GenAI Data Asset Discovery & Inventory',
    description:
      'Continuously discover and catalog all GenAI-relevant data assets: training sets, fine-tuning data, vector stores, embeddings, RAG corpora, model weights, adapter layers, prompt templates, and agent tool configurations.',
  },
  {
    num: 2,
    icon: Tag,
    title: 'Data Classification, Labeling & Policy Binding',
    description:
      'Classify data by sensitivity (PII, PHI, IP, credentials) and bind classification labels to access policies that travel with the data through every pipeline stage.',
  },
  {
    num: 3,
    icon: Map,
    title: 'Data Flow Mapping, Lineage & GenAI Bill of Materials',
    description:
      'Map end-to-end data flows from source through ingestion, embedding, retrieval, and output. Maintain a "GenAI bill of materials" tracking every data dependency.',
  },
  {
    num: 4,
    icon: Users,
    title: 'Access Governance & Entitlement Posture',
    description:
      'Enforce least-privilege access across human users, service accounts, agents, and non-human identities. Monitor entitlement drift and over-permissioned credentials.',
  },
  {
    num: 5,
    icon: ShieldCheck,
    title: 'Prompt, RAG, and Output-Layer DLP Controls',
    description:
      'Deploy data loss prevention at prompt ingestion, RAG retrieval, and output generation layers to detect and block sensitive data leakage in real time.',
  },
  {
    num: 6,
    icon: Database,
    title: 'Vector Store & Embedding Security Posture',
    description:
      'Secure vector databases with access controls, encryption at rest and in transit, integrity verification, and monitoring for embedding inversion attacks.',
  },
  {
    num: 7,
    icon: Bug,
    title: 'Data Integrity, Poisoning & Tamper Detection',
    description:
      'Detect data poisoning in training pipelines, RAG corpora, and fine-tuning datasets. Implement cryptographic integrity checks and anomaly detection for tamper evidence.',
  },
  {
    num: 8,
    icon: Activity,
    title: 'Observability, Telemetry & Log-Retention Posture',
    description:
      'Maintain comprehensive, immutable audit trails of all data access, model invocations, and agent actions. Ensure log retention meets regulatory and forensic requirements.',
  },
  {
    num: 9,
    icon: Plug,
    title: 'Third-Party, Plugin/Tool, and Connector Governance',
    description:
      'Govern data flows to third-party LLM providers, plugins, tools, and connectors. Enforce contractual controls, monitor data egress, and validate compliance posture.',
  },
  {
    num: 10,
    icon: Trash2,
    title: 'Lifecycle Management, Erasure & Compliance Readiness',
    description:
      'Manage data retention and deletion across model weights, vector stores, caches, and derivatives. Support RTBF/DSR workflows with verifiable erasure evidence.',
  },
  {
    num: 11,
    icon: GraduationCap,
    title: 'Training Governance & Privacy-Enhancing Fine-Tuning',
    description:
      'Govern training data provenance, consent, and licensing. Apply differential privacy, federated learning, and synthetic data techniques to minimize memorization risks.',
  },
  {
    num: 12,
    icon: HardDrive,
    title: 'Resilience Posture for GenAI Data Dependencies',
    description:
      'Ensure availability and recoverability of GenAI data assets. Protect against single-vendor lock-in, data corruption, and cascading failures across AI pipelines.',
  },
  {
    num: 13,
    icon: UserX,
    title: 'Human and "Shadow AI" Controls',
    description:
      'Detect and govern unsanctioned AI usage (shadow AI) across the organization. Enforce acceptable use policies and channel AI interactions through governed pipelines.',
  },
]

const tiers = [
  {
    tier: 'Tier 1',
    label: 'Foundational',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    icon: CheckCircle,
    description:
      'Controls deployable within a single sprint. These are immediate-action items: policy enforcement, configuration hardening, access reviews, and operational hygiene basics that require no architectural changes.',
    examples: 'No-train/no-retain policies, rate limiting, PII redaction in pre-processing, access logging, prompt architecture hardening.',
  },
  {
    tier: 'Tier 2',
    label: 'Hardening',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-500/30',
    icon: Lock,
    description:
      'Controls requiring architecture changes or new infrastructure. These involve deploying new systems, modifying pipelines, or integrating security tooling that demands cross-team coordination and design review.',
    examples: 'Real-time DLP scanning, format-preserving encryption, advanced RAG hardening, cryptographic integrity pipelines, SIEM integration.',
  },
  {
    tier: 'Tier 3',
    label: 'Advanced',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    icon: Shield,
    description:
      'Controls for mature security programs. These require significant investment in tooling, expertise, and organizational processes. They represent the leading edge of GenAI data security practice.',
    examples: 'Differential privacy training, machine unlearning with verifiable erasure, red-team exercises, formal verification of agent policies, homomorphic encryption for inference.',
  },
]

const owaspLinks = [
  {
    label: 'OWASP GenAI Security Project',
    url: 'https://genai.owasp.org',
  },
  {
    label: 'OWASP Top 10 for LLM Applications',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  },
  {
    label: 'OWASP AI Exchange',
    url: 'https://owaspai.org/',
  },
  {
    label: 'OWASP Foundation',
    url: 'https://owasp.org',
  },
]

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-owasp-card border border-owasp-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-cat-leakage" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-owasp-text">{title}</h2>
        {subtitle && <p className="text-sm text-owasp-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function About() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cat-leakage-bg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-cat-leakage" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-owasp-text">
              About This Project
            </h1>
            <p className="text-sm text-owasp-muted mt-0.5">
              OWASP GenAI Data Security Framework 2026
            </p>
          </div>
        </div>
        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6 mt-6">
          <p className="text-owasp-text leading-relaxed">
            The <strong className="text-owasp-text">OWASP GenAI Data Security Guide</strong> identifies
            and catalogs the top 21 data security risks specific to generative AI systems. Published
            by the OWASP GenAI Security Project in March 2026, it provides security teams, architects,
            and data protection officers with a structured framework for understanding, prioritizing,
            and mitigating data-layer threats across the full GenAI lifecycle.
          </p>
          <p className="text-owasp-muted text-sm mt-4">
            This interactive web application transforms the original PDF publication into a searchable,
            filterable, and cross-referenced reference tool designed for daily use by security practitioners.
          </p>
        </div>
      </div>

      {/* What is Data Security in GenAI Context */}
      <section className="mb-12">
        <SectionHeading
          icon={Database}
          title="What is Data Security in the GenAI Context?"
          subtitle="Why traditional data security models break down in generative AI systems"
        />

        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6 space-y-4">
          <p className="text-owasp-text leading-relaxed">
            In traditional systems, data security relies on clear boundaries: databases have schemas,
            applications have defined access control layers, and data classifications map to enforcement
            points. Generative AI fundamentally disrupts this model.
          </p>

          <div className="bg-owasp-dark rounded-lg border border-owasp-border p-4">
            <h3 className="text-sm font-semibold text-owasp-text mb-2">The Context Window Problem</h3>
            <p className="text-sm text-owasp-muted leading-relaxed">
              The context window aggregates data from <strong className="text-owasp-text">multiple trust domains</strong> into
              a <strong className="text-owasp-text">single flat namespace with no internal access control</strong>.
              A single prompt may combine public documentation, proprietary IP, PII from a customer database,
              and system-level instructions -- all processed uniformly by the model with no mechanism to enforce
              differential access within the context.
            </p>
          </div>

          <h3 className="text-sm font-semibold text-owasp-text mt-4 mb-3">Data Categories at Risk</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Source Data',
                desc: 'Training sets, fine-tuning data, RAG corpora, and grounding documents',
                icon: FileText,
              },
              {
                label: 'Derived Data',
                desc: 'Embeddings, vector indices, model weights, adapter layers, and distilled models',
                icon: Layers,
              },
              {
                label: 'Model Artifacts',
                desc: 'Weights, checkpoints, quantized variants, and exported ONNX/GGUF files',
                icon: Cpu,
              },
              {
                label: 'Runtime Data',
                desc: 'Prompts, completions, context windows, tool call payloads, and cached KV states',
                icon: Activity,
              },
              {
                label: 'Operational Exhaust',
                desc: 'Logs, telemetry, evaluation datasets, feedback signals, and usage analytics',
                icon: Eye,
              },
              {
                label: 'Agent State',
                desc: 'Memory, planning artifacts, tool credentials, intermediate reasoning, and orchestration context',
                icon: Network,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 bg-owasp-dark rounded-lg border border-owasp-border p-3"
              >
                <item.icon className="w-4 h-4 text-cat-governance mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-owasp-text">{item.label}</div>
                  <div className="text-[11px] text-owasp-muted leading-snug mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-900/10 rounded-lg border border-red-500/20 p-4 mt-4">
            <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              The Architectural Fusion Problem
            </h3>
            <p className="text-sm text-owasp-muted leading-relaxed">
              GenAI systems architecturally fuse the <strong className="text-owasp-text">control plane</strong> (instructions,
              system prompts, tool definitions) and the <strong className="text-owasp-text">data plane</strong> (user content,
              retrieved documents, external inputs) into a single processing stream. This fusion means that
              data can influence control flow (prompt injection) and control directives can leak as data
              (system prompt extraction) -- a class of vulnerability with no direct analog in traditional systems.
            </p>
          </div>
        </div>
      </section>

      {/* AI-DSPM Section */}
      <section className="mb-12">
        <SectionHeading
          icon={Shield}
          title="AI Data Security Posture Management (AI-DSPM)"
          subtitle="13 capability areas for comprehensive GenAI data security"
        />

        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6 mb-6">
          <p className="text-owasp-text leading-relaxed">
            AI-DSPM extends traditional Data Security Posture Management to address the unique
            characteristics of generative AI systems. It provides a structured capability model
            for organizations to assess, implement, and mature their GenAI data security posture
            across 13 interconnected capability areas.
          </p>
        </div>

        <div className="space-y-3">
          {dspmCapabilities.map((cap) => (
            <div
              key={cap.num}
              className="bg-owasp-card rounded-lg border border-owasp-border p-4 flex items-start gap-4 hover:border-owasp-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-cat-governance-bg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-cat-governance">{cap.num}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <cap.icon className="w-4 h-4 text-cat-governance shrink-0" />
                  <h3 className="text-sm font-semibold text-owasp-text">{cap.title}</h3>
                </div>
                <p className="text-xs text-owasp-muted leading-relaxed">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mitigation Tiers */}
      <section className="mb-12">
        <SectionHeading
          icon={Layers}
          title="Mitigation Tiers"
          subtitle="A progressive implementation model for defense-in-depth"
        />

        <div className="space-y-4">
          {tiers.map((t) => (
            <div
              key={t.tier}
              className={`bg-owasp-card rounded-xl border ${t.borderColor} p-5`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${t.bgColor} flex items-center justify-center`}>
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-owasp-text">
                    {t.tier}: {t.label}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-owasp-text leading-relaxed mb-3">{t.description}</p>
              <div className="bg-owasp-dark rounded-lg px-3 py-2">
                <span className="text-[10px] font-semibold text-owasp-muted uppercase tracking-wider">
                  Examples:
                </span>
                <p className="text-xs text-owasp-muted mt-1">{t.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OWASP Resources */}
      <section className="mb-12">
        <SectionHeading
          icon={Network}
          title="OWASP Resources"
          subtitle="Related projects and references from the OWASP community"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {owaspLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-owasp-card rounded-lg border border-owasp-border p-4 hover:border-owasp-hover transition-colors flex items-center justify-between gap-3 group"
            >
              <span className="text-sm font-medium text-owasp-text group-hover:text-owasp-text transition-colors">
                {link.label}
              </span>
              <ExternalLink className="w-4 h-4 text-owasp-muted group-hover:text-owasp-text transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* Download PDF */}
      <section className="mb-12">
        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6 text-center">
          <Download className="w-8 h-8 text-cat-infra mx-auto mb-3" />
          <h3 className="text-lg font-bold text-owasp-text mb-2">Download the Original PDF</h3>
          <p className="text-sm text-owasp-muted mb-4 max-w-lg mx-auto">
            Access the full OWASP GenAI Data Security Guide in its original PDF format,
            including all 21 risk entries, attack diagrams, and mitigation tables.
          </p>
          <a
            href="https://genai.owasp.org/resource/owasp-genai-data-security/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cat-infra-bg border border-cat-infra text-cat-infra text-sm font-medium hover:bg-owasp-border transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Project Lead */}
      <section className="mb-12">
        <SectionHeading
          icon={Users}
          title="Project Lead"
          subtitle="OWASP GenAI Data Security Initiative"
        />
        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-cat-identity-bg flex items-center justify-center border-2 border-cat-identity">
              <Users className="w-7 h-7 text-cat-identity" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-owasp-text">Emmanuel Guilherme Junior</h3>
              <p className="text-sm text-cat-identity font-medium">OWASP GenAI Data Security Initiative Lead</p>
            </div>
          </div>
          <p className="text-sm text-owasp-muted leading-relaxed">
            Leading the development and maintenance of the OWASP GenAI Data Security framework,
            driving the identification, documentation, and mitigation of data security risks
            across the full GenAI lifecycle. This interactive web application was created to make
            the research more accessible and actionable for security teams worldwide.
          </p>
        </div>
      </section>

      {/* License */}
      <section className="mb-8">
        <div className="bg-owasp-card rounded-xl border border-owasp-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Scale className="w-5 h-5 text-cat-compliance" />
            <h3 className="text-base font-bold text-owasp-text">License</h3>
          </div>
          <p className="text-sm text-owasp-text leading-relaxed">
            This work is licensed under the{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cat-compliance hover:underline inline-flex items-center gap-1"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
              <ExternalLink className="w-3 h-3" />
            </a>
            .
          </p>
          <p className="text-xs text-owasp-muted mt-2">
            You are free to share and adapt this material for any purpose, including commercial,
            provided you give appropriate attribution and distribute your contributions under the
            same license. The OWASP Foundation and its contributors provide this material as-is
            without warranty.
          </p>
        </div>
      </section>
    </div>
  )
}
