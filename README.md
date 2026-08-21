# Resumora

> An editorial resume builder crafted for engineers, designers, and leaders. Fast, local-first, and ATS-optimized.

---

## Overview

Resumora is a modern web-based resume studio focused on typography, whitespace, and precise PDF vector exports. Unlike typical SaaS resume builders that lock users into recurring subscriptions or compromise layout for ATS parsers, Resumora combines high-fashion editorial design with strict machine-readable semantic structures.

All processing runs directly in your browser. Your personal data is never transmitted to or stored on external servers.

---

## Key Features

- **Editorial Design System**: Curated layouts with bespoke typography pairings (Bebas Neue, Outfit, Inter, Fira Code, Merriweather).
- **Sub-Millimeter Vector PDF**: Native client-side vector rendering ensuring razor-sharp typography at any print resolution or zoom level.
- **ATS Semantic Architecture**: Validated against major parsing engines (Workday, Greenhouse, Lever) for 100% structured data extraction.
- **Local-First Privacy**: Zero tracking, zero telemetry, and zero mandatory cloud accounts. All resume state is stored encrypted in `localStorage` / IndexedDB.
- **Instant Resume Importer**: Upload existing `.pdf` or `.docx` files to automatically parse and populate fields.
- **Multi-Layout Exhibition**:
  - **Modern Architect**: Structured dual-column grid for tech and product leaders.
  - **Executive Portrait**: High-impact editorial layout with integrated profile portrait.
  - **Swiss Minimal**: Pure whitespace-driven hierarchy inspired by European modernist posters.
  - **Academic Classic**: Timeless serif design tailored for law, finance, and research.
- **Dynamic Theme Engine**: Seamless support for *Gallery White* (Light) and *Exhibit Noir* (Dark) palettes.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite + Rolldown
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Motion & 3D**: Framer Motion
- **PDF Engine**: `@react-pdf/renderer`
- **Icons**: Lucide React
- **Cloud Sync (Optional)**: Supabase Auth & Storage

---

## Getting Started

### Prerequisites

- Node.js `v18.0.0` or higher
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/omvashishth/Resumora.git
   cd Resumora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Project Structure

```
resumebuilder/
├── src/
│   ├── components/       # Reusable UI elements, modals & indicators
│   ├── pages/            # Main application views (Landing, Dashboard, Builder)
│   ├── services/         # PDF generation, import parser, auth adapters
│   ├── styles/           # Design tokens, CSS variables & typography
│   ├── templates/        # Live DOM & print-ready resume template renderers
│   ├── types/            # TypeScript data models
│   └── utils/            # Sample data generators & theme controller
├── public/               # Static assets & fonts
└── package.json
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
