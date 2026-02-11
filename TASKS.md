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
Phase 1: Foundation        [██████████] 100%
Phase 2: Adaptive AI       [██████████] 100%
Phase 3: Code Environment  [██████████] 100%
Phase 4: Gamification      [██████████] 100% ✅ COMPLETE
Phase 5: Career Integration[░░░░░░░░░░] 0%   <-- NEXT
Phase 6: Polish & Scale    [░░░░░░░░░░] 0%
──────────────────────────────────────────
Overall Progress           [███████░░░] 67%
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
- [x] Deploy to production (Vercel + @astrojs/vercel adapter) — devpath-phi.vercel.app
- [x] Wire ProfileDashboard to load real Supabase data
- [x] Wire SettingsPanel to update real Supabase data
- [x] Wire Leaderboard to real Supabase data
- [ ] Create Supabase project, run schema.sql, configure OAuth providers
- [ ] SEO meta tags and Open Graph images
- [ ] Lighthouse performance audit

---

## Phase 2: Adaptive AI Learning (Weeks 7-12)
*Goal: Personalization that roadmap.sh completely lacks*

### Week 7: Skill Assessment System
- [x] Design diagnostic quiz format (intro → questions → explanation → results)
- [x] Create question bank per roadmap topic (56 questions across 5 roadmaps)
- [x] Build quiz UI component (SkillAssessment.tsx with animations)
- [x] Scoring algorithm (per-node proficiency + confidence estimation)
- [x] Assessment pages for all 5 roadmaps (/assess/[id])
- [x] Initial skill placement on signup (auto-redirect to diagnostic)

### Week 8: User Skill Graph
- [x] Design user_skills schema (proficiency, confidence, times_tested)
- [x] Skill graph visualization (SVG radar chart + proficiency bars)
- [x] Skill status system (strong/moderate/weak/untested)
- [x] Skills pages for all 5 roadmaps (/skills/[id])
- [x] Recommended next steps based on skill gaps
- [x] Skill comparison view (current vs target role)

### Week 9: Spaced Repetition Engine
- [x] Implement SM-2 algorithm (spaced-repetition.ts)
- [x] Quality rating from answer correctness + time
- [x] Review scheduler (getDueItems, getReviewStats)
- [x] Review dashboard with session mode (ReviewDashboard.tsx)
- [x] Knowledge strength visualization (mastered/learning/struggling)
- [x] Auto-enqueue missed quiz questions for review
- [x] Push notification integration (deferred to Phase 6)

### Week 10: Adaptive Path Generation
- [x] AI-powered learning plan generation (ai-tutor-enhanced.ts)
- [x] Input: user skill graph, goals, timeline, available time
- [x] Learning plans table in database schema
- [x] Save/load active learning plans
- [x] "Skip what you know" logic in roadmap viewer
- [x] Daily/weekly learning plan UI page

### Week 11: AI Tutor Enhancement
- [x] Context injection: current topic + skill graph + user level
- [x] Context-aware system prompt builder (buildContextPrompt)
- [x] Personalized topic explanations (explainTopic)
- [x] sendContextualTutorMessage with skill awareness
- [x] Conversation persistence to Supabase (data layer ready)
- [x] Rate limiting and cost controls
- [x] Streaming responses

### Week 12: Local Embeddings & Caching
- [x] Set up Ollama with nomic-embed-text
- [x] Concept similarity search
- [x] Resource recommendation engine
- [x] Redis caching layer for AI responses

---

## Phase 3: Integrated Coding Environment (Weeks 13-18)
*Goal: Learn by doing without leaving the platform*

### Week 13-14: Editor Enhancement
- [x] Evaluate: WebContainers vs Monaco + Judge0 (chose Monaco + sandboxed execution)
- [x] Integrate Monaco Editor (replace textarea) — MonacoIDE.tsx with custom "devpath-dark" theme
- [x] Code Playground page with language selector (/playground)
- [x] Keyboard shortcuts (⌘+Enter run, ⌘+S submit, ⌘+⇧+S snapshot)
- [x] Editor settings panel (font size, tab size, word wrap, minimap)
- [x] Phase 3 database schema (code_versions, project_files, execution_logs, ai_reviews)
- [x] Multi-file support (FileExplorer.tsx — tree view, tab bar, file CRUD, 15+ extension icons)
- [x] Terminal emulation (TerminalEmulator.tsx — 20+ commands, multi-tab, history, virtual FS)

### Week 15: Multi-Language Runtime
- [x] JavaScript/TypeScript execution via sandboxed Function constructor
- [x] TypeScript type-stripping transform for browser execution
- [x] Pyodide (WASM) for Python — lazy-loaded from CDN
- [x] HTML preview mode
- [x] Language switcher UI (Playground page)
- [ ] Judge0 API integration for server-side execution (deferred to Phase 6)

### Week 16-17: Auto-Grading & AI Review
- [x] Real test runner implementation (input/expected output with normalization)
- [x] Real test cases for all 17 projects (project-tests.ts)
- [x] Claude/GPT code review integration (code-review.ts)
- [x] Structured review display (score, readability, maintainability, strengths, improvements)
- [x] Static analysis fallback (when AI unavailable)
- [x] Auto-save every 30 seconds
- [ ] Suggestion annotations in editor (inline markers) (deferred to Phase 6)
- [ ] Improvement scoring history tracking (deferred to Phase 6)

### Week 18: Version Control & Portfolio
- [x] Save checkpoints (snapshots) — version-history.ts with localStorage
- [x] Diff view component (LCS-based line diff algorithm)
- [x] Version auto-pruning (max 50 per project)
- [x] "Completed projects" portfolio view (Portfolio.tsx — gallery, grid/list, stats, code preview modal)
- [x] Public project sharing (SharedProjectView.tsx + /share/[id] — public viewer with copy/share)

---

## Phase 4: Gamification & Social (Weeks 19-24)
*Goal: Engagement loops that drive retention*

- [x] XP & leveling system (unified engine in gamification.ts)
- [x] Streak tracking with milestone bonuses (7/14/30/60/100 days)
- [x] Badge evaluation engine (30+ badges across 6 categories)
- [x] Enhanced leaderboard (weekly/monthly/all-time + XP/streak/projects/battles)
- [x] Daily challenges (DailyChallenge.tsx — timer, hints, test runner, 7 seeded challenges)
- [x] Code battles (CodeBattles.tsx — lobby, create, timed 1v1 arena, results)
- [x] Social profiles (UserProfileCard.tsx — public profile, stats, badges, XP progress)
- [x] Follow/unfollow system with notifications
- [x] Activity feed (ActivityFeed.tsx — 17 types, social/personal modes, filters)
- [x] Notification panel (NotificationPanel.tsx — 9 types, bell dropdown, 30s polling)
- [x] Phase 4 DB schema (7 new tables, profile extensions, 18 badges, RLS policies)
- [x] New pages: /challenges, /battles, /feed, /users/[username]
- [x] Header nav + landing page updates
- [x] ProfileDashboard XP formula fix (unified calculation)

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
| 2026-02-10 | Monaco + sandboxed execution | Monaco for editing, Function constructor for JS/TS, Pyodide WASM for Python |
| 2026-02-10 | client:only="react" for Monaco | Monaco Editor cannot SSR; must skip server rendering entirely |
| 2026-02-10 | localStorage for version history | Quick iteration; Supabase sync can be added later |
| 2026-02-10 | LCS-based diff over external libs | Zero dependencies, sufficient for code snapshot diffs |

| 2026-02-10 | Browser-based terminal over xterm.js | Simpler integration, no WASM dependency, 20+ shell commands sufficient for learning context |
| 2026-02-10 | Portfolio + Share pages use client:load | No Monaco dependency, safe for SSR |

--- (Post-Launch)

- [ ] Native mobile app (React Native / Expo)
- [ ] Course creation marketplace
- [ ] Live coding workshops
- [ ] Company-branded learning portals
- [ ] API for third-party integrations
- [ ] Slack/Discord integrations
- [ ] Offline mode
- [ ] Multi-language support (i18n)

---

**Last Updated**: Session 7 (Phase 4 complete)
