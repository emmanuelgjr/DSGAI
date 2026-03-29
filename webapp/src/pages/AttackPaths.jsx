import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Route, ChevronRight, ArrowRight, Shield, Target,
  AlertTriangle, ExternalLink,
} from 'lucide-react'
import { risks, categories } from '../data/risks'

// Category color maps
const catColorClass = {
  leakage: 'text-cat-leakage',
  identity: 'text-cat-identity',
  governance: 'text-cat-governance',
  poisoning: 'text-cat-poisoning',
  infra: 'text-cat-infra',
  compliance: 'text-cat-compliance',
  attack: 'text-cat-attack',
}

const catBorderClass = {
  leakage: 'border-cat-leakage',
  identity: 'border-cat-identity',
  governance: 'border-cat-governance',
  poisoning: 'border-cat-poisoning',
  infra: 'border-cat-infra',
  compliance: 'border-cat-compliance',
  attack: 'border-cat-attack',
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

// Node type styles
const nodeStyles = {
  attacker: 'bg-red-900/30 border-red-500/50 text-red-400',
  action: 'bg-amber-900/30 border-amber-500/50 text-amber-400',
  system: 'bg-blue-900/30 border-blue-500/50 text-blue-400',
  leak: 'bg-red-900/40 border-red-500/60 text-red-300',
  impact: 'bg-green-900/30 border-green-500/50 text-green-400',
  gray: 'bg-gray-800 border-gray-600 text-gray-400',
}

// Impact chip color map
const chipColors = {
  pii: 'bg-red-900/40 text-red-300 border-red-500/30',
  reg: 'bg-amber-900/40 text-amber-300 border-amber-500/30',
  poison: 'bg-orange-900/40 text-orange-300 border-orange-500/30',
  dsr: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
}

// Risk level badge styles
const riskLevelStyles = {
  'HIGH RISK': 'bg-red-900/50 text-red-300 border-red-500/40',
  'MEDIUM RISK': 'bg-amber-900/50 text-amber-300 border-amber-500/40',
  'PERSISTENT RISK': 'bg-purple-900/50 text-purple-300 border-purple-500/40',
  'LOW RISK': 'bg-green-900/50 text-green-300 border-green-500/40',
}

function AttackFlowNode({ node, isLast }) {
  return (
    <div className="flex items-center shrink-0">
      <div className="bg-owasp-card border border-owasp-border rounded-lg px-3 py-2 text-center min-w-[120px] max-w-[160px]">
        <div className="text-xs font-medium text-owasp-text leading-tight">{node.label}</div>
        {node.sublabel && (
          <div className="text-[10px] text-owasp-muted mt-0.5 leading-tight">{node.sublabel}</div>
        )}
      </div>
      {!isLast && (
        <ChevronRight className="w-4 h-4 text-owasp-muted shrink-0 mx-1" />
      )}
    </div>
  )
}

function VectorStep({ step }) {
  const style = nodeStyles[step.type] || nodeStyles.gray
  return (
    <div className={`border rounded px-2.5 py-1.5 text-[11px] font-medium leading-tight ${style}`}>
      {step.label}
    </div>
  )
}

function AttackVector({ vector, index }) {
  const maxSteps = 3
  const steps = vector.steps.slice(0, maxSteps)
  const levelStyle = riskLevelStyles[vector.riskLevel] || riskLevelStyles['MEDIUM RISK']

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-owasp-muted uppercase tracking-wider">
          V{index + 1}
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${levelStyle}`}>
          {vector.riskLevel}
        </span>
      </div>
      <div className="text-[11px] font-medium text-owasp-text mb-1 truncate" title={vector.title}>
        {vector.title}
      </div>
      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-1">
            <VectorStep step={step} />
            {i < steps.length - 1 && (
              <div className="flex items-center self-center">
                <ArrowRight className="w-3 h-3 text-owasp-dim shrink-0" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AttackPathCard({ risk }) {
  const vectors = (risk.attackVectors || []).slice(0, 3)
  const chips = risk.impactChips || []

  return (
    <div
      className={`bg-owasp-card rounded-xl border border-owasp-border border-l-4 ${catBorderClass[risk.category]} overflow-hidden hover:border-owasp-hover transition-colors card-stagger`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-owasp-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-mono font-bold ${catColorClass[risk.category]} shrink-0`}>
            {risk.id}
          </span>
          <h3 className="text-sm font-semibold text-owasp-text truncate">{risk.title}</h3>
        </div>
        <Link
          to={`/risks/${risk.id}`}
          className={`shrink-0 text-xs font-medium ${catColorClass[risk.category]} hover:underline flex items-center gap-1`}
        >
          Detail <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Attack Flow (horizontal) */}
      <div className="px-4 py-3 border-b border-owasp-border/50">
        <div className="text-[10px] font-semibold text-owasp-muted uppercase tracking-wider mb-2">
          Attack Flow
        </div>
        <div className="flex items-center overflow-x-auto gap-0 pb-1">
          {(risk.attackFlow || []).map((node, i) => (
            <AttackFlowNode
              key={i}
              node={node}
              isLast={i === risk.attackFlow.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Attack Vectors (compact vertical flows, displayed in columns) */}
      {vectors.length > 0 && (
        <div className="px-4 py-3 border-b border-owasp-border/50">
          <div className="text-[10px] font-semibold text-owasp-muted uppercase tracking-wider mb-2">
            Attack Vectors
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vectors.map((vec, i) => (
              <AttackVector key={i} vector={vec} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Impact Chips */}
      {chips.length > 0 && (
        <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <span
              key={i}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${chipColors[chip.color] || chipColors.pii}`}
              title={chip.detail}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AttackPaths() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? risks
    : risks.filter((r) => r.category === activeCategory)

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cat-attack-bg flex items-center justify-center">
            <Route className="w-5 h-5 text-cat-attack" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-owasp-text">Attack Path Overview</h1>
            <p className="text-sm text-owasp-muted mt-0.5">
              Visual attack paths for all 21 OWASP GenAI data security risks
            </p>
          </div>
        </div>
        <p className="text-owasp-muted text-sm max-w-3xl">
          Each card shows the high-level attack flow, detailed attack vectors with step-by-step
          progression, and downstream impact. Click any card to view the full risk detail including
          mitigations and CVE references.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeCategory === 'all'
              ? 'bg-owasp-border text-white border-owasp-hover'
              : 'bg-owasp-card text-owasp-muted border-owasp-border hover:text-owasp-text hover:border-owasp-hover'
          }`}
        >
          All ({risks.length})
        </button>
        {categories.map((cat) => {
          const count = risks.filter((r) => r.category === cat.id).length
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? `${catBgSoftClass[cat.id]} ${catColorClass[cat.id]} ${catBorderClass[cat.id]}`
                  : `bg-owasp-card text-owasp-muted border-owasp-border hover:text-owasp-text hover:border-owasp-hover`
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 mb-6 text-xs text-owasp-muted">
        <Shield className="w-3.5 h-3.5" />
        <span>
          Showing {filtered.length} of {risks.length} attack paths
        </span>
        {activeCategory !== 'all' && (
          <button
            onClick={() => setActiveCategory('all')}
            className="text-cat-attack hover:underline ml-2"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Attack Path Cards */}
      <div className="flex flex-col gap-6">
        {filtered.map((risk) => (
          <AttackPathCard key={risk.id} risk={risk} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-owasp-muted text-sm mb-4">
          Each attack path maps to detailed mitigations across three implementation tiers.
        </p>
        <Link
          to="/risks"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-owasp-border text-white text-sm font-medium hover:bg-owasp-hover transition-colors"
        >
          <Target className="w-4 h-4" />
          View Full Risk Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
