import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ExternalLink, Sun, Moon } from 'lucide-react'
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
            <button
              onClick={toggle}
              className="ml-2 p-2 rounded-lg text-owasp-muted hover:text-owasp-text hover:bg-owasp-card transition-colors"
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
