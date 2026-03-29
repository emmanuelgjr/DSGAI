import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, Layers, BookOpen, ArrowRight,
  Database, Eye, Lock, Cpu, Network, FileWarning, Scale,
  Download, FileText, ExternalLink,
} from 'lucide-react'

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
import { risks, categories } from '../data/risks'

// Map category id → Tailwind color class (text)
const catColorClass = {
  leakage: 'text-cat-leakage',
  identity: 'text-cat-identity',
  governance: 'text-cat-governance',
  poisoning: 'text-cat-poisoning',
  infra: 'text-cat-infra',
  compliance: 'text-cat-compliance',
  attack: 'text-cat-attack',
}

const catBgClass = {
  leakage: 'bg-cat-leakage',
  identity: 'bg-cat-identity',
  governance: 'bg-cat-governance',
  poisoning: 'bg-cat-poisoning',
  infra: 'bg-cat-infra',
  compliance: 'bg-cat-compliance',
  attack: 'bg-cat-attack',
}

const catBgSoftClass = {
  leakage: 'bg-cat-leakage-bg',
  identity: 'bg-cat-identity-bg',
  governance: 'bg-cat-governance-bg',
  poisoning: 'bg-cat-poisoning-bg',
  infra: 'bg-cat-infra-bg',
  compliance: 'bg-cat-compliance-bg',
  attack: 'bg-cat-attack-bg',
}

// Count risks per category
const riskCountByCategory = categories.map((cat) => ({
  ...cat,
  count: risks.filter((r) => r.category === cat.id).length,
}))

const stats = [
  { value: '21', label: 'Risks Identified', icon: AlertTriangle },
  { value: '3', label: 'Mitigation Tiers', icon: Layers },
  { value: '7', label: 'Categories', icon: Shield },
  { value: 'v1.0', label: 'March 2026', icon: BookOpen },
]

const frameworkFeatures = [
  {
    icon: Network,
    title: 'Attack Flow Analysis',
    description: 'Understand how attacks unfold step-by-step, from initial access through data exfiltration and downstream impact.',
  },
  {
    icon: Cpu,
    title: 'Attacker Capabilities',
    description: 'Each risk profiles the attacker skill level, access requirements, and tooling needed to exploit the vulnerability.',
  },
  {
    icon: FileWarning,
    title: 'Illustrative Scenarios',
    description: 'Real-world vignettes demonstrating how each risk manifests in production GenAI systems and pipelines.',
  },
  {
    icon: Lock,
    title: 'Tiered Mitigations',
    description: 'Three-tier defense model: Foundational controls, Hardening measures, and Advanced techniques for mature organizations.',
  },
]

const dspmCapabilities = [
  {
    icon: Eye,
    title: 'Data Discovery & Classification',
    description: 'Automatically discover sensitive data flowing through AI pipelines — training sets, vector stores, RAG corpora, and model artifacts.',
  },
  {
    icon: Database,
    title: 'Data Lineage & Flow Mapping',
    description: 'Trace data provenance from source through embedding, training, fine-tuning, and inference to understand exposure paths.',
  },
  {
    icon: Lock,
    title: 'Access Governance',
    description: 'Enforce least-privilege access controls across AI data stores, model endpoints, and agent tool integrations.',
  },
  {
    icon: Scale,
    title: 'Compliance & Risk Posture',
    description: 'Continuously assess AI data handling against GDPR, HIPAA, CCPA, and the EU AI Act with automated policy checks.',
  },
  {
    icon: Shield,
    title: 'Threat Detection & Response',
    description: 'Monitor for data exfiltration attempts, prompt injection, and anomalous data access patterns in real time.',
  },
  {
    icon: Network,
    title: 'Pipeline Security Orchestration',
    description: 'Integrate DLP, encryption, and redaction controls directly into ML and RAG pipelines for defense-in-depth.',
  },
]

export default function Landing() {
  const previewRisks = risks.slice(0, 6)

  return (
    <div className="space-y-20 py-12">
      {/* ------------------------------------------------------------------ */}
      {/* Hero Section                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-owasp-card border border-owasp-border text-sm text-owasp-muted mb-2">
          <Shield className="w-4 h-4 text-cat-leakage" />
          OWASP Foundation Project
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="text-owasp-text">OWASP GenAI</span>{' '}
          <span className="text-cat-leakage">Data Security</span>
        </h1>

        <p className="text-2xl sm:text-3xl font-semibold text-owasp-muted">
          Risks and Mitigations 2026
        </p>

        <p className="text-lg text-owasp-dim max-w-2xl mx-auto leading-relaxed">
          An interactive guide to the 21 critical data-security risks facing
          Generative AI systems. Explore attack flows, attacker capabilities,
          real-world scenarios, and tiered mitigations — all structured for
          security teams, architects, and decision-makers.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            to="/risks"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cat-leakage text-owasp-dark font-semibold hover:opacity-90 transition-opacity"
          >
            Browse Risk Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/attack-paths"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-owasp-border text-owasp-text font-semibold hover:bg-owasp-card transition-colors"
          >
            View Attack Paths
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Row                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ value, label, icon: Icon }) => (
          <div
            key={label}
            className="bg-owasp-card border border-owasp-border rounded-xl p-6 text-center space-y-2 card-stagger"
          >
            <Icon className="w-6 h-6 mx-auto text-cat-leakage" />
            <p className="text-3xl font-bold text-owasp-text">{value}</p>
            <p className="text-sm text-owasp-muted">{label}</p>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Category Overview                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-owasp-text">
          Risk Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {riskCountByCategory.map((cat) => (
            <Link
              key={cat.id}
              to={`/risks?cat=${cat.id}`}
              className={`group flex items-center gap-4 p-4 rounded-xl border border-owasp-border ${catBgSoftClass[cat.id]} hover:border-owasp-hover transition-colors`}
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${catBgClass[cat.id]}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${catColorClass[cat.id]}`}>
                  {cat.label}
                </p>
                <p className="text-sm text-owasp-muted">
                  {cat.count} {cat.count === 1 ? 'risk' : 'risks'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-owasp-dim opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick Preview Grid                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-owasp-text">
            Featured Risks
          </h2>
          <Link
            to="/risks"
            className="text-sm text-cat-leakage hover:underline inline-flex items-center gap-1"
          >
            View all 21 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewRisks.map((risk) => (
            <Link
              key={risk.id}
              to={`/risks/${risk.id}`}
              className={`group block p-5 rounded-xl border border-owasp-border ${catBgSoftClass[risk.category]} hover:border-owasp-hover transition-colors card-stagger`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${catBgClass[risk.category]}`}
                />
                <span className="text-xs font-mono text-owasp-dim">
                  {risk.id}
                </span>
              </div>
              <h3 className="font-semibold text-owasp-text group-hover:text-cat-leakage transition-colors mb-1">
                {risk.title}
              </h3>
              <p className="text-sm text-owasp-muted line-clamp-2">
                {risk.tagline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What's Inside                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-owasp-text">
          What's Inside the Framework
        </h2>
        <p className="text-owasp-dim max-w-3xl">
          Each of the 21 risks is documented with a consistent, actionable
          structure designed for both technical practitioners and organizational
          leadership.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {frameworkFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-5 rounded-xl bg-owasp-card border border-owasp-border"
            >
              <div className="shrink-0 mt-1">
                <Icon className="w-5 h-5 text-cat-identity" />
              </div>
              <div>
                <h3 className="font-semibold text-owasp-text mb-1">{title}</h3>
                <p className="text-sm text-owasp-muted leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AI-DSPM Overview                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-owasp-text">
            AI Data Security Posture Management
          </h2>
          <p className="text-owasp-dim max-w-3xl">
            AI-DSPM is an emerging discipline that extends traditional DSPM to
            address the unique data-security challenges of Generative AI.
            It provides continuous visibility, governance, and threat detection
            across the entire AI data lifecycle — from training data ingestion
            through inference and agent execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dspmCapabilities.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-5 rounded-xl bg-owasp-card border border-owasp-border space-y-3"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-owasp-dark border border-owasp-border">
                <Icon className="w-5 h-5 text-cat-infra" />
              </div>
              <h3 className="font-semibold text-owasp-text">{title}</h3>
              <p className="text-sm text-owasp-muted leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Export & Resources                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-owasp-text">
          Export & Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://genai.owasp.org/resource/owasp-genai-data-security/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-owasp-card border border-owasp-border hover:border-owasp-hover transition-colors text-center"
          >
            <Download className="w-8 h-8 text-cat-infra" />
            <div>
              <p className="font-semibold text-owasp-text text-sm">Full PDF Report</p>
              <p className="text-xs text-owasp-muted mt-1">Original OWASP publication with all 21 entries</p>
            </div>
          </a>
          <Link
            to="/diagrams"
            onClick={() => setTimeout(() => window.print(), 500)}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-owasp-card border border-owasp-border hover:border-owasp-hover transition-colors text-center"
          >
            <FileText className="w-8 h-8 text-cat-identity" />
            <div>
              <p className="font-semibold text-owasp-text text-sm">Export Diagrams</p>
              <p className="text-xs text-owasp-muted mt-1">Print network topology diagrams to PDF</p>
            </div>
          </Link>
          <Link
            to="/attack-paths"
            onClick={() => setTimeout(() => window.print(), 500)}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-owasp-card border border-owasp-border hover:border-owasp-hover transition-colors text-center"
          >
            <FileText className="w-8 h-8 text-cat-leakage" />
            <div>
              <p className="font-semibold text-owasp-text text-sm">Export Attack Paths</p>
              <p className="text-xs text-owasp-muted mt-1">Print all attack path diagrams to PDF</p>
            </div>
          </Link>
          <a
            href="https://github.com/emmanuelgjr/DSGAI"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-owasp-card border border-owasp-border hover:border-owasp-hover transition-colors text-center"
          >
            <GithubIcon className="w-8 h-8 text-cat-attack" />
            <div>
              <p className="font-semibold text-owasp-text text-sm">GitHub Repository</p>
              <p className="text-xs text-owasp-muted mt-1">Source code, contributions, and issues</p>
            </div>
          </a>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Project Lead                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="text-center space-y-3 py-8 border-t border-owasp-border">
        <p className="text-sm text-owasp-dim">Project Lead</p>
        <h3 className="text-xl font-bold text-owasp-text">
          Emmanuel Guilherme Junior
        </h3>
        <p className="text-cat-identity font-medium text-sm">
          OWASP GenAI Data Security Initiative Lead
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom CTA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="text-center space-y-4 py-8 border-t border-owasp-border">
        <h2 className="text-2xl font-bold text-owasp-text">
          Ready to explore?
        </h2>
        <p className="text-owasp-dim">
          Dive into the full catalog of 21 GenAI data-security risks with
          interactive attack flows and tiered mitigations.
        </p>
        <Link
          to="/risks"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cat-leakage text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Browse Risk Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
