import { Shield, User } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-owasp-border bg-owasp-dark transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Credit */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <User className="w-4 h-4 text-cat-identity" />
            <span className="text-sm text-owasp-muted">
              Created by{' '}
              <strong className="text-owasp-text font-semibold">Emmanuel Guilherme Junior</strong>
              {' '}&mdash;{' '}
              <span className="text-cat-identity">OWASP GenAI Data Security Initiative Lead</span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-owasp-dim" />
              <span className="text-sm text-owasp-dim font-mono">
                OWASP GenAI Data Security Framework 2026
              </span>
            </div>
            <div className="text-xs text-owasp-dim text-center">
              Licensed under CC BY-SA 4.0 | DSGAI01-21 | v1.0 March 2026
            </div>
            <div className="flex gap-4">
              <a href="https://genai.owasp.org" target="_blank" rel="noopener noreferrer"
                 className="text-xs text-owasp-dim hover:text-owasp-text transition-colors">
                genai.owasp.org
              </a>
              <a href="https://github.com/emmanuelgjr/DSGAI" target="_blank" rel="noopener noreferrer"
                 className="text-xs text-owasp-dim hover:text-owasp-text transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
