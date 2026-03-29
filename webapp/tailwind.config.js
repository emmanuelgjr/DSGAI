/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'owasp-dark': '#0e1117',
        'owasp-card': '#161b27',
        'owasp-border': '#252d40',
        'owasp-hover': '#404860',
        'owasp-text': '#e8eaf0',
        'owasp-muted': '#8896b0',
        'owasp-dim': '#6b7a99',
        'cat-leakage': '#f87171',
        'cat-identity': '#a78bfa',
        'cat-governance': '#facc15',
        'cat-poisoning': '#fb923c',
        'cat-infra': '#2dd4bf',
        'cat-compliance': '#e879f9',
        'cat-attack': '#4ade80',
        'cat-leakage-bg': '#2a1520',
        'cat-identity-bg': '#1a1530',
        'cat-governance-bg': '#1a1a0d',
        'cat-poisoning-bg': '#1a1012',
        'cat-infra-bg': '#0d1f20',
        'cat-compliance-bg': '#1e1028',
        'cat-attack-bg': '#0f1a14',
      },
    },
  },
  plugins: [],
}
