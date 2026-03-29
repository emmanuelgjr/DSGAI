import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ExternalLink, Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from './ThemeContext'

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

const navItems = [
  { to: '/', label: 'Home' },
  {
    label: 'Explore',
    children: [
      { to: '/risks', label: 'Risk Catalog', desc: 'All 21 DSGAI entries' },
      { to: '/attack-paths', label: 'Attack Paths', desc: 'Visual attack flows' },
      { to: '/diagrams', label: 'Network Diagrams', desc: 'Infrastructure topology views' },
      { to: '/threat-models', label: 'Threat Models', desc: 'STRIDE analysis per risk' },
    ],
  },
  {
    label: 'Tools',
    children: [
      { to: '/assessment', label: 'Risk Assessment', desc: 'Profile your GenAI stack' },
      { to: '/checklists', label: 'Checklists', desc: 'Implementation tracking' },
      { to: '/playbooks', label: 'Playbooks', desc: 'Detection & response' },
      { to: '/policy-generator', label: 'Policy Generator', desc: 'Generate security policies' },
      { to: '/adrs', label: 'Architecture Decisions', desc: 'Secure patterns & code' },
    ],
  },
  { to: '/about', label: 'About' },
]

function Dropdown({ item, pathname, onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isChildActive = item.children.some(c => pathname === c.to)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isChildActive
            ? 'bg-owasp-border text-owasp-text'
            : 'text-owasp-muted hover:text-owasp-text hover:bg-owasp-card'
        }`}
      >
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-owasp-card border border-owasp-border rounded-xl shadow-xl z-50 py-2 animate-fade-in">
          {item.children.map(child => (
            <Link
              key={child.to}
              to={child.to}
              onClick={() => { setOpen(false); onNavigate?.() }}
              className={`block px-4 py-2.5 hover:bg-owasp-dark transition-colors ${
                pathname === child.to ? 'bg-owasp-dark' : ''
              }`}
            >
              <div className={`text-sm font-medium ${pathname === child.to ? 'text-cat-leakage' : 'text-owasp-text'}`}>
                {child.label}
              </div>
              <div className="text-xs text-owasp-muted">{child.desc}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Flatten all nav links for mobile menu
const allLinks = navItems.flatMap(item =>
  item.children ? item.children : [item]
)

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-owasp-dark/95 backdrop-blur-sm border-b border-owasp-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <Shield className="w-8 h-8 text-cat-leakage group-hover:text-owasp-text transition-colors" />
            <div>
              <div className="font-bold text-owasp-text text-sm leading-tight">OWASP GenAI</div>
              <div className="text-[10px] text-owasp-muted font-mono tracking-wider">DATA SECURITY 2026</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, i) =>
              item.children ? (
                <Dropdown key={i} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.to
                      ? 'bg-owasp-border text-owasp-text'
                      : 'text-owasp-muted hover:text-owasp-text hover:bg-owasp-card'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            <a
              href="https://genai.owasp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-2.5 py-2 rounded-lg text-sm font-medium text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors flex items-center gap-1"
            >
              OWASP <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/emmanuelgjr/DSGAI"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={toggle} className="p-2 text-owasp-muted hover:text-owasp-text">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-owasp-muted hover:text-owasp-text">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-owasp-border pt-2 space-y-0.5">
            {navItems.map((item, i) => {
              if (item.children) {
                return (
                  <div key={i}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-owasp-dim">{item.label}</div>
                    {item.children.map(child => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                          pathname === child.to
                            ? 'bg-owasp-border text-owasp-text'
                            : 'text-owasp-muted hover:text-owasp-text'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )
              }
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    pathname === item.to
                      ? 'bg-owasp-border text-owasp-text'
                      : 'text-owasp-muted hover:text-owasp-text'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
