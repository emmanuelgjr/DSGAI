import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ExternalLink, Sun, Moon } from 'lucide-react'

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
import { useTheme } from './ThemeContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/risks', label: 'Risk Catalog' },
  { to: '/attack-paths', label: 'Attack Paths' },
  { to: '/diagrams', label: 'Diagrams' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-owasp-dark/95 backdrop-blur-sm border-b border-owasp-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <Shield className="w-8 h-8 text-cat-leakage group-hover:text-white transition-colors" />
            <div>
              <div className="font-bold text-owasp-text text-sm leading-tight">OWASP GenAI</div>
              <div className="text-[10px] text-owasp-muted font-mono tracking-wider">DATA SECURITY 2026</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-owasp-border text-owasp-text'
                    : 'text-owasp-muted hover:text-owasp-text hover:bg-owasp-card'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://genai.owasp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors flex items-center gap-1"
            >
              OWASP <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/emmanuelgjr/DSGAI"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 p-2 rounded-lg text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors"
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

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggle}
              className="p-2 text-owasp-muted hover:text-owasp-text"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-owasp-muted hover:text-owasp-text"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden pb-4 border-t border-owasp-border pt-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.to
                    ? 'bg-owasp-border text-owasp-text'
                    : 'text-owasp-muted hover:text-owasp-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
