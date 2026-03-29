# OWASP GenAI Data Security - Interactive Platform

An enterprise-ready interactive platform for the **OWASP GenAI Data Security Risks and Mitigations 2026** framework. Built for CISOs, cybersecurity practitioners, GenAI developers, and data scientists to explore, assess, implement, and operationalize the 21 DSGAI data security risks.

**Live Site:** [emmanuelgjr.github.io/DSGAI](https://emmanuelgjr.github.io/DSGAI/)

**Project Lead:** Emmanuel Guilherme Junior - OWASP GenAI Data Security Initiative Lead

## What is DSGAI?

The OWASP GenAI Data Security framework identifies 21 data security risks specific to GenAI systems - covering the full lifecycle from training-time poisoning to inference-time reconstruction, compliance failures, and model IP theft. Each entry provides attack descriptions, threat models, tiered mitigations, and CVE references.

## Platform Features

### Explore
| Feature | Description | Audience |
|---------|-------------|----------|
| **Risk Catalog** | Browse, search, and filter all 21 DSGAI entries with category-based navigation | All |
| **Attack Paths** | Visual attack flow diagrams for each risk with vector breakdowns | Practitioners |
| **Network Diagrams** | Animated SVG network topology views with infrastructure icons | Architects |
| **Threat Models** | STRIDE-based threat analysis per risk with assets, data flows, and controls | Security Engineers |

### Tools
| Feature | Description | Audience |
|---------|-------------|----------|
| **Risk Assessment** | Interactive questionnaire that profiles your GenAI stack and outputs a personalized risk report | CISOs, Risk Managers |
| **Implementation Checklists** | Actionable task lists per risk with tool recommendations, effort estimates, and progress tracking (persisted to browser) | Practitioners, DevSecOps |
| **Detection & Response Playbooks** | SIEM queries (Splunk/Sentinel/Elastic), detection signatures, response runbooks, and IoCs for each risk | SOC Teams, IR |
| **Policy Generator** | Wizard that generates downloadable security policies: Acceptable Use, Data Classification, Model Governance, Vendor Assessment | CISOs, GRC |
| **Architecture Decision Records** | 10 secure-by-default patterns with code snippets (Python/JS), anti-patterns, and trade-offs | GenAI Developers, Architects |

### Platform Capabilities
- **Dark / Light Mode** with system preference detection and localStorage persistence
- **PDF Export** for diagrams, attack paths, and assessment reports via browser print
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Zero Backend** - everything runs in the browser, no data leaves your machine
- **GitHub Pages Auto-Deploy** via GitHub Actions

## Risk Categories

| Category | Risks | Color |
|----------|-------|-------|
| Leakage | DSGAI01, DSGAI09 | Red |
| Identity & Access | DSGAI02, DSGAI06 | Purple |
| Governance & Lifecycle | DSGAI03, DSGAI07, DSGAI10, DSGAI14, DSGAI19 | Yellow |
| Poisoning & Integrity | DSGAI04, DSGAI05, DSGAI21 | Orange |
| Infrastructure | DSGAI11, DSGAI12, DSGAI13, DSGAI17 | Teal |
| Compliance & Regulatory | DSGAI08, DSGAI15 | Pink |
| Adversarial Attacks | DSGAI16, DSGAI18, DSGAI20 | Green |

## Tech Stack

- **React 18** + **Vite 5** for fast builds and development
- **Tailwind CSS 3** with CSS-variable-based theming
- **React Router 6** for client-side routing
- **Lucide React** for icons
- **GitHub Actions** for CI/CD to GitHub Pages

## Getting Started

```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

```bash
cd webapp
npm run build
```

## Project Structure

```
DSGAI/
├── webapp/src/
│   ├── data/risks.js              # All 21 DSGAI entries (structured data)
│   ├── components/
│   │   ├── Header.jsx             # Responsive nav with dropdown menus
│   │   ├── Footer.jsx             # Credits and links
│   │   └── ThemeContext.jsx        # Dark/light mode provider
│   ├── pages/
│   │   ├── Landing.jsx            # Home page with hero and feature overview
│   │   ├── RiskGrid.jsx           # Searchable/filterable risk catalog
│   │   ├── RiskDetail.jsx         # Full risk breakdown per entry
│   │   ├── AttackPaths.jsx        # Visual attack flow overview
│   │   ├── Diagrams.jsx           # Animated network topology diagrams
│   │   ├── Assessment.jsx         # Interactive risk assessment tool
│   │   ├── Checklists.jsx         # Implementation tracking checklists
│   │   ├── ThreatModels.jsx       # STRIDE threat model templates
│   │   ├── ADRs.jsx               # Architecture decision records
│   │   ├── Playbooks.jsx          # Detection & response playbooks
│   │   ├── PolicyGenerator.jsx    # Security policy wizard
│   │   └── About.jsx              # Framework context and credits
│   └── App.jsx                    # Router configuration
├── dsgai*_attack_path.html        # Original HTML attack diagrams
├── dsgai_cheatsheet.html          # Original cheatsheet
├── OWASP-*.pdf                    # Original published document
└── .github/workflows/deploy.yml   # GitHub Pages deployment
```

## Original Document

Source: **OWASP GenAI Data Security Risks and Mitigations 2026 v1.0** (March 2026), published by the OWASP GenAI Security Project at [genai.owasp.org](https://genai.owasp.org).

## License

Licensed under **Creative Commons CC BY-SA 4.0**, consistent with the original OWASP document.

## Attribution

- **Emmanuel Guilherme Junior** - OWASP GenAI Data Security Initiative Lead
- **OWASP GenAI Security Project** - [genai.owasp.org](https://genai.owasp.org)
- **OWASP Top 10 for LLMs and GenAI** - [owasp.org/www-project-top-10-for-large-language-model-applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

## Contributing

Contributions welcome. Please open an issue or submit a pull request.
