import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck, ArrowRight, ArrowLeft, Download, AlertTriangle,
  CheckCircle, Shield, ChevronDown, ChevronUp, Cpu, Database,
  Lock, Scale, RotateCcw, ExternalLink, Info,
} from 'lucide-react'
import { risks, categories } from '../data/risks'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Category colour helpers (mirrors Landing / RiskGrid)
// ---------------------------------------------------------------------------
const catBgClass = {
  leakage: 'bg-cat-leakage',
  identity: 'bg-cat-identity',
  governance: 'bg-cat-governance',
  poisoning: 'bg-cat-poisoning',
  infra: 'bg-cat-infra',
  compliance: 'bg-cat-compliance',
  attack: 'bg-cat-attack',
}
const catColorClass = {
  leakage: 'text-cat-leakage',
  identity: 'text-cat-identity',
  governance: 'text-cat-governance',
  poisoning: 'text-cat-poisoning',
  infra: 'text-cat-infra',
  compliance: 'text-cat-compliance',
  attack: 'text-cat-attack',
}

function getCategoryMeta(categoryId) {
  return categories.find(c => c.id === categoryId) || categories[0]
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------
const questions = [
  {
    section: 'GenAI Architecture',
    icon: Cpu,
    items: [
      { id: 'q1', text: 'Do you use Retrieval-Augmented Generation (RAG)?', flags: ['DSGAI01', 'DSGAI13', 'DSGAI15', 'DSGAI21'], inverted: false },
      { id: 'q2', text: 'Do you fine-tune or train models on proprietary data?', flags: ['DSGAI01', 'DSGAI04', 'DSGAI10', 'DSGAI18', 'DSGAI19'], inverted: false },
      { id: 'q3', text: 'Do you use autonomous AI agents or multi-agent systems?', flags: ['DSGAI02', 'DSGAI06', 'DSGAI11'], inverted: false },
      { id: 'q4', text: 'Do you use third-party LLM APIs (OpenAI, Anthropic, etc.)?', flags: ['DSGAI03', 'DSGAI06', 'DSGAI15', 'DSGAI20'], inverted: false },
      { id: 'q5', text: 'Do you use vector databases for embeddings?', flags: ['DSGAI13', 'DSGAI07', 'DSGAI17'], inverted: false },
      { id: 'q6', text: 'Do your AI systems process multiple data modalities (images, audio, video)?', flags: ['DSGAI09'], inverted: false },
    ],
  },
  {
    section: 'Data Handling',
    icon: Database,
    items: [
      { id: 'q7', text: 'Does your AI system handle PII, PHI, or financial data?', flags: ['DSGAI01', 'DSGAI08', 'DSGAI10', 'DSGAI14'], inverted: false },
      { id: 'q8', text: 'Do you generate synthetic or anonymized datasets?', flags: ['DSGAI10'], inverted: false },
      { id: 'q9', text: 'Do employees use consumer AI tools (ChatGPT, Copilot) for work?', flags: ['DSGAI03'], inverted: false },
      { id: 'q10', text: 'Do your AI systems generate SQL, GraphQL, or database queries from natural language?', flags: ['DSGAI12'], inverted: false },
      { id: 'q11', text: 'Do you share AI-derived data or models with third parties?', flags: ['DSGAI20', 'DSGAI07'], inverted: false },
    ],
  },
  {
    section: 'Security & Infrastructure',
    icon: Lock,
    items: [
      { id: 'q12', text: 'Do you have DLP controls on AI prompts and outputs?', flags: ['DSGAI01', 'DSGAI14', 'DSGAI15'], inverted: false },
      { id: 'q13', text: 'Do you use AI browser extensions or endpoint assistants?', flags: ['DSGAI16'], inverted: false },
      { id: 'q14', text: 'Do your AI systems use tools, plugins, or MCP servers?', flags: ['DSGAI06'], inverted: false },
      { id: 'q15', text: 'Do you have a human-in-the-loop labeling/annotation pipeline?', flags: ['DSGAI19'], inverted: false },
      { id: 'q16', text: 'Do you have multi-tenant AI deployments serving different customers?', flags: ['DSGAI11', 'DSGAI13'], inverted: false },
    ],
  },
  {
    section: 'Governance & Compliance',
    icon: Scale,
    items: [
      { id: 'q17', text: 'Are you subject to GDPR, HIPAA, CCPA, or EU AI Act?', flags: ['DSGAI08', 'DSGAI07'], inverted: false },
      { id: 'q18', text: 'Do you have a data classification policy that covers AI-derived data?', flags: ['DSGAI07', 'DSGAI14'], inverted: true },
      { id: 'q19', text: 'Do you have an AI-specific incident response plan?', flags: ['DSGAI02', 'DSGAI04'], inverted: true },
      { id: 'q20', text: 'Do you maintain a data lineage / bill of materials for AI pipelines?', flags: ['DSGAI07', 'DSGAI05'], inverted: true },
    ],
  },
]

const totalQuestions = questions.reduce((n, s) => n + s.items.length, 0)

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total, label }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      {label && <p className="text-xs text-owasp-muted mb-1">{label}</p>}
      <div className="h-2 rounded-full bg-owasp-dark/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-cat-identity transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function YesNoToggle({ value, onChange, inverted }) {
  const yesActive = value === true
  const noActive = value === false
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          yesActive
            ? inverted
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
            : 'bg-owasp-card text-owasp-muted hover:bg-owasp-card/80 border border-owasp-border'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          noActive
            ? inverted
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-red-600 text-white shadow-lg shadow-red-900/30'
            : 'bg-owasp-card text-owasp-muted hover:bg-owasp-card/80 border border-owasp-border'
        }`}
      >
        No
      </button>
    </div>
  )
}

function SeverityBadge({ level }) {
  const map = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${map[level] || map.medium}`}>
      {level.toUpperCase()}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Assessment() {
  const { dark } = useTheme()

  // step: 0 = welcome, 1-4 = question sections, 5 = results
  const [step, setStep] = useState(0)

  // answers: { q1: true, q2: false, ... }
  const [answers, setAnswers] = useState({})

  // collapsed state for "not applicable" section in results
  const [showNotApplicable, setShowNotApplicable] = useState(false)

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  // -------------------------------------------------------------------------
  // Compute flagged risks
  // -------------------------------------------------------------------------
  const { flaggedMap, flaggedRisks, unflaggedRisks, riskScore } = useMemo(() => {
    // Build a map: riskId → count of triggering questions
    const map = {}

    for (const section of questions) {
      for (const q of section.items) {
        const answer = answers[q.id]
        if (answer === undefined || answer === null) continue

        // Determine if this answer triggers the flags
        const triggers = q.inverted ? answer === false : answer === true
        if (triggers) {
          for (const flag of q.flags) {
            map[flag] = (map[flag] || 0) + 1
          }
        }
      }
    }

    const flagged = risks
      .filter(r => map[r.id])
      .map(r => ({ ...r, hitCount: map[r.id] }))
      .sort((a, b) => b.hitCount - a.hitCount)

    const flaggedIds = new Set(flagged.map(r => r.id))
    const unflagged = risks.filter(r => !flaggedIds.has(r.id))

    const score = Math.round((flagged.length / risks.length) * 100)

    return { flaggedMap: map, flaggedRisks: flagged, unflaggedRisks: unflagged, riskScore: score }
  }, [answers])

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const currentSection = step >= 1 && step <= 4 ? questions[step - 1] : null

  const sectionAnswered = (sectionIdx) => {
    const sec = questions[sectionIdx]
    return sec.items.every(q => answers[q.id] !== undefined)
  }

  const allAnswered = questions.every((_, i) => sectionAnswered(i))

  const answeredCount = Object.keys(answers).length

  const scoreColor = riskScore <= 30 ? 'text-emerald-400' : riskScore <= 60 ? 'text-amber-400' : 'text-red-400'
  const scoreRingColor = riskScore <= 30 ? 'stroke-emerald-500' : riskScore <= 60 ? 'stroke-amber-500' : 'stroke-red-500'
  const scoreLabel = riskScore <= 30 ? 'Low Exposure' : riskScore <= 60 ? 'Moderate Exposure' : 'High Exposure'

  const handlePrint = () => {
    window.print()
  }

  const handleRetake = () => {
    setAnswers({})
    setStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get top-level risk severity based on attack vectors
  const getRiskSeverity = (risk) => {
    if (!risk.attackVectors || risk.attackVectors.length === 0) return 'medium'
    const levels = risk.attackVectors.map(v => v.riskLevel?.toUpperCase() || '')
    if (levels.some(l => l.includes('HIGH'))) return 'high'
    if (levels.some(l => l.includes('MEDIUM'))) return 'medium'
    return 'low'
  }

  // -------------------------------------------------------------------------
  // Render: Welcome
  // -------------------------------------------------------------------------
  if (step === 0) {
    return (
      <div className="min-h-screen bg-owasp-darker pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cat-identity/20 mb-6">
              <ClipboardCheck className="w-10 h-10 text-cat-identity" />
            </div>
            <h1 className="text-4xl font-bold text-owasp-text mb-4">
              GenAI Risk Assessment
            </h1>
            <p className="text-lg text-owasp-muted max-w-xl mx-auto leading-relaxed">
              Answer 20 questions about your GenAI stack and get a personalized risk
              profile mapped to the OWASP DSGAI framework, with prioritized
              mitigations for your specific environment.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Shield, label: '21 Risks Evaluated', desc: 'Full DSGAI coverage' },
              { icon: AlertTriangle, label: 'Severity Scoring', desc: 'Prioritized by exposure' },
              { icon: CheckCircle, label: 'Actionable Mitigations', desc: 'Tier 1 quick wins' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-owasp-card border border-owasp-border rounded-xl p-5 text-center">
                <Icon className="w-6 h-6 text-cat-identity mx-auto mb-2" />
                <p className="text-sm font-semibold text-owasp-text">{label}</p>
                <p className="text-xs text-owasp-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cat-identity text-white font-semibold text-lg hover:bg-cat-identity/90 transition-colors shadow-lg shadow-cat-identity/20"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 flex items-start gap-2 justify-center text-xs text-owasp-muted">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your answers stay in your browser. Nothing is sent to any server.</span>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render: Questionnaire (steps 1-4)
  // -------------------------------------------------------------------------
  if (step >= 1 && step <= 4) {
    const SectionIcon = currentSection.icon
    const sectionIndex = step - 1

    return (
      <div className="min-h-screen bg-owasp-darker pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-owasp-muted">
                Section {step} of 4
              </span>
              <span className="text-sm text-owasp-muted">
                {answeredCount} / {totalQuestions} questions answered
              </span>
            </div>
            <ProgressBar current={step} total={4} />
          </div>

          {/* Section header */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cat-identity/20">
              <SectionIcon className="w-6 h-6 text-cat-identity" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-owasp-text">{currentSection.section}</h2>
              <p className="text-sm text-owasp-muted">{currentSection.items.length} questions</p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 mb-10">
            {currentSection.items.map((q, idx) => (
              <div
                key={q.id}
                className="bg-owasp-card border border-owasp-border rounded-xl p-5 transition-all duration-200 hover:border-cat-identity/30 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-owasp-text leading-relaxed">
                      <span className="text-owasp-muted font-mono text-xs mr-2">
                        {q.id.toUpperCase().replace('Q', 'Q')}
                      </span>
                      {q.text}
                    </p>
                    {q.inverted && (
                      <p className="text-xs text-amber-400/80 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Answering "No" indicates a control gap
                      </p>
                    )}
                  </div>
                  <YesNoToggle
                    value={answers[q.id]}
                    onChange={(val) => setAnswer(q.id, val)}
                    inverted={q.inverted}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-owasp-card border border-owasp-border text-owasp-text hover:bg-owasp-card/80 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? 'Back to Welcome' : 'Previous Section'}
            </button>

            {step < 4 ? (
              <button
                onClick={() => { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cat-identity text-white hover:bg-cat-identity/90 transition-colors text-sm font-semibold shadow-lg shadow-cat-identity/20"
              >
                Next Section
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => { setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={!allAnswered}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg ${
                  allAnswered
                    ? 'bg-cat-identity text-white hover:bg-cat-identity/90 shadow-cat-identity/20'
                    : 'bg-owasp-card text-owasp-muted border border-owasp-border cursor-not-allowed'
                }`}
              >
                View Results
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {step === 4 && !allAnswered && (
            <p className="text-xs text-amber-400/80 text-right mt-2">
              Answer all questions to view results
            </p>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render: Results (step 5)
  // -------------------------------------------------------------------------
  const severityBreakdown = {
    high: flaggedRisks.filter(r => getRiskSeverity(r) === 'high').length,
    medium: flaggedRisks.filter(r => getRiskSeverity(r) === 'medium').length,
    low: flaggedRisks.filter(r => getRiskSeverity(r) === 'low').length,
  }

  // SVG ring gauge
  const ringRadius = 54
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (riskScore / 100) * ringCircumference

  return (
    <div className="min-h-screen bg-owasp-darker pt-24 pb-16 print:pt-4 print:bg-white">
      <div className="mx-auto max-w-5xl px-6">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-owasp-text mb-2">
            Your GenAI Risk Report
          </h1>
          <p className="text-owasp-muted">
            Based on your {totalQuestions} answers across {questions.length} assessment areas
          </p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* Score gauge */}
          <div className="bg-owasp-card border border-owasp-border rounded-2xl p-6 flex flex-col items-center justify-center animate-fade-in">
            <svg width="140" height="140" className="mb-3">
              <circle
                cx="70" cy="70" r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-owasp-dark/40"
              />
              <circle
                cx="70" cy="70" r={ringRadius}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={scoreRingColor}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              <text x="70" y="66" textAnchor="middle" className={`fill-current ${scoreColor} text-3xl font-bold`} style={{ fontSize: '28px', fontWeight: 700 }}>
                {riskScore}%
              </text>
              <text x="70" y="86" textAnchor="middle" className="fill-current text-owasp-muted" style={{ fontSize: '11px' }}>
                exposure
              </text>
            </svg>
            <p className={`text-sm font-semibold ${scoreColor}`}>{scoreLabel}</p>
          </div>

          {/* Stats */}
          <div className="bg-owasp-card border border-owasp-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold text-owasp-muted uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-owasp-text">Risks flagged</span>
                <span className="text-lg font-bold text-owasp-text">{flaggedRisks.length} <span className="text-owasp-muted font-normal text-sm">/ {risks.length}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-owasp-text">Not applicable</span>
                <span className="text-lg font-bold text-emerald-400">{unflaggedRisks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-owasp-text">Categories impacted</span>
                <span className="text-lg font-bold text-owasp-text">
                  {new Set(flaggedRisks.map(r => r.category)).size} <span className="text-owasp-muted font-normal text-sm">/ {categories.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="bg-owasp-card border border-owasp-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-semibold text-owasp-muted uppercase tracking-wider mb-4">Severity Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-owasp-text">High</span>
                </div>
                <span className="text-lg font-bold text-red-400">{severityBreakdown.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-owasp-text">Medium</span>
                </div>
                <span className="text-lg font-bold text-amber-400">{severityBreakdown.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-owasp-text">Low</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">{severityBreakdown.low}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flagged risks list */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-owasp-text mb-1">Flagged Risks</h2>
          <p className="text-sm text-owasp-muted mb-6">Sorted by number of question triggers — address the most-flagged risks first.</p>

          {flaggedRisks.length === 0 ? (
            <div className="bg-owasp-card border border-emerald-500/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-owasp-text mb-1">No risks flagged</p>
              <p className="text-sm text-owasp-muted">
                Based on your answers, none of the 21 DSGAI risks are applicable to your current GenAI stack.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedRisks.map((risk, idx) => {
                const cat = getCategoryMeta(risk.category)
                const severity = getRiskSeverity(risk)
                const tier1 = risk.mitigations?.tier1?.slice(0, 3) || []

                return (
                  <div
                    key={risk.id}
                    className="bg-owasp-card border border-owasp-border rounded-2xl p-5 hover:border-owasp-border/80 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-owasp-muted">{risk.id}</span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: cat.bgColor,
                              color: cat.color,
                              border: `1px solid ${cat.borderColor}`,
                            }}
                          >
                            {cat.label}
                          </span>
                          <SeverityBadge level={severity} />
                        </div>
                        <h3 className="text-base font-semibold text-owasp-text">{risk.title}</h3>
                        <p className="text-sm text-owasp-muted mt-1 leading-relaxed">{risk.tagline}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-cat-identity/10 text-cat-identity px-3 py-1.5 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">
                            Flagged by {risk.hitCount} answer{risk.hitCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tier 1 mitigations */}
                    {tier1.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-owasp-border">
                        <p className="text-xs font-semibold text-owasp-muted uppercase tracking-wider mb-2">
                          Priority Mitigations (Tier 1 — Foundational)
                        </p>
                        <div className="space-y-2">
                          {tier1.map((m, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-sm text-owasp-text font-medium">{m.title}</span>
                                {m.scope && (
                                  <span className="text-xs text-owasp-muted ml-1.5">({m.scope})</span>
                                )}
                                {m.description && (
                                  <p className="text-xs text-owasp-muted mt-0.5 leading-relaxed">{m.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Link to full detail */}
                    <div className="mt-4">
                      <Link
                        to={`/risks/${risk.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-cat-identity hover:text-cat-identity/80 transition-colors"
                      >
                        View full risk detail
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Not Applicable risks (collapsed) */}
        {unflaggedRisks.length > 0 && (
          <div className="mb-10">
            <button
              onClick={() => setShowNotApplicable(!showNotApplicable)}
              className="flex items-center gap-2 text-sm font-medium text-owasp-muted hover:text-owasp-text transition-colors mb-3"
            >
              {showNotApplicable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Risks Not Applicable ({unflaggedRisks.length})
            </button>

            {showNotApplicable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {unflaggedRisks.map((risk) => {
                  const cat = getCategoryMeta(risk.category)
                  return (
                    <div
                      key={risk.id}
                      className="bg-owasp-card/50 border border-owasp-border/50 rounded-xl p-4 opacity-70"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-owasp-muted">{risk.id}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: cat.bgColor,
                            color: cat.color,
                            border: `1px solid ${cat.borderColor}`,
                          }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-sm text-owasp-muted">{risk.title}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-owasp-border print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-owasp-card border border-owasp-border text-owasp-text hover:bg-owasp-card/80 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-owasp-card border border-owasp-border text-owasp-text hover:bg-owasp-card/80 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Assessment
          </button>
          <Link
            to="/risks"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cat-identity text-white hover:bg-cat-identity/90 transition-colors text-sm font-semibold shadow-lg shadow-cat-identity/20"
          >
            Browse All Risks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
