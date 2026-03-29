/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'owasp-dark': 'var(--c-dark)',
        'owasp-card': 'var(--c-card)',
        'owasp-border': 'var(--c-border)',
        'owasp-hover': 'var(--c-hover)',
        'owasp-text': 'var(--c-text)',
        'owasp-muted': 'var(--c-muted)',
        'owasp-dim': 'var(--c-dim)',
        'cat-leakage': '#f87171',
        'cat-identity': '#a78bfa',
        'cat-governance': '#facc15',
        'cat-poisoning': '#fb923c',
        'cat-infra': '#2dd4bf',
        'cat-compliance': '#e879f9',
        'cat-attack': '#4ade80',
        'cat-leakage-bg': 'var(--c-cat-leakage-bg)',
        'cat-identity-bg': 'var(--c-cat-identity-bg)',
        'cat-governance-bg': 'var(--c-cat-governance-bg)',
        'cat-poisoning-bg': 'var(--c-cat-poisoning-bg)',
        'cat-infra-bg': 'var(--c-cat-infra-bg)',
        'cat-compliance-bg': 'var(--c-cat-compliance-bg)',
        'cat-attack-bg': 'var(--c-cat-attack-bg)',
      },
    },
  },
  plugins: [],
}
