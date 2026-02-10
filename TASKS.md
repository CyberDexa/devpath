# DevPath - Project Tasks

> **AI-Powered Developer Career Platform**
> An enhanced roadmap.sh competitor featuring adaptive AI learning paths, integrated browser IDE, gamification mechanics, and career integration.

---

## Project Overview

| Item | Details |
|------|---------|
| **Start Date** | February 10, 2026 |
| **Target Launch** | August 2026 (6+ months) |
| **Developer** | Solo |
| **Stack** | Astro + React Islands + Supabase + Hybrid AI |
| **Monetization** | Freemium (Free/Pro/Teams) |

---

## Progress Dashboard

```
Phase 1: Foundation        [█████████░] 95%  <-- CURRENT
Phase 2: Adaptive AI       [░░░░░░░░░░] 0%
Phase 3: Code Environment  [░░░░░░░░░░] 0%
Phase 4: Gamification      [░░░░░░░░░░] 0%
Phase 5: Career Integration[░░░░░░░░░░] 0%
Phase 6: Polish & Scale    [░░░░░░░░░░] 0%
──────────────────────────────────────────
Overall Progress           [██░░░░░░░░] 16%
```

---

## Phase 1: Foundation (Weeks 1-6)
*Goal: Core platform rivaling roadmap.sh with better UX*

### Week 1: Project Setup
- [x] Initialize Astro project with TypeScript
- [x] Configure Tailwind CSS with custom theme
- [x] Set up React integration for islands
- [ ] Create Supabase project (auth, database)
- [ ] Configure deployment pipeline (Vercel)
- [x] Set up Git repository and branching strategy

### Week 2: Design System
- [x] Define color palette (dark-first theme) - "Precision Noir"
- [x] Select typography (Cabinet Grotesk + General Sans, self-hosted)
- [x] Create base component library:
  - [x] Button variants (primary, secondary, ghost, destructive, outline)
  - [x] Card components (with hover, glow effects)
  - [x] Form inputs (Input, Textarea, Select)
  - [x] Modal/Dialog component
  - [x] Navigation components (Header + Footer)
  - [x] Badge, ProgressBar, Toggle, Skeleton
- [x] Design responsive breakpoints
- [x] Create loading/skeleton states

### Week 3: Roadmap Data Model
- [x] Design JSON schema for curriculum structure
  - [x] Nodes (topics/skills)
  - [x] Edges (prerequisites/relationships)
  - [x] Resources (links, videos, articles)
  - [x] Metadata (difficulty, time estimate)
- [x] Create database schema (supabase/schema.sql - 7 tables)
- [x] Seed 5 roadmaps (Frontend, Backend, Fullstack, DevOps, AI)

### Week 4: Interactive Roadmap Viewer
- [x] Build React island: RoadmapViewer.tsx
- [x] BFS layout algorithm for node positioning
- [x] SVG edge rendering with curves
- [x] Zoom/pan controls
- [x] Node click -> expand panel with resources
- [x] Node state visualization (not started/learning/completed)
- [x] Responsive layout (desktop, tablet, mobile)
- [x] Keyboard navigation support

### Week 5: Authentication & User Profiles
- [x] Supabase Auth integration
  - [x] Email/password signup (with profile creation)
  - [x] GitHub OAuth
  - [x] Google OAuth
  - [x] Auth callback page (PKCE + hash tokens)
- [x] User profile page design (ProfileDashboard)
- [x] Settings page (6 tabs: Profile, Notifications, Appearance, Privacy, Editor, Account)
- [x] Auth-aware header (React island with user dropdown)
- [x] AuthProvider context + useAuth hook

### Week 6: Progress Tracking
- [x] Progress state machine per node (not-started/learning/completed)
- [x] Database schema for user progress (roadmap_progress table)
- [x] useRoadmapProgress hook (Supabase + localStorage fallback)
- [x] Debounced cloud sync with activity logging
- [x] Progress visualization on roadmap (color-coded nodes)
- [x] Cloud sync indicator (Synced / Local only)

### Additional Phase 1 Work Completed
- [x] Enhanced landing page (hero, features grid, code preview, roadmaps, comparison table, how-it-works, testimonials, CTA)
- [x] Pricing page (3-tier: Free/Pro/Teams, feature comparison, FAQ)
- [x] AI Tutor chat UI with real API (Anthropic Claude/OpenAI GPT + template fallback)
- [x] Leaderboard page (podium, ranked table, time filters, category tabs)
- [x] Projects catalog (17 projects across 6 categories, grid/list views, search/filter/sort)
- [x] Code Editor component (full IDE with line numbers, run/test/AI review tabs, settings, fullscreen)
- [x] ProjectEditor wrapper (Supabase submissions + XP awards + activity logging)
- [x] 18 project detail pages with instructions + editor
- [x] 404 page with interactive terminal Easter egg
- [x] Roadmaps explore page with search/filter/sort
- [x] Full Supabase data access layer (CRUD, XP system, badges, activity logging)
- [x] Database types (full TypeScript Database interface for 7 tables)
- [x] Responsive mobile testing passed (375px, 768px, 1280px)

### Milestone 1 Remaining
- [ ] Deploy to production (Vercel + @astrojs/vercel adapter)
- [ ] Create Supabase project, run schema.sql, configure OAuth providers
- [ ] Wire ProfileDashboard to load real Supabase data (currently mock)
- [ ] Wire SettingsPanel to update real Supabase data (currently mock)
- [ ] Wire Leaderboard to real Supabase data (currently mock)
- [ ] SEO meta tags and Open Graph images
- [ ] Lighthouse performance audit

---

## Phase 2: Adaptive AI Learning (Weeks 7-12)
*Goal: Personalization that roadmap.sh completely lacks*

### Week 7: Skill Assessment System
- [ ] Design diagnostic quiz format
- [ ] Create question bank per roadmap topic
- [ ] Build quiz UI component
- [ ] Scoring algorithm (proficiency estimation)
- [ ] Initial skill placement on signup

### Week 8: User Skill Graph
- [ ] Design user_skills schema
- [ ] Skill graph visualization (D3.js/Vis.js)
- [ ] Skill comparison view (current vs target role)

### Week 9: Spaced Repetition Engine
- [ ] Implement SM-2 algorithm variant
- [ ] Create review scheduler
- [ ] Design micro-quiz format
- [ ] Push notification integration
- [ ] Review queue dashboard

### Week 10: Adaptive Path Generation
- [ ] Train/prompt Claude for path generation
- [ ] Input: user skill graph, goals, timeline
- [ ] Output: personalized node ordering
- [ ] "Skip what you know" logic
- [ ] Daily/weekly learning plan generation

### Week 11: AI Tutor Enhancement
- [ ] Context injection: current topic + skill graph
- [ ] Conversation persistence to Supabase
- [ ] Rate limiting and cost controls
- [ ] Streaming responses

### Week 12: Local Embeddings & Caching
- [ ] Set up Ollama with nomic-embed-text
- [ ] Concept similarity search
- [ ] Resource recommendation engine
- [ ] Redis caching layer for AI responses

---

## Phase 3: Integrated Coding Environment (Weeks 13-18)
*Goal: Learn by doing without leaving the platform*

### Week 13-14: Editor Enhancement
- [ ] Evaluate: WebContainers vs Monaco + Judge0
- [ ] Integrate Monaco Editor (replace textarea)
- [ ] Multi-file support
- [ ] Terminal emulation

### Week 15: Multi-Language Runtime
- [ ] Pyodide (WASM) for Python
- [ ] Judge0 API integration for other languages
- [ ] Language switcher UI

### Week 16-17: Auto-Grading & AI Review
- [ ] Real test runner implementation
- [ ] Claude code review integration
- [ ] Suggestion annotations in editor
- [ ] Improvement scoring

### Week 18: Version Control & Portfolio
- [ ] Save checkpoints (snapshots)
- [ ] Diff view component
- [ ] "Completed projects" portfolio view
- [ ] Public project sharing

---

## Phase 4: Gamification & Social (Weeks 19-24)
*Goal: Engagement loops that drive retention*

- [ ] XP & leveling system (rules engine)
- [ ] Streaks & achievements (30+ badges)
- [ ] Leaderboards (real-time ranking calculation)
- [ ] Daily challenges (AI-generated)
- [ ] Code battles (timed 1v1)
- [ ] Social profiles, follows, activity feed
- [ ] Mentor badge & directory

---

## Phase 5: Career Integration (Weeks 25-30)
*Goal: Connect learning to real outcomes*

- [ ] Skill verification (proctored challenges)
- [ ] Digital credentials (PDF certificates)
- [ ] Portfolio generator (subdomain: user.devpath.io)
- [ ] Resume builder (AI-powered)
- [ ] Job board integration (Indeed, LinkedIn, Adzuna)
- [ ] AI mock interviews

---

## Phase 6: Polish & Scale (Weeks 31-36)
*Goal: Production hardening, monetization, growth*

- [ ] PWA manifest and service worker
- [ ] Core Web Vitals optimization
- [ ] Stripe integration (subscription billing)
- [ ] Analytics dashboard (user + admin)
- [ ] Notification system (email + push)
- [ ] Community moderation tools
- [ ] Launch prep (SEO, structured data, campaigns)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-10 | Use Astro + Islands over Next.js | SEO-friendly SSG, matches roadmap.sh architecture |
| 2026-02-10 | Supabase for backend | Solo dev needs speed; auth+DB+realtime out of box |
| 2026-02-10 | Hybrid AI (Claude API + local) | Balance quality with cost |
| 2026-02-10 | Freemium model | Maximizes reach, proven for dev tools |
| 2026-02-10 | Lazy Proxy for Supabase client | Avoids SSG build errors when env vars missing |
| 2026-02-10 | client:load over createRoot | Manual createRoot causes Vite preamble errors |

---

## Backlog (Post-Launch)

- [ ] Native mobile app (React Native / Expo)
- [ ] Course creation marketplace
- [ ] Live coding workshops
- [ ] Company-branded learning portals
- [ ] API for third-party integrations
- [ ] Slack/Discord integrations
- [ ] Offline mode
- [ ] Multi-language support (i18n)

---

**Last Updated**: Session 2
