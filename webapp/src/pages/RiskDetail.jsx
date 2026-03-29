import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  AlertTriangle,
  Target,
  Layers,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { risks, categories, tierLabels } from '../data/risks'

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const chipColorMap = {
  pii: { bg: '#7f1d1d', text: '#fca5a5' },
  reg: { bg: '#713f12', text: '#fde68a' },
  poison: { bg: '#7c2d12', text: '#fdba74' },
  dsr: { bg: '#312e81', text: '#c4b5fd' },
  ops: { bg: '#064e3b', text: '#6ee7b7' },
  trust: { bg: '#4c1d95', text: '#ddd6fe' },
  fin: { bg: '#78350f', text: '#fcd34d' },
  legal: { bg: '#831843', text: '#f9a8d4' },
  sec: { bg: '#1e3a5f', text: '#93c5fd' },
}

const nodeColors = {
  attacker: { bg: '#2a1520', border: '#dc2626', text: '#fca5a5' },
  action:   { bg: '#1a1a0d', border: '#d97706', text: '#fcd34d' },
  system:   { bg: '#0f172a', border: '#2563eb', text: '#93c5fd' },
  leak:     { bg: '#2a1520', border: '#dc2626', text: '#fca5a5' },
  impact:   { bg: '#0f1a14', border: '#16a34a', text: '#86efac' },
  gray:     { bg: '#1e2030', border: '#6b7a99', text: '#8896b0' },
}

const tierColors = {
  tier1: { accent: '#16a34a', bg: '#0f1a14', border: '#166534', text: '#86efac' },
  tier2: { accent: '#d97706', bg: '#1a1a0d', border: '#92400e', text: '#fcd34d' },
  tier3: { accent: '#9333ea', bg: '#1a1530', border: '#6b21a8', text: '#d8b4fe' },
}

const scopeColors = {
  Buy:   { bg: '#1e3a5f', text: '#93c5fd' },
  Build: { bg: '#064e3b', text: '#6ee7b7' },
  Both:  { bg: '#312e81', text: '#c4b5fd' },
}

function getScopeStyle(scope) {
  if (scope.includes('Buy') && scope.includes('Build')) return scopeColors.Both
  if (scope.includes('Buy')) return scopeColors.Buy
  if (scope.includes('Build')) return scopeColors.Build
  return scopeColors.Both
}

const riskLevelColors = {
  'HIGH RISK':       { bg: '#7f1d1d', text: '#fca5a5' },
  'MEDIUM RISK':     { bg: '#713f12', text: '#fde68a' },
  'PERSISTENT RISK': { bg: '#4c1d95', text: '#ddd6fe' },
  'LOW RISK':        { bg: '#064e3b', text: '#6ee7b7' },
  'CRITICAL RISK':   { bg: '#7f1d1d', text: '#fca5a5' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryMeta(categoryId) {
  return categories.find(c => c.id === categoryId) || categories[0]
}

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function Section({ title, icon: Icon, defaultOpen = false, accentColor, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-owasp-card border border-owasp-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-owasp-dark/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className="w-5 h-5 shrink-0"
              style={{ color: accentColor || '#8896b0' }}
            />
          )}
          <span className="text-owasp-text font-semibold text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-owasp-dim shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-owasp-dim shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5 border-t border-owasp-border">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Attack Flow Diagram (horizontal)
// ---------------------------------------------------------------------------

function AttackFlowDiagram({ steps, accentColor }) {
  return (
    <div className="overflow-x-auto py-4">
      <div className="flex items-center gap-2 min-w-max">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="rounded-lg px-5 py-3 min-w-[160px] text-center border"
              style={{
                backgroundColor: accentColor + '15',
                borderColor: accentColor + '40',
              }}
            >
              <div className="text-sm font-semibold text-owasp-text">{step.label}</div>
              <div className="text-xs text-owasp-muted mt-0.5">{step.sublabel}</div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight
                className="w-5 h-5 shrink-0"
                style={{ color: accentColor }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Attack Vector Column
// ---------------------------------------------------------------------------

function AttackVectorColumn({ vector }) {
  const rlColors = riskLevelColors[vector.riskLevel] || { bg: '#1e293b', text: '#94a3b8' }

  return (
    <div className="bg-owasp-dark rounded-xl border border-owasp-border p-4 flex flex-col items-center">
      {/* Vector Title + Risk Level */}
      <h4 className="text-owasp-text font-semibold text-sm text-center mb-2">
        {vector.title}
      </h4>
      <span
        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-4"
        style={{ backgroundColor: rlColors.bg, color: rlColors.text }}
      >
        {vector.riskLevel}
      </span>

      {/* Vertical step flow */}
      <div className="flex flex-col items-center gap-0 w-full">
        {vector.steps.map((step, i) => {
          const nc = nodeColors[step.type] || nodeColors.gray
          return (
            <div key={i} className="flex flex-col items-center w-full">
              {i > 0 && (
                <div className="flex flex-col items-center my-1">
                  <div className="w-px h-4 bg-owasp-border" />
                  <ChevronDown className="w-3.5 h-3.5 text-owasp-dim -mt-1" />
                </div>
              )}
              <div
                className="rounded-lg px-4 py-2.5 w-full text-center border text-xs font-medium leading-snug"
                style={{
                  backgroundColor: nc.bg,
                  borderColor: nc.border + '60',
                  color: nc.text,
                }}
              >
                {step.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prev / Next Navigation
// ---------------------------------------------------------------------------

function PrevNextNav({ currentIndex }) {
  const prev = currentIndex > 0 ? risks[currentIndex - 1] : null
  const next = currentIndex < risks.length - 1 ? risks[currentIndex + 1] : null

  return (
    <div className="flex items-center justify-between gap-4">
      {prev ? (
        <Link
          to={`/risks/${prev.id}`}
          className="flex items-center gap-2 px-4 py-3 bg-owasp-card border border-owasp-border rounded-lg hover:border-owasp-hover transition-colors group flex-1 min-w-0"
        >
          <ArrowLeft className="w-4 h-4 text-owasp-dim group-hover:text-owasp-text transition-colors shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-owasp-dim uppercase tracking-wider">Previous</div>
            <div className="text-sm text-owasp-text font-medium truncate">{prev.id} — {prev.title}</div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          to={`/risks/${next.id}`}
          className="flex items-center justify-end gap-2 px-4 py-3 bg-owasp-card border border-owasp-border rounded-lg hover:border-owasp-hover transition-colors group flex-1 min-w-0 text-right"
        >
          <div className="min-w-0">
            <div className="text-[10px] text-owasp-dim uppercase tracking-wider">Next</div>
            <div className="text-sm text-owasp-text font-medium truncate">{next.id} — {next.title}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-owasp-dim group-hover:text-owasp-text transition-colors shrink-0" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RiskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const riskIndex = useMemo(() => risks.findIndex(r => r.id === id), [id])
  const risk = riskIndex >= 0 ? risks[riskIndex] : null

  // Collapsible state — attack flow & mitigations default open
  const [showUnfolds, setShowUnfolds] = useState(false)
  const [showCapabilities, setShowCapabilities] = useState(false)

  // ---------- 404 ----------
  if (!risk) {
    return (
      <div className="py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-owasp-dim mx-auto mb-4" />
        <h2 className="text-xl font-bold text-owasp-text mb-2">Risk Not Found</h2>
        <p className="text-owasp-muted mb-6">
          No risk entry matches the ID <span className="font-mono text-cat-leakage">{id}</span>.
        </p>
        <Link
          to="/risks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-owasp-card border border-owasp-border rounded-lg text-sm text-owasp-text hover:border-owasp-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    )
  }

  const cat = getCategoryMeta(risk.category)

  return (
    <div className="py-8 animate-fade-in space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Top Navigation */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/risks"
          className="inline-flex items-center gap-2 text-sm text-owasp-muted hover:text-owasp-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Risk Catalog
        </Link>

        <PrevNextNav currentIndex={riskIndex} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-md text-xs font-bold font-mono"
            style={{ backgroundColor: cat.color + '22', color: cat.color }}
          >
            {risk.id}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
            style={{
              color: cat.color,
              borderColor: cat.color + '50',
              backgroundColor: cat.color + '12',
            }}
          >
            {risk.categoryLabel}
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-owasp-text mb-2"
          style={{ textDecorationColor: cat.color }}
        >
          {risk.title}
        </h1>
        <p className="text-owasp-muted text-base leading-relaxed max-w-3xl">
          {risk.tagline}
        </p>
        {/* Accent stripe */}
        <div
          className="mt-4 h-1 w-20 rounded-full"
          style={{ backgroundColor: cat.color }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Attack Flow Diagram */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Attack Flow"
        icon={Target}
        defaultOpen={true}
        accentColor={cat.color}
      >
        <AttackFlowDiagram steps={risk.attackFlow} accentColor={cat.color} />
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. How the Attack Unfolds */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="How the Attack Unfolds"
        icon={Layers}
        defaultOpen={false}
        accentColor={cat.color}
      >
        <div className="mt-4 space-y-4">
          {risk.howItUnfolds.split('\n\n').map((para, i) => (
            <p key={i} className="text-owasp-muted text-sm leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Attack Vectors */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title={`Attack Vectors (${risk.attackVectors.length})`}
        icon={AlertTriangle}
        defaultOpen={true}
        accentColor={cat.color}
      >
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risk.attackVectors.map((vector, i) => (
            <AttackVectorColumn key={i} vector={vector} />
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Attacker Capabilities */}
      {/* ------------------------------------------------------------------ */}
      <Section
        title="Attacker Capabilities"
        icon={Target}
        defaultOpen={false}
        accentColor={cat.color}
      >
        <p className="mt-4 text-owasp-muted text-sm leading-relaxed">
          {risk.attackerCapabilities}
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Illustrative Scenario */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="rounded-xl border p-5"
        style={{
          backgroundColor: cat.color + '08',
          borderColor: cat.color + '30',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: cat.color }}
          />
          <div>
            <h3 className="text-owasp-text font-semibold text-sm mb-2">Illustrative Scenario</h3>
            <p className="text-owasp-muted text-sm leading-relaxed">
              {risk.illustrativeScenario}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Impact */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <h3 className="text-owasp-text font-semibold text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: cat.color }} />
          Impact
        </h3>

        {/* Impact bullet points */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {risk.impact.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 bg-owasp-card border border-owasp-border rounded-lg px-4 py-2.5 text-sm text-owasp-muted"
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {item}
            </li>
          ))}
        </ul>

        {/* Impact chips */}
        <div className="flex flex-wrap gap-2">
          {risk.impactChips.map((chip, i) => {
            const colors = chipColorMap[chip.color] || { bg: '#1e293b', text: '#94a3b8' }
            return (
              <div
                key={i}
                className="px-3 py-2 rounded-lg border text-xs"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.text + '30',
                }}
              >
                <span className="font-semibold" style={{ color: colors.text }}>
                  {chip.label}
                </span>
                <span className="text-owasp-dim ml-1.5">{chip.detail}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Mitigations */}
      {/* ------------------------------------------------------------------ */}
      {['tier1', 'tier2', 'tier3'].map(tierKey => {
        const tier = tierColors[tierKey]
        const controls = risk.mitigations[tierKey]
        if (!controls || controls.length === 0) return null

        return (
          <Section
            key={tierKey}
            title={`${tierLabels[tierKey]} Mitigations — Tier ${tierKey.slice(-1)} (${controls.length})`}
            icon={CheckCircle}
            defaultOpen={tierKey === 'tier1'}
            accentColor={tier.accent}
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {controls.map((ctrl, i) => {
                const ss = getScopeStyle(ctrl.scope)
                return (
                  <div
                    key={i}
                    className="rounded-lg border p-4"
                    style={{
                      backgroundColor: tier.bg,
                      borderColor: tier.border + '50',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4
                        className="text-sm font-semibold"
                        style={{ color: tier.text }}
                      >
                        {ctrl.title}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: ss.bg, color: ss.text }}
                      >
                        {ctrl.scope}
                      </span>
                    </div>
                    <p className="text-owasp-muted text-xs leading-relaxed">
                      {ctrl.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </Section>
        )
      })}

      {/* ------------------------------------------------------------------ */}
      {/* 8. Known CVEs */}
      {/* ------------------------------------------------------------------ */}
      {risk.cves.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-owasp-text font-semibold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Known CVEs ({risk.cves.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {risk.cves.map((cve, i) => (
              <a
                key={i}
                href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 border border-red-900/50 rounded-lg text-xs font-mono text-red-400 hover:bg-red-900/50 transition-colors"
              >
                {cve}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 9. Cross-References */}
      {/* ------------------------------------------------------------------ */}
      {risk.crossReferences.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-owasp-text font-semibold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: cat.color }} />
            Cross-References
          </h3>
          <div className="flex flex-wrap gap-2">
            {risk.crossReferences.map((ref, i) => {
              const isInternal = ref.startsWith('DSGAI')
              const linkedRisk = isInternal
                ? risks.find(r => r.id === ref)
                : null

              if (isInternal && linkedRisk) {
                const refCat = getCategoryMeta(linkedRisk.category)
                return (
                  <Link
                    key={i}
                    to={`/risks/${ref}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-owasp-card border border-owasp-border rounded-lg text-xs font-mono hover:border-owasp-hover transition-colors"
                    style={{ color: refCat.color }}
                  >
                    {ref}
                    <span className="text-owasp-dim font-sans">
                      {linkedRisk.title}
                    </span>
                  </Link>
                )
              }

              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-owasp-card border border-owasp-border rounded-lg text-xs font-mono text-owasp-muted"
                >
                  {ref}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 10. Bottom Prev/Next */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-4 border-t border-owasp-border">
        <PrevNextNav currentIndex={riskIndex} />
      </div>
    </div>
  )
}
