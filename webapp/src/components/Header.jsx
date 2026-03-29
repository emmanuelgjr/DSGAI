import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ExternalLink } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/risks', label: 'Risk Catalog' },
  { to: '/attack-paths', label: 'Attack Paths' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-owasp-dark/95 backdrop-blur-sm border-b border-owasp-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <Shield className="w-8 h-8 text-cat-leakage group-hover:text-white transition-colors" />
            <div>
              <div className="font-bold text-white text-sm leading-tight">OWASP GenAI</div>
              <div className="text-[10px] text-owasp-muted font-mono tracking-wider">DATA SECURITY 2026</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-owasp-border text-white'
                    : 'text-owasp-muted hover:text-white hover:bg-owasp-card'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://genai.owasp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-owasp-muted hover:text-white hover:bg-owasp-card transition-colors flex items-center gap-1"
            >
              OWASP <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-owasp-muted hover:text-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 border-t border-owasp-border pt-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.to
                    ? 'bg-owasp-border text-white'
                    : 'text-owasp-muted hover:text-white'
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
