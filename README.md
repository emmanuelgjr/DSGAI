# OWASP GenAI Data Security - Interactive Guide

An interactive web application for exploring the **OWASP GenAI Data Security Risks and Mitigations 2026** framework. This project makes the 21 DSGAI risk entries accessible through a modern, searchable, and visually rich interface.

## What is DSGAI?

The OWASP GenAI Data Security framework identifies and structures 21 data security risks specific to GenAI systems - covering the full lifecycle from training-time poisoning to inference-time reconstruction, compliance failures, and model IP theft.

Each entry provides:
- **How the attack unfolds** in GenAI-specific terms
- **Attacker capabilities** and threat models
- **Illustrative scenarios** grounded in documented incidents
- **Tiered mitigations** (Foundational → Hardening → Advanced)
- **Known CVEs** and cross-references

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

## Features

- **Risk Catalog** - Browse, search, and filter all 21 DSGAI entries
- **Interactive Attack Paths** - Visual attack flow diagrams for each risk
- **Detailed Risk Pages** - Full breakdowns with mitigations, CVEs, and cross-references
- **Category Filtering** - Filter risks by category across all views
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Professional dark UI optimized for readability

## Tech Stack

- **React** + **Vite** for fast builds and development
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **Lucide React** for icons

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

The built files will be in `webapp/dist/`.

## Deploying to GitHub Pages

The project includes a GitHub Actions workflow for automatic deployment. Push to `main` and it will deploy to GitHub Pages.

## Original Document

The source document is the **OWASP GenAI Data Security Risks and Mitigations 2026 v1.0** (March 2026), published by the OWASP GenAI Security Project. The original HTML attack path diagrams and cheatsheet are preserved in the root directory.

## License

This project is licensed under **Creative Commons CC BY-SA 4.0**, consistent with the original OWASP document.

- You are free to share and adapt the material
- You must give appropriate credit and indicate changes
- Derivative works must use the same license

## Attribution

- **OWASP GenAI Security Project** - [genai.owasp.org](https://genai.owasp.org)
- **OWASP Top 10 for LLMs and GenAI** - [owasp.org/www-project-top-10-for-large-language-model-applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
