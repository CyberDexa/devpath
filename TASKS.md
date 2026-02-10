# DevPath — Project Tracker

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
Phase 1: Foundation        [████░░░░░░] 40%  ⬅️ CURRENT
Phase 2: Adaptive AI       [░░░░░░░░░░] 0%
Phase 3: Code Environment  [░░░░░░░░░░] 0%
Phase 4: Gamification      [░░░░░░░░░░] 0%
Phase 5: Career Integration[░░░░░░░░░░] 0%
Phase 6: Polish & Scale    [░░░░░░░░░░] 0%
─────────────────────────────────────────
Overall Progress           [█░░░░░░░░░] 7%
```

---

## Phase 1: Foundation (Weeks 1–6)
*Goal: Core platform rivaling roadmap.sh with better UX*

### Week 1: Project Setup
- [x] Initialize Astro project with TypeScript
- [x] Configure Tailwind CSS with custom theme
- [x] Set up React integration for islands
- [ ] Create Supabase project (auth, database)
- [ ] Configure deployment pipeline (Vercel/Cloudflare)
- [x] Set up Git repository and branching strategy

### Week 2: Design System
- [x] Define color palette (dark-first theme) — "Precision Noir"
- [x] Select typography (distinctive fonts, not Inter/Roboto) — Cabinet Grotesk + General Sans
- [ ] Create base component library:
  - [x] Button variants
  - [x] Card components
  - [ ] Form inputs
  - [ ] Modal/Dialog
  - [x] Navigation components (Header + Footer)
- [x] Design responsive breakpoints
- [ ] Create loading/skeleton states

### Week 3: Roadmap Data Model
- [x] Design JSON schema for curriculum structure
  - [x] Nodes (topics/skills)
  - [x] Edges (prerequisites/relationships)
  - [x] Resources (links, videos, articles)
  - [x] Metadata (difficulty, time estimate)
- [ ] Create database tables in Supabase
- [ ] Build content ingestion pipeline
- [x] Seed first roadmap (Frontend Developer)

### Week 4: Interactive Roadmap Viewer
- [x] Build React island: Roadmap Canvas (RoadmapViewer.tsx)
- [ ] Implement zoom/pan controls
- [x] Node click → expand panel with resources
- [x] Node state visualization (not started/learning/completed)
- [ ] Responsive layout (desktop, tablet, mobile)
- [ ] Keyboard navigation support

### Week 5: Authentication & User Profiles
- [ ] Supabase Auth integration
  - [ ] Email/password signup
  - [ ] GitHub OAuth
  - [ ] Google OAuth
- [ ] User profile page design
- [ ] Settings page (preferences, notifications)
- [ ] Protected routes middleware

### Week 6: Progress Tracking
- [ ] Progress state machine per node
- [ ] Database schema for user progress
- [ ] Real-time progress sync (Supabase Realtime)
- [ ] Progress visualization on roadmap
- [ ] Profile progress summary cards
- [x] Seed 4 additional roadmaps (Backend, Full Stack, DevOps, AI Engineer)

### Milestone 1 Checklist
- [ ] ✅ Deployed to production domain
- [ ] ✅ 5+ interactive roadmaps live
- [ ] ✅ User authentication working
- [ ] ✅ Progress persistence functional
- [ ] ✅ 100+ beta signups

---

## Phase 2: Adaptive AI Learning (Weeks 7–12)
*Goal: Personalization that roadmap.sh completely lacks*

### Week 7: Skill Assessment System
- [ ] Design diagnostic quiz format
- [ ] Create question bank per roadmap topic
- [ ] Build quiz UI component
- [ ] Scoring algorithm (proficiency estimation)
- [ ] Initial skill placement on signup

### Week 8: User Skill Graph
- [ ] Design `user_skills` schema
  - [ ] Skill ID, proficiency (0-100)
  - [ ] Confidence interval
  - [ ] Last assessed timestamp
  - [ ] Decay rate
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
- [ ] Learning velocity adjustment
- [ ] Daily/weekly learning plan generation

### Week 11: AI Tutor Enhancement
- [ ] Claude API integration
- [ ] Context injection: current topic + skill graph
- [ ] Conversation persistence
- [ ] Rate limiting and cost controls
- [ ] Tutor UI (chat interface island)

### Week 12: Local Embeddings & Caching
- [ ] Set up Ollama with nomic-embed-text
- [ ] Concept similarity search
- [ ] Resource recommendation engine
- [ ] Redis caching layer for AI responses
- [ ] A/B test: adaptive vs static paths

### Milestone 2 Checklist
- [ ] ✅ Skill assessment on every signup
- [ ] ✅ Personalized paths being generated
- [ ] ✅ Spaced repetition pushing reviews
- [ ] ✅ AI Tutor responding contextually
- [ ] ✅ Measured improvement in quiz scores (adaptive users)

---

## Phase 3: Integrated Coding Environment (Weeks 13–18)
*Goal: Learn by doing without leaving the platform*

### Week 13: Editor Foundation
- [ ] Evaluate: WebContainers vs Monaco + Judge0
- [ ] Integrate Monaco Editor (React island)
- [ ] Multi-file support
- [ ] Syntax highlighting (all target languages)
- [ ] Editor themes matching design system

### Week 14: JavaScript/TypeScript Runtime
- [ ] WebContainers integration OR iframe sandbox
- [ ] Console output capture
- [ ] Error display with line highlighting
- [ ] Auto-save to localStorage
- [ ] Terminal emulation (optional)

### Week 15: Python & Other Languages
- [ ] Pyodide (WASM) for Python
- [ ] Judge0 API integration for other languages
- [ ] Language switcher UI
- [ ] Output format standardization

### Week 16: Project Templates
- [ ] Template schema design
- [ ] Starter code per project
- [ ] Test file format (assertions)
- [ ] Expected output definitions
- [ ] Template gallery UI

### Week 17: Auto-Grading & AI Review
- [ ] Test runner implementation
- [ ] Pass/fail status display
- [ ] Claude code review integration
- [ ] Suggestion annotations in editor
- [ ] Improvement scoring

### Week 18: Version Control & Portfolio
- [ ] Save checkpoints (snapshots)
- [ ] Diff view component
- [ ] Rollback functionality
- [ ] "Completed projects" portfolio view
- [ ] Public project sharing

### Milestone 3 Checklist
- [ ] ✅ Code editor working for JS/TS/Python
- [ ] ✅ At least 20 project templates seeded
- [ ] ✅ Auto-grading functional
- [ ] ✅ AI code review providing feedback
- [ ] ✅ >50% of users complete at least one project

---

## Phase 4: Gamification & Social (Weeks 19–24)
*Goal: Engagement loops that drive retention*

### Week 19: XP & Leveling System
- [ ] XP award rules:
  - [ ] Node completion: +10-50 XP (by difficulty)
  - [ ] Quiz passed: +25 XP
  - [ ] Project completed: +100-500 XP
  - [ ] Streak bonus: +multiplier
- [ ] Level thresholds (Novice → Legend)
- [ ] Level badge icons
- [ ] XP transaction history

### Week 20: Streaks & Achievements
- [ ] Daily/weekly streak tracking
- [ ] Streak shield (premium feature)
- [ ] Achievement catalog design:
  - [ ] First Node Completed
  - [ ] 7-Day Streak
  - [ ] First Project Submitted
  - [ ] 100 Nodes Mastered
  - [ ] Mentor Session Completed
  - [ ] (30+ achievements)
- [ ] Achievement unlock notifications
- [ ] Achievement showcase on profile

### Week 21: Leaderboards
- [ ] Database schema for rankings
- [ ] Weekly/monthly/all-time boards
- [ ] Per-roadmap leaderboards
- [ ] Global leaderboard
- [ ] Ranking calculation job (cron)
- [ ] Leaderboard UI with pagination

### Week 22: Daily Challenges
- [ ] Challenge generator (AI-assisted)
- [ ] Challenge types:
  - [ ] Micro-quiz
  - [ ] Code snippet fix
  - [ ] Timed coding challenge
- [ ] Challenge calendar view
- [ ] Bonus XP for completion

### Week 23: Multiplayer Features
- [ ] Code battles (timed 1v1)
- [ ] WebRTC integration (pair programming)
- [ ] Shared editor state (CRDT/Yjs)
- [ ] Team challenges (async)
- [ ] Matchmaking system

### Week 24: Social Profiles
- [ ] Follow/follower system
- [ ] Activity feed
- [ ] Skill endorsements
- [ ] Mentor badge & mentor directory
- [ ] Mentorship request system

### Milestone 4 Checklist
- [ ] ✅ XP and levels visible on all profiles
- [ ] ✅ Streak tracking working
- [ ] ✅ Leaderboards populated and updating
- [ ] ✅ Daily challenges generating
- [ ] ✅ Week-2 retention >40%

---

## Phase 5: Career Integration (Weeks 25–30)
*Goal: Connect learning to real outcomes*

### Week 25: Skill Verification
- [ ] Proctored challenge mode
- [ ] Verification badge design
- [ ] Anti-cheat measures
- [ ] Badge display on profile
- [ ] Badge verification URL (public)

### Week 26: Digital Credentials
- [ ] Certificate generator (PDF + image)
- [ ] Unique verification codes
- [ ] LinkedIn share integration
- [ ] Certificate gallery page
- [ ] Employer verification portal

### Week 27: Portfolio Generator
- [ ] Auto-extract completed projects
- [ ] Portfolio template selection
- [ ] Custom subdomain (username.devpath.io)
- [ ] Portfolio customization options
- [ ] SEO optimization for portfolios

### Week 28: Resume Builder
- [ ] Skill keyword extraction
- [ ] Project description generation (AI)
- [ ] Resume template selection
- [ ] PDF/DOCX export
- [ ] ATS-friendly formatting

### Week 29: Job Board Integration
- [ ] API integration: Indeed, LinkedIn, Adzuna
- [ ] Job ↔ skill matching algorithm
- [ ] "Skills needed" overlay on job cards
- [ ] Job recommendations based on skill graph
- [ ] Application tracking (kanban board)

### Week 30: Interview Prep & Career Simulator
- [ ] AI mock interview system
- [ ] Interview feedback and scoring
- [ ] "What if I learned X?" projections
- [ ] Employer dashboard (B2B beta)
- [ ] Company skill gap analysis

### Milestone 5 Checklist
- [ ] ✅ Verified badges being issued
- [ ] ✅ Portfolios publicly accessible
- [ ] ✅ Jobs appearing with skill match scores
- [ ] ✅ Resume builder functional
- [ ] ✅ First job placement attributed to platform

---

## Phase 6: Polish & Scale (Weeks 31–36)
*Goal: Production hardening, monetization, growth*

### Week 31: Mobile & Performance
- [ ] Mobile responsiveness audit
- [ ] PWA manifest and service worker
- [ ] Core Web Vitals optimization
- [ ] Bundle splitting and lazy loading
- [ ] Edge caching configuration
- [ ] Image optimization pipeline

### Week 32: Monetization
- [ ] Stripe integration
- [ ] Subscription tiers:
  - [ ] **Free**: 3 roadmaps, limited AI, basic progress
  - [ ] **Pro ($12/mo)**: All roadmaps, unlimited AI, spaced repetition, analytics
  - [ ] **Teams ($29/seat)**: Admin dashboard, skill gap analysis, team insights
- [ ] Upgrade/downgrade flows
- [ ] Invoice and billing portal
- [ ] Trial period implementation

### Week 33: Analytics Dashboard
- [ ] User analytics views:
  - [ ] Learning velocity
  - [ ] Time spent per topic
  - [ ] Skill growth over time
  - [ ] Weak spots identification
- [ ] Admin analytics (business metrics)
- [ ] Event tracking (Plausible/PostHog)

### Week 34: Notifications & Engagement
- [ ] Email notification system
- [ ] Push notifications (web)
- [ ] Notification preferences
- [ ] Spaced repetition reminders
- [ ] Streak warning emails
- [ ] Weekly progress digest

### Week 35: Community & Moderation
- [ ] Report/flag system
- [ ] Moderation queue
- [ ] Community guidelines
- [ ] Ban/suspend functionality
- [ ] Content review workflow

### Week 36: Launch Prep
- [ ] SEO audit and optimization
- [ ] Structured data (JSON-LD)
- [ ] Landing page A/B testing
- [ ] Conversion tracking setup
- [ ] Launch announcement campaign
- [ ] Documentation and help center

### Milestone 6 Checklist
- [ ] ✅ Mobile experience polished
- [ ] ✅ Stripe payments working
- [ ] ✅ First paying customers
- [ ] ✅ NPS score >50
- [ ] ✅ Load tested for 10K concurrent users

---

## Backlog (Post-Launch)

### Features for v2
- [ ] Native mobile app (React Native / Expo)
- [ ] Course creation marketplace
- [ ] Live coding workshops
- [ ] Company-branded learning portals
- [ ] API for third-party integrations
- [ ] Slack/Discord integrations
- [ ] Offline mode (downloaded content)
- [ ] Multi-language support (i18n)

### Technical Debt
- [ ] Comprehensive test coverage (>80%)
- [ ] E2E test suite (Playwright)
- [ ] CI/CD pipeline optimization
- [ ] Database indexing audit
- [ ] Security penetration testing
- [ ] GDPR/privacy compliance audit

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-10 | Use Astro + Islands over Next.js | SEO-friendly SSG, matches roadmap.sh architecture |
| 2026-02-10 | Supabase for backend | Solo dev needs speed; auth+DB+realtime out of box |
| 2026-02-10 | Hybrid AI (Claude API + local embeddings) | Balance quality with cost |
| 2026-02-10 | Freemium model | Maximizes reach, proven for dev tools |

---

## Resources

- [Astro Docs](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [WebContainers](https://webcontainers.io/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

---

## Notes

_Use this section for meeting notes, ideas, and observations._

- 

---

**Last Updated**: February 10, 2026
