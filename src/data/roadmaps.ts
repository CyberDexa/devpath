import type { RoadmapData, RoadmapNode, RoadmapEdge } from "./types";

// ═══════════════════════════════════════
// Frontend Developer Roadmap
// ═══════════════════════════════════════
export const frontendRoadmap: RoadmapData = {
  id: "frontend",
  title: "Frontend Developer",
  description:
    "Step by step guide to becoming a modern frontend developer in 2026",
  icon: "🎨",
  category: "role",
  difficulty: "beginner-to-advanced",
  estimatedHours: 800,
  totalNodes: 0, // computed below
  nodes: [],
  edges: [],
};

// ── Node Definitions ──
const frontendNodes: RoadmapNode[] = [
  // === Internet & Foundations ===
  {
    id: "internet",
    label: "Internet",
    description: "How does the internet work?",
    category: "foundation",
    difficulty: "beginner",
    estimatedMinutes: 120,
    position: { x: 400, y: 0 },
    resources: [
      {
        title: "How Does the Internet Work?",
        url: "https://cs.fyi/guide/how-does-the-internet-work",
        type: "article",
      },
      {
        title: "The Internet Explained",
        url: "https://www.vox.com/2014/6/16/18076282/the-internet",
        type: "article",
      },
    ],
  },
  {
    id: "html",
    label: "HTML",
    description: "Learn the basics of HTML — the building blocks of the web",
    category: "foundation",
    difficulty: "beginner",
    estimatedMinutes: 480,
    position: { x: 200, y: 120 },
    resources: [
      {
        title: "HTML Full Course",
        url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
        type: "video",
      },
      {
        title: "MDN HTML Guide",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        type: "article",
      },
    ],
  },
  {
    id: "css",
    label: "CSS",
    description: "Learn CSS to style your HTML pages",
    category: "foundation",
    difficulty: "beginner",
    estimatedMinutes: 720,
    position: { x: 400, y: 120 },
    resources: [
      {
        title: "CSS Full Course",
        url: "https://www.youtube.com/watch?v=OXGznpKZ_sA",
        type: "video",
      },
      {
        title: "MDN CSS Guide",
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
        type: "article",
      },
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    description:
      "Learn JavaScript — the programming language of the web",
    category: "foundation",
    difficulty: "beginner",
    estimatedMinutes: 1200,
    position: { x: 600, y: 120 },
    resources: [
      {
        title: "JavaScript.info",
        url: "https://javascript.info",
        type: "article",
      },
      {
        title: "Eloquent JavaScript",
        url: "https://eloquentjavascript.net",
        type: "article",
      },
    ],
  },

  // === Version Control ===
  {
    id: "git",
    label: "Git & GitHub",
    description: "Version control with Git and collaboration with GitHub",
    category: "tooling",
    difficulty: "beginner",
    estimatedMinutes: 360,
    position: { x: 400, y: 240 },
    resources: [
      {
        title: "Git Handbook",
        url: "https://guides.github.com/introduction/git-handbook/",
        type: "article",
      },
    ],
  },

  // === Package Managers ===
  {
    id: "package-managers",
    label: "Package Managers",
    description: "npm, yarn, pnpm — manage project dependencies",
    category: "tooling",
    difficulty: "beginner",
    estimatedMinutes: 120,
    position: { x: 200, y: 360 },
    resources: [
      {
        title: "npm Documentation",
        url: "https://docs.npmjs.com",
        type: "article",
      },
    ],
  },

  // === CSS Architecture ===
  {
    id: "css-frameworks",
    label: "CSS Frameworks",
    description: "Tailwind CSS, Bootstrap, and other utility-first frameworks",
    category: "styling",
    difficulty: "intermediate",
    estimatedMinutes: 480,
    position: { x: 200, y: 480 },
    resources: [
      {
        title: "Tailwind CSS Docs",
        url: "https://tailwindcss.com/docs",
        type: "article",
      },
    ],
  },

  // === JavaScript Framework ===
  {
    id: "react",
    label: "React",
    description:
      "Learn React — the most popular UI library for building frontend apps",
    category: "framework",
    difficulty: "intermediate",
    estimatedMinutes: 1440,
    position: { x: 400, y: 480 },
    resources: [
      {
        title: "React Official Tutorial",
        url: "https://react.dev/learn",
        type: "article",
      },
      {
        title: "Full React Course",
        url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        type: "video",
      },
    ],
  },

  // === TypeScript ===
  {
    id: "typescript",
    label: "TypeScript",
    description: "Add type safety to your JavaScript code",
    category: "language",
    difficulty: "intermediate",
    estimatedMinutes: 720,
    position: { x: 600, y: 480 },
    resources: [
      {
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/",
        type: "article",
      },
    ],
  },

  // === Testing ===
  {
    id: "testing",
    label: "Testing",
    description:
      "Unit testing, integration testing, and end-to-end testing",
    category: "quality",
    difficulty: "intermediate",
    estimatedMinutes: 600,
    position: { x: 200, y: 600 },
    resources: [
      {
        title: "Vitest Documentation",
        url: "https://vitest.dev",
        type: "article",
      },
      {
        title: "Playwright Documentation",
        url: "https://playwright.dev",
        type: "article",
      },
    ],
  },

  // === Build Tools ===
  {
    id: "build-tools",
    label: "Build Tools",
    description: "Vite, esbuild, Webpack — bundle and optimize your code",
    category: "tooling",
    difficulty: "intermediate",
    estimatedMinutes: 360,
    position: { x: 400, y: 600 },
    resources: [
      {
        title: "Vite Documentation",
        url: "https://vitejs.dev",
        type: "article",
      },
    ],
  },

  // === SSR / Meta-Frameworks ===
  {
    id: "nextjs",
    label: "Next.js",
    description:
      "Full-stack React framework with SSR, SSG, and API routes",
    category: "framework",
    difficulty: "advanced",
    estimatedMinutes: 960,
    position: { x: 400, y: 720 },
    resources: [
      {
        title: "Next.js Documentation",
        url: "https://nextjs.org/docs",
        type: "article",
      },
    ],
  },

  // === PWA & Performance ===
  {
    id: "performance",
    label: "Web Performance",
    description:
      "Core Web Vitals, lazy loading, code splitting, caching strategies",
    category: "quality",
    difficulty: "advanced",
    estimatedMinutes: 480,
    position: { x: 200, y: 720 },
    resources: [
      {
        title: "web.dev Performance",
        url: "https://web.dev/performance/",
        type: "article",
      },
    ],
  },

  // === Security ===
  {
    id: "web-security",
    label: "Web Security",
    description: "CORS, HTTPS, CSP, OWASP — secure your frontend",
    category: "quality",
    difficulty: "advanced",
    estimatedMinutes: 360,
    position: { x: 600, y: 720 },
    resources: [
      {
        title: "OWASP Top 10",
        url: "https://owasp.org/www-project-top-ten/",
        type: "article",
      },
    ],
  },
];

// ── Edge Definitions ──
const frontendEdges: RoadmapEdge[] = [
  { from: "internet", to: "html" },
  { from: "internet", to: "css" },
  { from: "internet", to: "javascript" },
  { from: "html", to: "git" },
  { from: "css", to: "git" },
  { from: "javascript", to: "git" },
  { from: "git", to: "package-managers" },
  { from: "git", to: "react" },
  { from: "css", to: "css-frameworks" },
  { from: "package-managers", to: "css-frameworks" },
  { from: "javascript", to: "react" },
  { from: "javascript", to: "typescript" },
  { from: "react", to: "testing" },
  { from: "react", to: "build-tools" },
  { from: "typescript", to: "build-tools" },
  { from: "react", to: "nextjs" },
  { from: "build-tools", to: "nextjs" },
  { from: "testing", to: "performance" },
  { from: "nextjs", to: "performance" },
  { from: "nextjs", to: "web-security" },
];

// Apply nodes and edges
frontendRoadmap.nodes = frontendNodes;
frontendRoadmap.edges = frontendEdges;
frontendRoadmap.totalNodes = frontendNodes.length;

// ═══════════════════════════════════════
// Backend Developer Roadmap
// ═══════════════════════════════════════
export const backendRoadmap: RoadmapData = {
  id: "backend",
  title: "Backend Developer",
  description:
    "Everything you need to know to become a backend developer in 2026",
  icon: "⚙️",
  category: "role",
  difficulty: "beginner-to-advanced",
  estimatedHours: 900,
  totalNodes: 12,
  nodes: [
    {
      id: "be-internet",
      label: "Internet & Protocols",
      description: "HTTP, HTTPS, DNS, TCP/IP — how the web communicates",
      category: "foundation",
      difficulty: "beginner",
      estimatedMinutes: 180,
      position: { x: 400, y: 0 },
      resources: [],
    },
    {
      id: "be-language",
      label: "Pick a Language",
      description: "Node.js, Python, Go, Java, Rust — choose your weapon",
      category: "language",
      difficulty: "beginner",
      estimatedMinutes: 1200,
      position: { x: 400, y: 120 },
      resources: [],
    },
    {
      id: "be-databases",
      label: "Databases",
      description: "SQL (PostgreSQL) & NoSQL (MongoDB, Redis)",
      category: "foundation",
      difficulty: "beginner",
      estimatedMinutes: 720,
      position: { x: 200, y: 240 },
      resources: [],
    },
    {
      id: "be-apis",
      label: "API Development",
      description: "REST, GraphQL, gRPC — build and consume APIs",
      category: "foundation",
      difficulty: "intermediate",
      estimatedMinutes: 600,
      position: { x: 600, y: 240 },
      resources: [],
    },
    {
      id: "be-auth",
      label: "Authentication",
      description: "JWT, OAuth, session management, SSO",
      category: "foundation",
      difficulty: "intermediate",
      estimatedMinutes: 480,
      position: { x: 400, y: 360 },
      resources: [],
    },
    {
      id: "be-caching",
      label: "Caching",
      description: "Redis, Memcached, CDN caching strategies",
      category: "optimization",
      difficulty: "intermediate",
      estimatedMinutes: 240,
      position: { x: 200, y: 480 },
      resources: [],
    },
    {
      id: "be-testing",
      label: "Testing",
      description: "Unit, integration, load testing",
      category: "quality",
      difficulty: "intermediate",
      estimatedMinutes: 480,
      position: { x: 600, y: 480 },
      resources: [],
    },
    {
      id: "be-docker",
      label: "Docker & Containers",
      description: "Containerize your applications",
      category: "tooling",
      difficulty: "intermediate",
      estimatedMinutes: 360,
      position: { x: 400, y: 480 },
      resources: [],
    },
    {
      id: "be-ci-cd",
      label: "CI/CD",
      description: "Continuous integration and deployment pipelines",
      category: "tooling",
      difficulty: "intermediate",
      estimatedMinutes: 360,
      position: { x: 400, y: 600 },
      resources: [],
    },
    {
      id: "be-cloud",
      label: "Cloud Services",
      description: "AWS, GCP, Azure — deploy and scale your apps",
      category: "infrastructure",
      difficulty: "advanced",
      estimatedMinutes: 720,
      position: { x: 200, y: 720 },
      resources: [],
    },
    {
      id: "be-system-design",
      label: "System Design",
      description: "Scalability, load balancing, microservices",
      category: "architecture",
      difficulty: "advanced",
      estimatedMinutes: 960,
      position: { x: 400, y: 720 },
      resources: [],
    },
    {
      id: "be-security",
      label: "Security",
      description: "OWASP, input validation, encryption, rate limiting",
      category: "quality",
      difficulty: "advanced",
      estimatedMinutes: 480,
      position: { x: 600, y: 720 },
      resources: [],
    },
  ],
  edges: [
    { from: "be-internet", to: "be-language" },
    { from: "be-language", to: "be-databases" },
    { from: "be-language", to: "be-apis" },
    { from: "be-databases", to: "be-auth" },
    { from: "be-apis", to: "be-auth" },
    { from: "be-auth", to: "be-caching" },
    { from: "be-auth", to: "be-docker" },
    { from: "be-auth", to: "be-testing" },
    { from: "be-docker", to: "be-ci-cd" },
    { from: "be-ci-cd", to: "be-cloud" },
    { from: "be-ci-cd", to: "be-system-design" },
    { from: "be-ci-cd", to: "be-security" },
  ],
};

// ═══════════════════════════════════════
// Full Stack Roadmap
// ═══════════════════════════════════════
export const fullstackRoadmap: RoadmapData = {
  id: "fullstack",
  title: "Full Stack Developer",
  description: "Complete guide to becoming a full stack developer",
  icon: "🚀",
  category: "role",
  difficulty: "beginner-to-advanced",
  estimatedHours: 1200,
  totalNodes: 8,
  nodes: [
    { id: "fs-foundations", label: "Web Foundations", description: "HTML, CSS, JavaScript basics", category: "foundation", difficulty: "beginner", estimatedMinutes: 1440, position: { x: 400, y: 0 }, resources: [] },
    { id: "fs-frontend", label: "Frontend Framework", description: "React / Vue / Angular + TypeScript", category: "framework", difficulty: "intermediate", estimatedMinutes: 1200, position: { x: 200, y: 160 }, resources: [] },
    { id: "fs-backend", label: "Backend Development", description: "Node.js / Python + API development", category: "framework", difficulty: "intermediate", estimatedMinutes: 1200, position: { x: 600, y: 160 }, resources: [] },
    { id: "fs-database", label: "Databases", description: "SQL + NoSQL, ORM, migrations", category: "foundation", difficulty: "intermediate", estimatedMinutes: 720, position: { x: 400, y: 320 }, resources: [] },
    { id: "fs-auth", label: "Auth & Security", description: "Authentication, authorization, web security", category: "foundation", difficulty: "intermediate", estimatedMinutes: 480, position: { x: 400, y: 440 }, resources: [] },
    { id: "fs-devops", label: "DevOps Basics", description: "Docker, CI/CD, deployment", category: "tooling", difficulty: "intermediate", estimatedMinutes: 600, position: { x: 400, y: 560 }, resources: [] },
    { id: "fs-testing", label: "Testing & QA", description: "Unit, integration, E2E testing", category: "quality", difficulty: "intermediate", estimatedMinutes: 480, position: { x: 200, y: 560 }, resources: [] },
    { id: "fs-scaling", label: "Scaling & Architecture", description: "System design, microservices, performance", category: "architecture", difficulty: "advanced", estimatedMinutes: 960, position: { x: 400, y: 680 }, resources: [] },
  ],
  edges: [
    { from: "fs-foundations", to: "fs-frontend" },
    { from: "fs-foundations", to: "fs-backend" },
    { from: "fs-frontend", to: "fs-database" },
    { from: "fs-backend", to: "fs-database" },
    { from: "fs-database", to: "fs-auth" },
    { from: "fs-auth", to: "fs-devops" },
    { from: "fs-auth", to: "fs-testing" },
    { from: "fs-devops", to: "fs-scaling" },
    { from: "fs-testing", to: "fs-scaling" },
  ],
};

// ═══════════════════════════════════════
// DevOps Roadmap
// ═══════════════════════════════════════
export const devopsRoadmap: RoadmapData = {
  id: "devops",
  title: "DevOps Engineer",
  description: "Guide to becoming a DevOps engineer",
  icon: "🔧",
  category: "role",
  difficulty: "intermediate-to-advanced",
  estimatedHours: 900,
  totalNodes: 8,
  nodes: [
    { id: "do-linux", label: "Linux Fundamentals", description: "Shell, filesystem, processes, permissions", category: "foundation", difficulty: "beginner", estimatedMinutes: 720, position: { x: 400, y: 0 }, resources: [] },
    { id: "do-networking", label: "Networking", description: "DNS, HTTP, TCP/IP, load balancers, proxies", category: "foundation", difficulty: "beginner", estimatedMinutes: 480, position: { x: 400, y: 120 }, resources: [] },
    { id: "do-scripting", label: "Scripting", description: "Bash, Python for automation", category: "language", difficulty: "beginner", estimatedMinutes: 600, position: { x: 200, y: 240 }, resources: [] },
    { id: "do-containers", label: "Containers", description: "Docker, container orchestration basics", category: "tooling", difficulty: "intermediate", estimatedMinutes: 480, position: { x: 600, y: 240 }, resources: [] },
    { id: "do-ci-cd", label: "CI/CD Pipelines", description: "Jenkins, GitHub Actions, GitLab CI", category: "tooling", difficulty: "intermediate", estimatedMinutes: 600, position: { x: 400, y: 360 }, resources: [] },
    { id: "do-iac", label: "Infrastructure as Code", description: "Terraform, Ansible, Pulumi", category: "tooling", difficulty: "intermediate", estimatedMinutes: 720, position: { x: 400, y: 480 }, resources: [] },
    { id: "do-k8s", label: "Kubernetes", description: "Container orchestration at scale", category: "infrastructure", difficulty: "advanced", estimatedMinutes: 960, position: { x: 400, y: 600 }, resources: [] },
    { id: "do-monitoring", label: "Monitoring & Observability", description: "Prometheus, Grafana, logging, tracing", category: "quality", difficulty: "advanced", estimatedMinutes: 600, position: { x: 400, y: 720 }, resources: [] },
  ],
  edges: [
    { from: "do-linux", to: "do-networking" },
    { from: "do-networking", to: "do-scripting" },
    { from: "do-networking", to: "do-containers" },
    { from: "do-scripting", to: "do-ci-cd" },
    { from: "do-containers", to: "do-ci-cd" },
    { from: "do-ci-cd", to: "do-iac" },
    { from: "do-iac", to: "do-k8s" },
    { from: "do-k8s", to: "do-monitoring" },
  ],
};

// ═══════════════════════════════════════
// AI Engineer Roadmap
// ═══════════════════════════════════════
export const aiEngineerRoadmap: RoadmapData = {
  id: "ai-engineer",
  title: "AI Engineer",
  description: "Path to becoming an AI/ML engineer in 2026",
  icon: "🤖",
  category: "role",
  difficulty: "intermediate-to-advanced",
  estimatedHours: 1000,
  totalNodes: 8,
  nodes: [
    { id: "ai-python", label: "Python & Math", description: "Python, linear algebra, calculus, statistics", category: "foundation", difficulty: "beginner", estimatedMinutes: 1200, position: { x: 400, y: 0 }, resources: [] },
    { id: "ai-ml-basics", label: "ML Fundamentals", description: "Supervised, unsupervised, reinforcement learning", category: "foundation", difficulty: "intermediate", estimatedMinutes: 960, position: { x: 400, y: 140 }, resources: [] },
    { id: "ai-deep-learning", label: "Deep Learning", description: "Neural networks, CNNs, RNNs, transformers", category: "foundation", difficulty: "intermediate", estimatedMinutes: 1200, position: { x: 400, y: 280 }, resources: [] },
    { id: "ai-nlp", label: "NLP & LLMs", description: "Natural language processing, language models", category: "specialization", difficulty: "advanced", estimatedMinutes: 960, position: { x: 200, y: 420 }, resources: [] },
    { id: "ai-cv", label: "Computer Vision", description: "Image recognition, object detection, GANs", category: "specialization", difficulty: "advanced", estimatedMinutes: 720, position: { x: 600, y: 420 }, resources: [] },
    { id: "ai-deployment", label: "ML Deployment", description: "MLOps, model serving, monitoring", category: "tooling", difficulty: "advanced", estimatedMinutes: 600, position: { x: 400, y: 560 }, resources: [] },
    { id: "ai-agents", label: "AI Agents & RAG", description: "Retrieval augmented generation, autonomous agents", category: "specialization", difficulty: "advanced", estimatedMinutes: 720, position: { x: 200, y: 680 }, resources: [] },
    { id: "ai-ethics", label: "AI Ethics & Safety", description: "Responsible AI, red teaming, alignment", category: "quality", difficulty: "advanced", estimatedMinutes: 360, position: { x: 600, y: 680 }, resources: [] },
  ],
  edges: [
    { from: "ai-python", to: "ai-ml-basics" },
    { from: "ai-ml-basics", to: "ai-deep-learning" },
    { from: "ai-deep-learning", to: "ai-nlp" },
    { from: "ai-deep-learning", to: "ai-cv" },
    { from: "ai-nlp", to: "ai-deployment" },
    { from: "ai-cv", to: "ai-deployment" },
    { from: "ai-deployment", to: "ai-agents" },
    { from: "ai-deployment", to: "ai-ethics" },
  ],
};

// ═══════════════════════════════════════
// All Roadmaps Registry
// ═══════════════════════════════════════
export const allRoadmaps: RoadmapData[] = [
  frontendRoadmap,
  backendRoadmap,
  fullstackRoadmap,
  devopsRoadmap,
  aiEngineerRoadmap,
];

export function getRoadmapById(id: string): RoadmapData | undefined {
  return allRoadmaps.find((r) => r.id === id);
}

export function getRoadmapsByCategory(
  category: string,
): RoadmapData[] {
  return allRoadmaps.filter((r) => r.category === category);
}
