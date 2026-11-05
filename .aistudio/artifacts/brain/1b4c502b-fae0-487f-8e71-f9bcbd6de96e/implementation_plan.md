# Interactive Editorial & Tactile Portfolio: "Aesthete / Studio Tactile"

An editorial-grade portfolio website for an independent interaction and digital product designer. It marries the tactile charm of physical Manila folder drawer indexing (Image 1) with the understated elegance, generous whitespace, and serene typography of luxury editorial publications (Image 2).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during interactive clarification and will guide the build:

- **Portfolio Persona**: Independent Interaction & Digital Product Designer (UI/UX systems, digital prototypes, micro-interaction lab).
- **Hybrid Layout**: Top interactive skeuomorphic file-folder drawer index (layered folder tabs with physical lift & depth transitions) coupled with a minimalist magazine-grade editorial feed below.
- **Media & Motion Strategy**: Smooth vertical scroll with inertia, instant video/canvas preview on hover, and an expandable modal lightbox with interactive prototype viewports and rich case study documentation.

---

### 1. Overview & Core Concept

- **What It Does**: Showcases high-impact digital product case studies, interactive UI prototypes, and design essays. Users can switch between domains using a physical folder-tab drawer (SYSTEMS, PROTOTYPES, INTERACTION, SPATIAL, ESSAYS) that lifts and shuffles active tabs with spring physics, and read through a serene, distraction-free editorial stream.
- **Target Audience**: Design leaders, product founders, design engineering collaborators, and aesthetic connoisseurs seeking thoughtful, craft-oriented product design.
- **Key Value**: Delivers both immediate tactile delight (folder physical affordance) and effortless readability (minimalist publication layout), proving the designer's mastery of micro-interactions and digital craft.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Header & Persona Introduction**:
   - Clean top bar with wordmark (`Aesthete / Julian V.`), quiet navigation links (`Works`, `Essays`, `Index`, `Contact`), and a primary `"Connect"` action.
   - Minimalist bio section featuring an avatar with subtle frame interaction, philosophical quote, reader/project counter, and clean unboxed metadata.
2. **Tactile Folder Archive Drawer (Image 1 Influence)**:
   - Layered Manila/stone folder tabs arranged in cascading staggered rows (`SYSTEMS`, `PROTOTYPES`, `INTERACTION`, `SPATIAL`, `ESSAYS`, `ALL`).
   - Tactile embellishments: realistic tab cuts, binder clip, peeked polaroid thumbnails, and subtle shadows.
   - Clicking a tab plays a spring elevation animation, bringing the selected folder to the forefront and filtering the project catalog with zero layout jarring.
3. **Editorial Stream & Spotlight Showcase (Image 2 Influence)**:
   - **Editor's Pick Hero Feature**: Large-scale showcase with wide 16:9 media container, live preview on hover, typography-first title, and quiet narrative excerpt.
   - **Curated Multi-Column Layout**: Left column features fluid magazine cards (video prototypes with hover play and timeline indicator, multi-photo carousels), while the right column hosts curated design series (`Spatial Poetics`, `Micro-Interactions`, `Design Systems 2.0`) with item counts.
4. **Interactive Case Study Lightbox**:
   - Clicking any work tile opens an unobstructed, high-fidelity modal drawer.
   - Features video/prototype playback with custom controls, interactive mockup simulator, problem-solution breakdown, typography specimen, and live prototype interaction.

#### Visual Identity & Typography
- **Canvas Palette (60-30-10)**:
  - 60% Canvas: Warm paper white (`#FBFBF9`) and deep obsidian dark mode counterpart (`#121212`).
  - 30% Structural: Soft Manila tab tones (`#EFECE6`, `#E7E2D8`), subtle hairline borders (`#E5E3DE`), and charcoal editorial text (`#1C1917`).
  - 10% Accents: Amber paperclip steel, subtle Refy blush tone (`#E5A99B`), and focused charcoal/emerald interactive highlights.
- **Typography**:
  - Headings & Editorial Accents: Luxury editorial serif (`Playfair Display` or `Fraunces` via Google Fonts) paired with modern high-legibility geometric sans (`Plus Jakarta Sans`) for interface controls and body text.
  - Tabular Numerals: Tabular figures for dates, counters, and statistics (`font-mono tabular-nums`).
- **Micro-Interactions**:
  - Smooth hover tilt and spring elevation for folder tabs.
  - Hover scrub for video cards with subtle soundless looping indicator.
  - Fluid keyboard navigation support (`Esc` to dismiss lightbox, `←`/`→` for media browsing).

---

### 3. Key Product Decisions & Trade-Offs

- **Hybrid Skeuomorphic + Modernist Minimalist Design**:
  - *Chosen Approach*: Limit skeuomorphic visual metaphor to the folder tabs index and polaroid clips, keeping the article reading experience clean, airy, and hyper-legible.
  - *Why*: Gives the portfolio memorable personality without causing visual fatigue or slowing down project consumption.
- **Synthetic Video Preview Canvas & Web Video Handlers**:
  - *Chosen Approach*: Provide curated video loops and interactive Canvas/CSS mock player with scrubbable progress bar and pause/play controls.
  - *Why*: Ensures zero broken video links, immediate response in sandbox, and instant hover-preview responsiveness.
- **State Management & Filtering**:
  - *Chosen Approach*: React state with smooth Framer Motion (`motion/react`) layout transitions (`layoutId` for tabs and cards).
  - *Why*: Delivers 60fps GPU-accelerated micro-interactions without third-party heavy animation engines.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Top Navigation Bar                   │
│   [Aesthete / Julian V.]  ── [Works · Index · About]   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         Profile Header & Editorial Philosophy          │
│   Avatar · Bio Quote · Unboxed Metric Strip            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      Interactive Skeuomorphic Folder Drawer (Image 1)  │
│   [SYSTEMS] [PROTOTYPES] [INTERACTION] [SPATIAL] ...   │
│   Spring elevation · Clip & Polaroid peek decoration   │
└───────────────────────────┬────────────────────────────┘
                            │ (Filter State & LayoutId)
┌───────────────────────────▼────────────────────────────┐
│           Editorial Feed & Curated Series (Image 2)    │
│  ┌───────────────────────────────┐ ┌─────────────────┐ │
│  │ Editor's Pick Spotlight Card  │ │ Curated Series  │ │
│  ├───────────────────────────────┤ │ · Spatial Poetics│ │
│  │ Magazine Case Study Grid      │ │ · Micro-Interac │ │
│  │ (Image/Video Hover Scrubber)  │ │ · Design Systems│ │
│  └───────────────────────────────┘ └─────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │ (Select Project)
┌───────────────────────────▼────────────────────────────┐
│             Full-Screen Case Study Modal               │
│   Media Reel · Prototype Sandbox · Design Rationale    │
└────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **Project**: `id`, `title`, `subtitle`, `category` (Folder tag), `year`, `readTime`, `mediaType` (`video` | `image`), `mediaUrl`, `previewVideoUrl`, `quote`, `description`, `highlights`, `tags`, `featured`, `prototypeUrl`.
- **Series**: `id`, `name`, `count`, `description`.
- **ActiveCategory**: State variable driving folder tab shuffle and card layout transitions.
- **ActiveProjectModal**: Selected project state for deep reading and interactive prototype interaction.
