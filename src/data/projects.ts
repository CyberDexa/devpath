// ═══════════════════════════════════════
// SkillRoute — Projects & Challenges Data
// ═══════════════════════════════════════

export interface ProjectChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  category: "frontend" | "backend" | "fullstack" | "devops" | "ai-ml" | "algorithms";
  tags: string[];
  estimatedHours: number;
  completions: number;
  rating: number;
  starterCode: string;
  language: string;
  testCases: number;
  xpReward: number;
  skills: string[];
  featured?: boolean;
  isNew?: boolean;
}

export const difficultyConfig = {
  beginner: { label: "Beginner", color: "#00e5a0", icon: "🌱", xpMultiplier: 1 },
  intermediate: { label: "Intermediate", color: "#f0a030", icon: "⚡", xpMultiplier: 1.5 },
  advanced: { label: "Advanced", color: "#f04070", icon: "🔥", xpMultiplier: 2 },
  expert: { label: "Expert", color: "#8855ff", icon: "💎", xpMultiplier: 3 },
};

export const categoryConfig = {
  frontend: { label: "Frontend", icon: "🎨", color: "#38bdf8" },
  backend: { label: "Backend", icon: "⚙️", color: "#00e5a0" },
  fullstack: { label: "Full Stack", icon: "🔗", color: "#8855ff" },
  devops: { label: "DevOps", icon: "🚀", color: "#f0a030" },
  "ai-ml": { label: "AI / ML", icon: "🧠", color: "#f04070" },
  algorithms: { label: "Algorithms", icon: "🧮", color: "#38bdf8" },
};

export const allProjects: ProjectChallenge[] = [
  // ── Frontend Projects ──
  {
    id: "animated-portfolio",
    title: "Animated Developer Portfolio",
    description: "Build a stunning personal portfolio with scroll-triggered animations, dark mode, and responsive design. Use CSS animations and intersection observers for a modern feel.",
    difficulty: "beginner",
    category: "frontend",
    tags: ["HTML", "CSS", "JavaScript", "Animation"],
    estimatedHours: 8,
    completions: 4280,
    rating: 4.8,
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Portfolio</title>
</head>
<body>
  <!-- Build your portfolio here -->
</body>
</html>`,
    language: "html",
    testCases: 12,
    xpReward: 250,
    skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
    featured: true,
  },
  {
    id: "react-kanban",
    title: "Kanban Board with Drag & Drop",
    description: "Create a Trello-style Kanban board with drag-and-drop functionality, column management, card editing, and local storage persistence.",
    difficulty: "intermediate",
    category: "frontend",
    tags: ["React", "TypeScript", "DnD", "State Management"],
    estimatedHours: 12,
    completions: 2890,
    rating: 4.9,
    starterCode: `import React from 'react';\n\nfunction KanbanBoard() {\n  return <div>Build your Kanban board</div>;\n}\n\nexport default KanbanBoard;`,
    language: "typescript",
    testCases: 18,
    xpReward: 450,
    skills: ["React", "TypeScript", "Drag and Drop API", "localStorage"],
    featured: true,
  },
  {
    id: "design-system",
    title: "Build a Design System Library",
    description: "Create a reusable component library with Button, Input, Modal, Toast, and more. Include theming support, accessibility, and Storybook documentation.",
    difficulty: "advanced",
    category: "frontend",
    tags: ["React", "TypeScript", "Storybook", "A11y"],
    estimatedHours: 24,
    completions: 1120,
    rating: 4.7,
    starterCode: `// Design System - Component Library\nexport const theme = {\n  colors: {},\n  fonts: {},\n  spacing: {},\n}`,
    language: "typescript",
    testCases: 35,
    xpReward: 800,
    skills: ["Component Architecture", "TypeScript", "Accessibility", "Testing"],
  },
  {
    id: "real-time-dashboard",
    title: "Real-time Analytics Dashboard",
    description: "Build a live analytics dashboard with WebSocket data streaming, interactive charts (line, bar, pie), filtering, and export functionality.",
    difficulty: "advanced",
    category: "frontend",
    tags: ["React", "D3.js", "WebSocket", "Charts"],
    estimatedHours: 20,
    completions: 980,
    rating: 4.6,
    starterCode: `import React from 'react';\nimport * as d3 from 'd3';\n\nfunction Dashboard() {\n  return <div>Your dashboard</div>;\n}`,
    language: "typescript",
    testCases: 22,
    xpReward: 700,
    skills: ["D3.js", "WebSockets", "Data Visualization", "React"],
    isNew: true,
  },

  // ── Backend Projects ──
  {
    id: "rest-api",
    title: "RESTful API with Auth",
    description: "Build a complete REST API with JWT authentication, CRUD operations, input validation, rate limiting, and comprehensive error handling. Include Swagger docs.",
    difficulty: "intermediate",
    category: "backend",
    tags: ["Node.js", "Express", "JWT", "PostgreSQL"],
    estimatedHours: 14,
    completions: 3450,
    rating: 4.8,
    starterCode: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ message: 'API running' });\n});\n\napp.listen(3000);`,
    language: "javascript",
    testCases: 28,
    xpReward: 500,
    skills: ["Node.js", "Express", "JWT", "SQL", "API Design"],
    featured: true,
  },
  {
    id: "graphql-server",
    title: "GraphQL API with Subscriptions",
    description: "Design and implement a GraphQL server with queries, mutations, subscriptions for real-time updates, DataLoader for N+1 prevention, and schema stitching.",
    difficulty: "advanced",
    category: "backend",
    tags: ["GraphQL", "Node.js", "Apollo", "Subscriptions"],
    estimatedHours: 18,
    completions: 1540,
    rating: 4.7,
    starterCode: `const { ApolloServer } = require('@apollo/server');\n\nconst typeDefs = \`\n  type Query {\n    hello: String\n  }\n\`;\n\nconst resolvers = {\n  Query: { hello: () => 'world' },\n};`,
    language: "javascript",
    testCases: 24,
    xpReward: 650,
    skills: ["GraphQL", "Real-time", "Schema Design", "Performance"],
  },
  {
    id: "cli-tool",
    title: "Build a CLI Task Manager",
    description: "Create a powerful command-line task manager with add, list, delete, tags, priorities, due dates, search, and SQLite persistence. Style with chalk and inquirer.",
    difficulty: "beginner",
    category: "backend",
    tags: ["Node.js", "CLI", "SQLite", "Commander"],
    estimatedHours: 6,
    completions: 5120,
    rating: 4.5,
    starterCode: `#!/usr/bin/env node\nconst { program } = require('commander');\n\nprogram\n  .name('taskr')\n  .description('CLI task manager')\n  .version('1.0.0');\n\nprogram.parse();`,
    language: "javascript",
    testCases: 15,
    xpReward: 200,
    skills: ["Node.js", "CLI Design", "SQLite", "File I/O"],
  },
  {
    id: "microservices",
    title: "Microservices with Message Queue",
    description: "Build a microservices architecture with RabbitMQ message broker, service discovery, API gateway pattern, circuit breaker, and distributed tracing.",
    difficulty: "expert",
    category: "backend",
    tags: ["Node.js", "RabbitMQ", "Docker", "Microservices"],
    estimatedHours: 30,
    completions: 620,
    rating: 4.9,
    starterCode: `// API Gateway Service\nconst express = require('express');\nconst amqp = require('amqplib');\n\nasync function startGateway() {\n  const connection = await amqp.connect('amqp://localhost');\n  // Build your gateway\n}`,
    language: "javascript",
    testCases: 32,
    xpReward: 1200,
    skills: ["Microservices", "Message Queues", "Docker", "System Design"],
    isNew: true,
  },

  // ── Full Stack Projects ──
  {
    id: "blog-platform",
    title: "Full-Stack Blog Platform",
    description: "Build a complete blogging platform with rich text editor, image uploads, tagging, comments, user profiles, and an admin dashboard. Deploy to production.",
    difficulty: "intermediate",
    category: "fullstack",
    tags: ["Next.js", "Prisma", "PostgreSQL", "Auth"],
    estimatedHours: 20,
    completions: 2670,
    rating: 4.8,
    starterCode: `// Next.js App Router\nexport default function Home() {\n  return <main>Blog Platform</main>;\n}`,
    language: "typescript",
    testCases: 30,
    xpReward: 600,
    skills: ["Next.js", "Prisma", "PostgreSQL", "File Uploads", "Auth"],
  },
  {
    id: "ecommerce-store",
    title: "E-commerce Store with Payments",
    description: "Create a full e-commerce store with product catalog, cart, checkout, Stripe payments, order management, and admin panel. Responsive and accessible.",
    difficulty: "advanced",
    category: "fullstack",
    tags: ["React", "Node.js", "Stripe", "MongoDB"],
    estimatedHours: 28,
    completions: 1890,
    rating: 4.9,
    starterCode: `// Product interface\ninterface Product {\n  id: string;\n  name: string;\n  price: number;\n  image: string;\n}\n\nexport default function Store() {\n  return <div>E-commerce Store</div>;\n}`,
    language: "typescript",
    testCases: 40,
    xpReward: 900,
    skills: ["React", "Node.js", "Stripe API", "MongoDB", "State Management"],
    featured: true,
  },
  {
    id: "social-platform",
    title: "Real-time Social Platform",
    description: "Build a social platform with real-time messaging, news feed, user follows, notifications, and media sharing. WebSocket-powered for instant updates.",
    difficulty: "expert",
    category: "fullstack",
    tags: ["React", "Socket.io", "Redis", "PostgreSQL"],
    estimatedHours: 35,
    completions: 780,
    rating: 4.7,
    starterCode: `// Socket.io client setup\nimport { io } from 'socket.io-client';\nconst socket = io('http://localhost:3001');\n\n// Build your social platform`,
    language: "typescript",
    testCases: 38,
    xpReward: 1100,
    skills: ["WebSockets", "Redis", "PostgreSQL", "Real-time Systems"],
  },

  // ── DevOps Projects ──
  {
    id: "ci-cd-pipeline",
    title: "CI/CD Pipeline from Scratch",
    description: "Build a complete CI/CD pipeline with GitHub Actions, Docker containerization, automated testing, staging/production environments, and rollback support.",
    difficulty: "intermediate",
    category: "devops",
    tags: ["GitHub Actions", "Docker", "Nginx", "Shell"],
    estimatedHours: 10,
    completions: 2340,
    rating: 4.6,
    starterCode: `# .github/workflows/deploy.yml\nname: Deploy Pipeline\n\non:\n  push:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4`,
    language: "yaml",
    testCases: 14,
    xpReward: 400,
    skills: ["GitHub Actions", "Docker", "Shell Scripting", "Nginx"],
  },
  {
    id: "kubernetes-deploy",
    title: "Kubernetes Cluster Deployment",
    description: "Deploy a multi-service application to Kubernetes with deployments, services, ingress, config maps, secrets, health checks, and auto-scaling.",
    difficulty: "expert",
    category: "devops",
    tags: ["Kubernetes", "Docker", "Helm", "Monitoring"],
    estimatedHours: 22,
    completions: 890,
    rating: 4.8,
    starterCode: `# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: skillroute`,
    language: "yaml",
    testCases: 20,
    xpReward: 900,
    skills: ["Kubernetes", "Docker", "Helm", "Monitoring", "Networking"],
  },

  // ── AI/ML Projects ──
  {
    id: "sentiment-api",
    title: "Sentiment Analysis API",
    description: "Build a sentiment analysis API that classifies text as positive, negative, or neutral. Use a pre-trained transformer model with a REST endpoint.",
    difficulty: "intermediate",
    category: "ai-ml",
    tags: ["Python", "FastAPI", "Transformers", "NLP"],
    estimatedHours: 12,
    completions: 1780,
    rating: 4.7,
    starterCode: `from fastapi import FastAPI\nfrom transformers import pipeline\n\napp = FastAPI()\nclassifier = pipeline("sentiment-analysis")\n\n@app.post("/analyze")\nasync def analyze(text: str):\n    pass  # Implement`,
    language: "python",
    testCases: 16,
    xpReward: 500,
    skills: ["Python", "FastAPI", "NLP", "Transformers"],
    isNew: true,
  },
  {
    id: "image-classifier",
    title: "Image Classification App",
    description: "Create an image classification web app with a trained CNN model. Upload images, get predictions with confidence scores, and visualize activation maps.",
    difficulty: "advanced",
    category: "ai-ml",
    tags: ["Python", "TensorFlow", "React", "CNN"],
    estimatedHours: 16,
    completions: 1240,
    rating: 4.6,
    starterCode: `import tensorflow as tf\nfrom tensorflow.keras import layers, models\n\ndef build_model():\n    model = models.Sequential([\n        layers.Conv2D(32, (3, 3), activation='relu'),\n        # Build your CNN\n    ])\n    return model`,
    language: "python",
    testCases: 20,
    xpReward: 650,
    skills: ["TensorFlow", "CNNs", "Python", "React"],
  },

  // ── Algorithm Challenges ──
  {
    id: "lru-cache",
    title: "LRU Cache Implementation",
    description: "Implement a Least Recently Used (LRU) cache with O(1) get and put operations. Use a doubly linked list and hash map combination.",
    difficulty: "intermediate",
    category: "algorithms",
    tags: ["Data Structures", "HashMap", "LinkedList"],
    estimatedHours: 3,
    completions: 6780,
    rating: 4.5,
    starterCode: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    // Initialize your data structures\n  }\n\n  get(key) {\n    // O(1) retrieval\n  }\n\n  put(key, value) {\n    // O(1) insertion\n  }\n}`,
    language: "javascript",
    testCases: 25,
    xpReward: 350,
    skills: ["Data Structures", "Hash Maps", "Linked Lists", "Caching"],
  },
  {
    id: "path-finder",
    title: "Visual Pathfinding Algorithm",
    description: "Build a visual pathfinding tool that animates BFS, DFS, Dijkstra's, and A* algorithms on a grid. Add wall drawing, maze generation, and speed controls.",
    difficulty: "advanced",
    category: "algorithms",
    tags: ["Algorithms", "Canvas", "Pathfinding", "Animation"],
    estimatedHours: 15,
    completions: 2100,
    rating: 4.9,
    starterCode: `const canvas = document.getElementById('grid');\nconst ctx = canvas.getContext('2d');\n\nclass Grid {\n  constructor(rows, cols) {\n    this.grid = Array(rows).fill(null).map(() => Array(cols).fill(0));\n  }\n\n  // Implement pathfinding\n}`,
    language: "javascript",
    testCases: 18,
    xpReward: 600,
    skills: ["Graph Algorithms", "Canvas API", "Animation", "Problem Solving"],
    featured: true,
  },
];

export function getProjectById(id: string): ProjectChallenge | undefined {
  return allProjects.find((p) => p.id === id);
}

export function getProjectsByCategory(category: string): ProjectChallenge[] {
  if (category === "all") return allProjects;
  return allProjects.filter((p) => p.category === category);
}

export function getFeaturedProjects(): ProjectChallenge[] {
  return allProjects.filter((p) => p.featured);
}
