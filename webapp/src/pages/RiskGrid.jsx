import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Grid, List, ChevronRight, AlertTriangle, Shield } from 'lucide-react'
import { risks, categories } from '../data/risks'

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

function getCategoryMeta(categoryId) {
  return categories.find(c => c.id === categoryId) || categories[0]
}

export default function RiskGrid() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')

  const activeCat = searchParams.get('cat') || 'all'

  const setActiveCat = (catId) => {
    if (catId === 'all') {
      searchParams.delete('cat')
    } else {
      searchParams.set('cat', catId)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const filtered = useMemo(() => {
    let result = risks

    if (activeCat !== 'all') {
      result = result.filter(r => r.category === activeCat)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        r =>
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.tagline.toLowerCase().includes(q)
      )
    }

    return result
  }, [activeCat, search])

  return (
    <div className="py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-cat-leakage" />
          <h1 className="text-3xl font-bold text-white">Risk Catalog</h1>
        </div>
        <p className="text-owasp-muted text-lg">
          21 data security risks across the GenAI lifecycle
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 mb-8">
        {/* Search + View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-owasp-dim" />
            <input
              type="text"
              placeholder="Search by ID, title, or tagline..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-owasp-card border border-owasp-border rounded-lg text-sm text-owasp-text placeholder:text-owasp-dim focus:outline-none focus:border-owasp-hover transition-colors"
            />
          </div>
          <div className="flex items-center bg-owasp-card border border-owasp-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 transition-colors ${
                view === 'grid'
                  ? 'bg-owasp-border text-white'
                  : 'text-owasp-dim hover:text-white'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 transition-colors ${
                view === 'list'
                  ? 'bg-owasp-border text-white'
                  : 'text-owasp-dim hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeCat === 'all'
                ? 'bg-white text-owasp-dark border-white'
                : 'border-owasp-border text-owasp-muted hover:text-white hover:border-owasp-hover'
            }`}
          >
            All ({risks.length})
          </button>
          {categories.map(cat => {
            const count = risks.filter(r => r.category === cat.id).length
            const isActive = activeCat === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={
                  isActive
                    ? {
                        backgroundColor: cat.color,
                        color: '#fff',
                        borderColor: cat.color,
                      }
                    : {
                        borderColor: '#252d40',
                        color: cat.color,
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = cat.color
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#252d40'
                  }
                }}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-owasp-dim mb-4">
        Showing {filtered.length} of {risks.length} risks
      </p>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(risk => {
            const cat = getCategoryMeta(risk.category)
            return (
              <Link
                key={risk.id}
                to={`/risks/${risk.id}`}
                className="card-stagger group block bg-owasp-card rounded-xl border border-owasp-border hover:border-owasp-hover transition-all duration-200 overflow-hidden"
                style={{ borderLeftWidth: '3px', borderLeftColor: cat.color }}
              >
                <div className="p-5">
                  {/* ID badge + category */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-bold font-mono"
                      style={{ backgroundColor: cat.color + '22', color: cat.color }}
                    >
                      {risk.id}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-owasp-dim">
                      {risk.categoryLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold mb-1.5 group-hover:text-cat-leakage transition-colors leading-tight">
                    {risk.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-owasp-muted text-xs leading-relaxed mb-4 line-clamp-2">
                    {risk.tagline}
                  </p>

                  {/* Mini Attack Flow */}
                  <div className="flex items-center flex-wrap gap-1 mb-3">
                    {risk.attackFlow.map((step, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-owasp-dark rounded text-[10px] text-owasp-muted font-medium whitespace-nowrap">
                          {step.label}
                        </span>
                        {i < risk.attackFlow.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-owasp-dim shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row: vectors, impact, CVEs */}
                  <div className="flex items-center justify-between pt-3 border-t border-owasp-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Attack vector count */}
                      <span className="text-[10px] text-owasp-dim">
                        {risk.attackVectors.length} vector{risk.attackVectors.length !== 1 ? 's' : ''}
                      </span>

                      {/* Impact chips (show first 2) */}
                      {risk.impactChips.slice(0, 2).map((chip, i) => {
                        const colors = chipColorMap[chip.color] || { bg: '#1e293b', text: '#94a3b8' }
                        return (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {chip.label}
                          </span>
                        )
                      })}
                      {risk.impactChips.length > 2 && (
                        <span className="text-[9px] text-owasp-dim">
                          +{risk.impactChips.length - 2}
                        </span>
                      )}
                    </div>

                    {/* CVE badge */}
                    {risk.cves.length > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 text-[9px] font-medium">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {risk.cves.length} CVE{risk.cves.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="border border-owasp-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[80px_1fr_150px_140px_80px_40px] gap-3 px-4 py-2.5 bg-owasp-card/50 border-b border-owasp-border text-[10px] font-semibold uppercase tracking-wider text-owasp-dim">
            <span>ID</span>
            <span>Title</span>
            <span>Category</span>
            <span>Impact</span>
            <span>CVEs</span>
            <span></span>
          </div>

          {filtered.map(risk => {
            const cat = getCategoryMeta(risk.category)
            return (
              <Link
                key={risk.id}
                to={`/risks/${risk.id}`}
                className="card-stagger group block sm:grid sm:grid-cols-[80px_1fr_150px_140px_80px_40px] gap-3 items-center px-4 py-3 border-b border-owasp-border hover:bg-owasp-card/80 transition-colors"
              >
                {/* ID */}
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: cat.color }}
                >
                  {risk.id}
                </span>

                {/* Title + tagline on mobile */}
                <div className="min-w-0">
                  <span className="text-sm text-white font-medium group-hover:text-cat-leakage transition-colors">
                    {risk.title}
                  </span>
                  <span className="hidden lg:inline text-owasp-dim text-xs ml-2">
                    — {risk.tagline.length > 60 ? risk.tagline.slice(0, 60) + '...' : risk.tagline}
                  </span>
                </div>

                {/* Category */}
                <span className="hidden sm:block">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ backgroundColor: cat.color + '22', color: cat.color }}
                  >
                    {risk.categoryLabel}
                  </span>
                </span>

                {/* Impact chips */}
                <div className="hidden sm:flex items-center gap-1 flex-wrap">
                  {risk.impactChips.slice(0, 2).map((chip, i) => {
                    const colors = chipColorMap[chip.color] || { bg: '#1e293b', text: '#94a3b8' }
                    return (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {chip.label}
                      </span>
                    )
                  })}
                </div>

                {/* CVE status */}
                <span className="hidden sm:block">
                  {risk.cves.length > 0 ? (
                    <span className="flex items-center gap-1 text-red-400 text-[10px] font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {risk.cves.length}
                    </span>
                  ) : (
                    <span className="text-owasp-dim text-[10px]">—</span>
                  )}
                </span>

                {/* Arrow */}
                <ChevronRight className="hidden sm:block w-4 h-4 text-owasp-dim group-hover:text-white transition-colors ml-auto" />
              </Link>
            )
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-owasp-dim text-sm">
              No risks match your search criteria.
            </div>
          )}
        </div>
      )}

      {/* Empty state for grid */}
      {view === 'grid' && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-owasp-dim mx-auto mb-3" />
          <p className="text-owasp-muted text-sm">No risks match your search criteria.</p>
          <button
            onClick={() => {
              setSearch('')
              setActiveCat('all')
            }}
            className="mt-3 text-sm text-cat-leakage hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
