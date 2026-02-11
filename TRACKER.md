# DevPath - Project Tracker

## Project Status: Phase 3 In Progress (~60%)

| Metric | Value |
|--------|-------|
| **Current Phase** | Phase 3: Integrated Coding Environment |
| **Pages Built** | 46 |
| **Overall Progress** | ~43% (Phase 1 ✅, Phase 2 ✅, Phase 3 ⏳) |
| **Git Commits** | 14 |
| **Deployment** | [devpath-phi.vercel.app](https://devpath-phi.vercel.app) |
| **GitHub** | [CyberDexa/devpath](https://github.com/CyberDexa/devpath) |
| **Next Milestone** | Multi-file support, terminal emulation, portfolio |

---

## Phase 1: Foundation — ✅ COMPLETE

| Feature | Notes |
|---------|-------|
| Astro + React + Tailwind scaffold | v5.17 + 19.2 + 4.1 |
| Precision Noir design system | Colors, fonts, utilities, animations |
| Self-hosted fonts | Cabinet Grotesk + General Sans |
| Base layouts (BaseLayout, PageLayout) | HTML shell, meta, slots |
| Header with mobile nav | Hamburger, slide, backdrop, ESC close |
| Auth-aware header (React Island) | User dropdown, XP badge, avatar |
| Footer with 4-column links | Platform, Resources, Company, Social |
| 11 UI components | Button, Card, Badge, ProgressBar, Input, Textarea, Select, Modal, Skeleton, Toggle |
| 5 roadmaps with full data | Frontend, Backend, Fullstack, DevOps, AI |
| Interactive roadmap viewer | BFS layout, SVG edges, zoom/pan, keyboard nav |
| Cloud-synced roadmap progress | Supabase + localStorage fallback, debounced |
| Roadmaps explore page | Search, filter, sort |
| Auth pages (login/signup) | Wired to Supabase signUp/signIn/OAuth |
| OAuth callback page | PKCE + hash token handling |
| Profile dashboard | Real Supabase data — heatmap, badges, activity, stats |
| Settings page (6 tabs) | Wired to Supabase — Profile, Notifications, Appearance, Privacy, Editor, Account |
| 404 page (terminal-style) | Interactive terminal Easter egg |
| Pricing page (3-tier) | Freemium/Pro/Teams, comparison table, FAQ |
| AI Tutor chat UI | Real API (Claude/GPT) with template fallback |
| Leaderboard | Real Supabase data — podium, ranked table, time filters |
| Projects catalog (17 projects) | Grid/list views, search, filter, sort, detail modal |
| Code Editor component | Full IDE with run/test/AI review |
| Project submissions | Wired to Supabase with XP rewards |
| 18 project detail pages | Instructions + editor |
| Supabase integration | Client, schema (7 tables), auth, data layer |
| Enhanced landing page | Hero, features, code preview, roadmaps, comparison, how-it-works, testimonials, CTA |
| Responsive design verified | Mobile (375px), tablet, desktop tested |
| Vercel deployment | devpath-phi.vercel.app with env vars |

---

## Phase 2: Adaptive AI Learning — ✅ COMPLETE

| Feature | Notes |
|---------|-------|
| Skill Assessment Quiz System | 56 questions across 5 roadmaps, diagnostic + review modes |
| Quiz UI (SkillAssessment.tsx) | Animated intro → quiz → results, per-node scoring, timer |
| Assessment pages | /assess/[id] for all 5 roadmaps |
| Spaced Repetition Engine | SM-2 algorithm (quality 0-5, easiness factor, intervals) |
| Review Dashboard | Dashboard + session mode, strength bars, schedule, stats |
| Review page | /review with full spaced repetition UI |
| Skill Graph Visualization | SVG radar chart, proficiency bars, recommended next steps |
| Skills pages | /skills/[id] for all 5 roadmaps |
| Enhanced AI Tutor | Context injection (skill graph + topic + level), learning plans |
| Database schema extension | 5 new tables (quiz_questions, quiz_attempts, user_skills, review_items, learning_plans) |
| Navigation update | "Review" link in header, "Assess Skills" CTAs on roadmap pages |

---

## Phase 3: Integrated Coding Environment — ⏳ IN PROGRESS (~60%)

| Feature | Status | Notes |
|---------|--------|-------|
| Monaco Editor integration | ✅ | MonacoIDE.tsx with custom "devpath-dark" theme |
| Code Playground page | ✅ | /playground — JS, TS, Python, HTML |
| JS/TS execution engine | ✅ | Sandboxed Function constructor, mock console |
| TypeScript type-stripping | ✅ | Regex-based transform for browser execution |
| Python execution (Pyodide) | ✅ | WASM via CDN, lazy-loaded |
| HTML preview mode | ✅ | Returns preview message |
| Real test runner | ✅ | Input/expected output with normalization |
| Test cases for all 17 projects | ✅ | project-tests.ts — 70+ test cases total |
| AI code review service | ✅ | Claude/GPT + static analysis fallback |
| Structured review display | ✅ | Score, readability, maintainability, code smells |
| Version history (snapshots) | ✅ | LCS diff, localStorage, max 50 per project |
| Diff view component | ✅ | Line-by-line added/removed/unchanged |
| Auto-save (30s interval) | ✅ | With version pruning |
| Keyboard shortcuts | ✅ | ⌘+Enter run, ⌘+S submit, ⌘+⇧+S snapshot |
| Editor settings panel | ✅ | Font size, tab size, word wrap, minimap |
| Phase 3 DB schema | ✅ | 4 tables: code_versions, project_files, execution_logs, ai_reviews |
| Landing page updates | ✅ | Playground CTA, updated comparison table |
| Multi-file support | ⬜ | File tree UI + tab system |
| Terminal emulation | ⬜ | xterm.js integration |
| Portfolio view | ⬜ | Completed projects gallery |
| Public project sharing | ⬜ | Shareable links |

---

## Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Pages** | 60+ | 46 |
| **Roadmaps** | 5 | 5 |
| **Projects** | 17+ | 17 |
| **Quiz Questions** | 100+ | 56 |
| **DB Tables** | 15+ | 16 |
| **Build Errors** | 0 | 0 |
| **Lighthouse Score** | 95+ | TBD |

---

## Quick Commands

```bash
# Start development
cd ~/Projects/devpath
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Database setup
# 1. Run supabase/schema.sql in SQL Editor
# 2. Run supabase/phase2-schema.sql in SQL Editor
# 3. Run supabase/phase3-schema.sql in SQL Editor
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5.17 (SSG + Islands) |
| UI | React 19.2 |
| Styling | Tailwind CSS 4.1 |
| Animation | Framer Motion 12.34 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | Anthropic Claude / OpenAI GPT (hybrid) |
| Algorithms | SM-2 Spaced Repetition |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Code Execution | Sandboxed JS/TS + Pyodide WASM (Python) |
| Deployment | Vercel (static) |

---

## Git History

| # | Message | Branch |
|---|---------|--------|
| 1 | feat: initial Astro scaffold + design system | main |
| 2 | feat: interactive roadmap viewer + all pages | main |
| 3 | feat: settings, 404, mobile nav, explore view | main |
| 4 | feat: pricing page, AI tutor chat, leaderboard | main |
| 5 | feat: projects catalog + code editor | main |
| 6 | feat: Supabase integration | main |
| 7 | feat: enhanced landing page | main |
| 8 | feat: enhanced landing page with code preview | main |
| 9 | feat: wire auth, roadmap progress, project submissions | main |
| 10 | feat: AI tutor real API integration | main |
| 11 | docs: update TASKS.md and TRACKER.md | main |
| 12 | feat: wire all components to Supabase + deploy to Vercel | main |
| 13 | feat: Phase 2 adaptive AI learning | phase-2-adaptive-ai |
| 14 | docs: update TRACKER.md and TASKS.md - Phase 2 complete | phase-2-adaptive-ai |
| 15 | feat: Phase 3 - Monaco IDE, real execution, AI review, version history, playground | phase-3-coding-environment |

---

## Architecture Notes

- **Supabase client** uses lazy Proxy pattern to avoid SSG build errors (no env vars at build time)
- **React islands** use `client:load` directive (NOT manual createRoot — causes Vite preamble errors)
- **Monaco components** must use `client:only="react"` (NOT `client:load`) — Monaco cannot be server-rendered
- **Code execution** is sandboxed: JS/TS via `new Function()` with mock console, Python via Pyodide WASM from CDN
- **Version history** uses localStorage with max 50 snapshots per project (auto-prunes old auto-saves first)
- **useRoadmapProgress hook** detects auth state: Supabase when logged in, localStorage fallback when not
- **AI Tutor** tries Anthropic first, falls back to OpenAI, then to smart templates
- **SM-2 Algorithm**: quality 0-5, easiness factor ≥1.3, interval scheduling in days
- **XP formula**: level = floor(sqrt(xp/100)) + 1

---

## Upcoming Phases

| Phase | Focus | Timeline |
|-------|-------|----------|
| **Phase 3** | **Integrated Coding Environment** | **Weeks 13-18 ← IN PROGRESS (~60%)** |
| Phase 4 | Gamification & Social | Weeks 19-24 |
| Phase 5 | Career Integration | Weeks 25-30 |
| Phase 6 | Scale & Polish | Weeks 31-36 |

---

_Last updated: Session 4 (Phase 3 in progress)_
