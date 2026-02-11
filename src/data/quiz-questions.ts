// ═══════════════════════════════════════
// SkillRoute — Quiz Question Bank
// Diagnostic + review questions per roadmap topic
// ═══════════════════════════════════════

export interface QuizQuestion {
  id: string;
  roadmapId: string;
  nodeId: string;
  question: string;
  questionType: "multiple_choice" | "true_false" | "code_output";
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

// ═══════════════════════════════════════
// Frontend Roadmap Questions
// ═══════════════════════════════════════

const frontendQuestions: QuizQuestion[] = [
  // Internet
  {
    id: "fe-q1",
    roadmapId: "frontend",
    nodeId: "internet",
    question: "What protocol is used to transfer web pages over the internet?",
    questionType: "multiple_choice",
    options: ["FTP", "SMTP", "HTTP/HTTPS", "TCP"],
    correctAnswer: "HTTP/HTTPS",
    explanation:
      "HTTP (HyperText Transfer Protocol) and its secure variant HTTPS are used to transfer web pages. FTP is for file transfer, SMTP for email, and TCP is a transport layer protocol.",
    difficulty: "beginner",
    tags: ["http", "protocols"],
  },
  {
    id: "fe-q2",
    roadmapId: "frontend",
    nodeId: "internet",
    question: "DNS stands for Domain Name System and it translates domain names to IP addresses.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "DNS (Domain Name System) resolves human-readable domain names like google.com into IP addresses like 142.250.80.46 that computers use to communicate.",
    difficulty: "beginner",
    tags: ["dns", "networking"],
  },
  // HTML
  {
    id: "fe-q3",
    roadmapId: "frontend",
    nodeId: "html",
    question: "Which HTML element is used to define the largest heading?",
    questionType: "multiple_choice",
    options: ["<heading>", "<h6>", "<h1>", "<head>"],
    correctAnswer: "<h1>",
    explanation:
      "<h1> defines the largest heading. HTML headings range from <h1> (largest) to <h6> (smallest). <head> is the document head container, not a visible heading.",
    difficulty: "beginner",
    tags: ["html", "semantic"],
  },
  {
    id: "fe-q4",
    roadmapId: "frontend",
    nodeId: "html",
    question:
      "What is the purpose of the `alt` attribute on an `<img>` tag?",
    questionType: "multiple_choice",
    options: [
      "It sets the image title on hover",
      "It provides alternative text for accessibility and when images fail to load",
      "It defines the image alignment",
      "It specifies a fallback image URL",
    ],
    correctAnswer:
      "It provides alternative text for accessibility and when images fail to load",
    explanation:
      "The alt attribute provides alternative text that is displayed when the image cannot be loaded and is read by screen readers for accessibility. The title attribute handles hover text.",
    difficulty: "beginner",
    tags: ["html", "accessibility"],
  },
  {
    id: "fe-q5",
    roadmapId: "frontend",
    nodeId: "html",
    question:
      "Semantic HTML elements like <article>, <nav>, and <section> improve SEO and accessibility.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "Semantic HTML gives meaning to content structure, helping search engines understand the page and assistive technologies navigate it. This improves both SEO rankings and accessibility.",
    difficulty: "beginner",
    tags: ["html", "semantic", "seo"],
  },
  // CSS
  {
    id: "fe-q6",
    roadmapId: "frontend",
    nodeId: "css",
    question: "Which CSS property is used to create space between an element's border and its content?",
    questionType: "multiple_choice",
    options: ["margin", "padding", "border-spacing", "gap"],
    correctAnswer: "padding",
    explanation:
      "Padding creates space between an element's content and its border. Margin creates space outside the border. Gap is used in flexbox/grid containers.",
    difficulty: "beginner",
    tags: ["css", "box-model"],
  },
  {
    id: "fe-q7",
    roadmapId: "frontend",
    nodeId: "css",
    question: "What does `display: flex` do to child elements by default?",
    questionType: "multiple_choice",
    options: [
      "Stacks them vertically",
      "Places them in a row (horizontal axis)",
      "Makes them invisible",
      "Centers them on the page",
    ],
    correctAnswer: "Places them in a row (horizontal axis)",
    explanation:
      "Flexbox defaults to flex-direction: row, placing children horizontally. To stack vertically, use flex-direction: column.",
    difficulty: "beginner",
    tags: ["css", "flexbox"],
  },
  {
    id: "fe-q8",
    roadmapId: "frontend",
    nodeId: "css",
    question: "What is the correct CSS specificity order from lowest to highest?",
    questionType: "multiple_choice",
    options: [
      "ID > Class > Element",
      "Element > Class > ID",
      "Class > ID > Element",
      "Element > ID > Class",
    ],
    correctAnswer: "Element > Class > ID",
    explanation:
      "CSS specificity from lowest to highest: element selectors (0,0,1), class selectors (0,1,0), ID selectors (1,0,0). Inline styles and !important override all.",
    difficulty: "intermediate",
    tags: ["css", "specificity"],
  },
  // JavaScript
  {
    id: "fe-q9",
    roadmapId: "frontend",
    nodeId: "javascript",
    question: "What will `typeof null` return in JavaScript?",
    questionType: "code_output",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctAnswer: '"object"',
    explanation:
      'This is a well-known JavaScript bug from the first implementation. typeof null returns "object" even though null is not an object. This has never been fixed for backwards compatibility.',
    difficulty: "intermediate",
    tags: ["javascript", "types"],
  },
  {
    id: "fe-q10",
    roadmapId: "frontend",
    nodeId: "javascript",
    question: "What is the difference between `let` and `const`?",
    questionType: "multiple_choice",
    options: [
      "let is function-scoped, const is block-scoped",
      "const values cannot be reassigned, let values can",
      "let is hoisted, const is not",
      "There is no difference",
    ],
    correctAnswer: "const values cannot be reassigned, let values can",
    explanation:
      "Both let and const are block-scoped. The key difference is that const cannot be reassigned after declaration, while let can. Note: const objects/arrays can still be mutated.",
    difficulty: "beginner",
    tags: ["javascript", "variables"],
  },
  {
    id: "fe-q11",
    roadmapId: "frontend",
    nodeId: "javascript",
    question: "What does the `...` spread operator do when used with arrays?",
    questionType: "multiple_choice",
    options: [
      "Deletes array elements",
      "Expands array elements into individual values",
      "Reverses the array",
      "Converts the array to a string",
    ],
    correctAnswer: "Expands array elements into individual values",
    explanation:
      "The spread operator (...) expands an iterable into individual elements. For example, [...arr1, ...arr2] merges two arrays, and {...obj1, ...obj2} merges objects.",
    difficulty: "beginner",
    tags: ["javascript", "es6"],
  },
  {
    id: "fe-q12",
    roadmapId: "frontend",
    nodeId: "javascript",
    question:
      "What will `console.log([1,2,3].map(x => x * 2))` output?",
    questionType: "code_output",
    options: ["[1,2,3]", "[2,4,6]", "[1,4,9]", "undefined"],
    correctAnswer: "[2,4,6]",
    explanation:
      "Array.map() creates a new array by applying the callback function to each element. Here each element is multiplied by 2: 1*2=2, 2*2=4, 3*2=6.",
    difficulty: "beginner",
    tags: ["javascript", "arrays"],
  },
  // TypeScript
  {
    id: "fe-q13",
    roadmapId: "frontend",
    nodeId: "typescript",
    question: "What is the main purpose of TypeScript?",
    questionType: "multiple_choice",
    options: [
      "To replace JavaScript entirely",
      "To add static type checking to JavaScript",
      "To make JavaScript run faster",
      "To compile JavaScript to machine code",
    ],
    correctAnswer: "To add static type checking to JavaScript",
    explanation:
      "TypeScript is a superset of JavaScript that adds static type checking. It catches type-related errors at compile time rather than runtime, improving code quality and developer experience.",
    difficulty: "beginner",
    tags: ["typescript", "types"],
  },
  {
    id: "fe-q14",
    roadmapId: "frontend",
    nodeId: "typescript",
    question:
      "What TypeScript utility type makes all properties of a type optional?",
    questionType: "multiple_choice",
    options: ["Optional<T>", "Partial<T>", "Maybe<T>", "Nullable<T>"],
    correctAnswer: "Partial<T>",
    explanation:
      "Partial<T> constructs a type with all properties of T set to optional. Other useful utility types include Required<T>, Pick<T,K>, Omit<T,K>, and Record<K,V>.",
    difficulty: "intermediate",
    tags: ["typescript", "utility-types"],
  },
  {
    id: "fe-q15",
    roadmapId: "frontend",
    nodeId: "typescript",
    question:
      "In TypeScript, `interface` and `type` are completely interchangeable.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation:
      "While interfaces and types overlap significantly, they have differences: interfaces can be merged (declaration merging), while types can represent unions, intersections, and primitives that interfaces cannot.",
    difficulty: "intermediate",
    tags: ["typescript", "interface", "type"],
  },
  // React
  {
    id: "fe-q16",
    roadmapId: "frontend",
    nodeId: "react",
    question: "What hook is used to manage state in a React functional component?",
    questionType: "multiple_choice",
    options: ["useEffect", "useState", "useRef", "useMemo"],
    correctAnswer: "useState",
    explanation:
      "useState returns a state variable and a setter function. useEffect handles side effects, useRef creates persistent references, and useMemo memoizes computed values.",
    difficulty: "beginner",
    tags: ["react", "hooks"],
  },
  {
    id: "fe-q17",
    roadmapId: "frontend",
    nodeId: "react",
    question:
      "What is the purpose of the dependency array in useEffect?",
    questionType: "multiple_choice",
    options: [
      "To import external dependencies",
      "To specify which values trigger re-execution of the effect",
      "To define the order of effect execution",
      "To cache the effect function",
    ],
    correctAnswer:
      "To specify which values trigger re-execution of the effect",
    explanation:
      "The dependency array tells React when to re-run the effect. An empty array [] means run once on mount. Including variables means re-run when those values change.",
    difficulty: "beginner",
    tags: ["react", "hooks", "useEffect"],
  },
  {
    id: "fe-q18",
    roadmapId: "frontend",
    nodeId: "react",
    question:
      "What is the virtual DOM in React?",
    questionType: "multiple_choice",
    options: [
      "A separate browser window for rendering",
      "A lightweight copy of the real DOM used for efficient updates",
      "A CSS rendering engine",
      "A server-side rendering technique",
    ],
    correctAnswer:
      "A lightweight copy of the real DOM used for efficient updates",
    explanation:
      "React maintains a virtual DOM — an in-memory JavaScript representation of the UI. When state changes, React diffs the virtual DOM against the previous version and only updates the real DOM where changes occurred.",
    difficulty: "intermediate",
    tags: ["react", "virtual-dom"],
  },
  // Tailwind CSS
  {
    id: "fe-q19",
    roadmapId: "frontend",
    nodeId: "tailwind",
    question: "What approach does Tailwind CSS use for styling?",
    questionType: "multiple_choice",
    options: [
      "Component-based CSS modules",
      "Utility-first CSS classes",
      "CSS-in-JS runtime styles",
      "Preprocessor mixins and variables",
    ],
    correctAnswer: "Utility-first CSS classes",
    explanation:
      "Tailwind CSS uses a utility-first approach where you compose designs using small, single-purpose classes directly in HTML (e.g., flex items-center p-4 bg-blue-500).",
    difficulty: "beginner",
    tags: ["tailwind", "css"],
  },
  // Build Tools
  {
    id: "fe-q20",
    roadmapId: "frontend",
    nodeId: "build-tools",
    question:
      "What is the primary purpose of a JavaScript bundler like Vite or Webpack?",
    questionType: "multiple_choice",
    options: [
      "To minify HTML files",
      "To combine and optimize JavaScript modules for the browser",
      "To compile TypeScript to Python",
      "To manage database connections",
    ],
    correctAnswer:
      "To combine and optimize JavaScript modules for the browser",
    explanation:
      "Bundlers resolve module dependencies, combine files, apply transformations (like TypeScript compilation), and optimize output with minification, tree-shaking, and code splitting.",
    difficulty: "intermediate",
    tags: ["build-tools", "bundler"],
  },
  // Testing
  {
    id: "fe-q21",
    roadmapId: "frontend",
    nodeId: "testing",
    question: "Which testing approach verifies that individual functions or components work correctly in isolation?",
    questionType: "multiple_choice",
    options: [
      "Integration testing",
      "End-to-end testing",
      "Unit testing",
      "Performance testing",
    ],
    correctAnswer: "Unit testing",
    explanation:
      "Unit tests verify individual units (functions, components) in isolation. Integration tests check how units work together. E2E tests simulate real user flows through the entire application.",
    difficulty: "beginner",
    tags: ["testing", "unit-test"],
  },
  // Next.js
  {
    id: "fe-q22",
    roadmapId: "frontend",
    nodeId: "nextjs",
    question:
      "What rendering strategy does Next.js use by default in the App Router?",
    questionType: "multiple_choice",
    options: [
      "Client-side rendering only",
      "Server Components (RSC) by default",
      "Static generation only",
      "Incremental static regeneration",
    ],
    correctAnswer: "Server Components (RSC) by default",
    explanation:
      "Next.js 13+ App Router uses React Server Components by default. Components are rendered on the server unless explicitly marked with 'use client' for client-side interactivity.",
    difficulty: "intermediate",
    tags: ["nextjs", "rsc", "rendering"],
  },
  // Performance
  {
    id: "fe-q23",
    roadmapId: "frontend",
    nodeId: "performance",
    question: "Which metric measures how quickly the main content of a page becomes visible?",
    questionType: "multiple_choice",
    options: [
      "Time to First Byte (TTFB)",
      "Largest Contentful Paint (LCP)",
      "Cumulative Layout Shift (CLS)",
      "First Input Delay (FID)",
    ],
    correctAnswer: "Largest Contentful Paint (LCP)",
    explanation:
      "LCP measures when the largest content element becomes visible. It's a Core Web Vital. TTFB measures server response time, CLS measures visual stability, FID measures interactivity responsiveness.",
    difficulty: "intermediate",
    tags: ["performance", "core-web-vitals"],
  },
  // Web Security
  {
    id: "fe-q24",
    roadmapId: "frontend",
    nodeId: "web-security",
    question: "What is Cross-Site Scripting (XSS)?",
    questionType: "multiple_choice",
    options: [
      "An attack that injects malicious scripts into web pages viewed by other users",
      "An attack that intercepts network traffic",
      "An attack that overwhelms a server with requests",
      "An attack that guesses user passwords",
    ],
    correctAnswer:
      "An attack that injects malicious scripts into web pages viewed by other users",
    explanation:
      "XSS attacks inject malicious JavaScript into web pages. The script runs in victims' browsers, potentially stealing cookies, session tokens, or sensitive data. Prevention: sanitize inputs, use Content Security Policy.",
    difficulty: "intermediate",
    tags: ["security", "xss"],
  },
];

// ═══════════════════════════════════════
// Backend Roadmap Questions
// ═══════════════════════════════════════

const backendQuestions: QuizQuestion[] = [
  {
    id: "be-q1",
    roadmapId: "backend",
    nodeId: "be-internet",
    question: "What HTTP status code indicates a successful response?",
    questionType: "multiple_choice",
    options: ["100", "200", "301", "404"],
    correctAnswer: "200",
    explanation:
      "200 OK is the standard success response. 100 = informational, 301 = permanent redirect, 404 = not found. Status codes: 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error.",
    difficulty: "beginner",
    tags: ["http", "status-codes"],
  },
  {
    id: "be-q2",
    roadmapId: "backend",
    nodeId: "be-internet",
    question: "HTTP is a stateless protocol.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "HTTP is stateless — each request is independent and carries no memory of previous requests. Statefulness is achieved through cookies, sessions, or tokens.",
    difficulty: "beginner",
    tags: ["http", "protocols"],
  },
  {
    id: "be-q3",
    roadmapId: "backend",
    nodeId: "be-databases",
    question:
      "What is the difference between SQL and NoSQL databases?",
    questionType: "multiple_choice",
    options: [
      "SQL is newer than NoSQL",
      "SQL uses structured tables with schemas; NoSQL uses flexible document/key-value stores",
      "NoSQL is always faster than SQL",
      "SQL cannot handle large amounts of data",
    ],
    correctAnswer:
      "SQL uses structured tables with schemas; NoSQL uses flexible document/key-value stores",
    explanation:
      "SQL databases (PostgreSQL, MySQL) use structured tables with predefined schemas. NoSQL databases (MongoDB, Redis) offer flexible data models (documents, key-value, graph). Choice depends on data requirements.",
    difficulty: "beginner",
    tags: ["database", "sql", "nosql"],
  },
  {
    id: "be-q4",
    roadmapId: "backend",
    nodeId: "be-databases",
    question: "What does ACID stand for in database transactions?",
    questionType: "multiple_choice",
    options: [
      "Automatic, Consistent, Isolated, Durable",
      "Atomicity, Consistency, Isolation, Durability",
      "Asynchronous, Concurrent, Independent, Distributed",
      "Accessed, Cached, Indexed, Deleted",
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability",
    explanation:
      "ACID guarantees: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data persists).",
    difficulty: "intermediate",
    tags: ["database", "transactions"],
  },
  {
    id: "be-q5",
    roadmapId: "backend",
    nodeId: "be-apis",
    question:
      "Which HTTP method should be used to update an existing resource?",
    questionType: "multiple_choice",
    options: ["GET", "POST", "PUT/PATCH", "DELETE"],
    correctAnswer: "PUT/PATCH",
    explanation:
      "PUT replaces the entire resource. PATCH partially updates it. POST creates new resources. GET retrieves. DELETE removes. Using correct methods follows REST conventions.",
    difficulty: "beginner",
    tags: ["rest", "http-methods"],
  },
  {
    id: "be-q6",
    roadmapId: "backend",
    nodeId: "be-apis",
    question: "What is the main advantage of GraphQL over REST?",
    questionType: "multiple_choice",
    options: [
      "GraphQL is always faster",
      "Clients can request exactly the data they need, avoiding over/under-fetching",
      "GraphQL doesn't require a server",
      "GraphQL uses less bandwidth in all cases",
    ],
    correctAnswer:
      "Clients can request exactly the data they need, avoiding over/under-fetching",
    explanation:
      "GraphQL lets clients specify exactly which fields they need in a single request. REST often returns fixed response shapes, leading to over-fetching (too much data) or under-fetching (requiring multiple requests).",
    difficulty: "intermediate",
    tags: ["graphql", "api-design"],
  },
  {
    id: "be-q7",
    roadmapId: "backend",
    nodeId: "be-auth",
    question:
      "What is the difference between authentication and authorization?",
    questionType: "multiple_choice",
    options: [
      "They are the same thing",
      "Authentication verifies identity; authorization determines permissions",
      "Authorization verifies identity; authentication determines permissions",
      "Authentication is for API keys; authorization is for passwords",
    ],
    correctAnswer:
      "Authentication verifies identity; authorization determines permissions",
    explanation:
      "Authentication (authn) = who are you? (login/password, OAuth). Authorization (authz) = what can you do? (roles, permissions). Authentication must happen before authorization.",
    difficulty: "beginner",
    tags: ["auth", "security"],
  },
  {
    id: "be-q8",
    roadmapId: "backend",
    nodeId: "be-auth",
    question:
      "JWT tokens are stored server-side and require a database lookup for each request.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation:
      "JWTs are self-contained tokens — the payload includes the claims (user data) and a cryptographic signature. The server verifies the signature without a database lookup, making them stateless.",
    difficulty: "intermediate",
    tags: ["jwt", "auth"],
  },
  {
    id: "be-q9",
    roadmapId: "backend",
    nodeId: "be-caching",
    question:
      "What is the purpose of Redis in a backend architecture?",
    questionType: "multiple_choice",
    options: [
      "Long-term data storage",
      "In-memory caching and fast data access",
      "File system management",
      "Network routing",
    ],
    correctAnswer: "In-memory caching and fast data access",
    explanation:
      "Redis is an in-memory data store used for caching, session management, rate limiting, pub/sub messaging, and queues. It provides sub-millisecond access times because data resides in RAM.",
    difficulty: "intermediate",
    tags: ["redis", "caching"],
  },
  {
    id: "be-q10",
    roadmapId: "backend",
    nodeId: "be-docker",
    question:
      "What is the difference between a Docker image and a container?",
    questionType: "multiple_choice",
    options: [
      "They are the same thing",
      "An image is a blueprint; a container is a running instance of it",
      "A container is a blueprint; an image is a running instance",
      "Images run on Linux; containers run on Windows",
    ],
    correctAnswer:
      "An image is a blueprint; a container is a running instance of it",
    explanation:
      "A Docker image is an immutable template with the app and dependencies. A container is a running instance of an image. You can run multiple containers from one image. Think class vs object.",
    difficulty: "beginner",
    tags: ["docker", "containers"],
  },
  {
    id: "be-q11",
    roadmapId: "backend",
    nodeId: "be-testing",
    question:
      "What is the testing pyramid from bottom to top?",
    questionType: "multiple_choice",
    options: [
      "E2E > Integration > Unit",
      "Unit > Integration > E2E",
      "Integration > Unit > E2E",
      "Unit > E2E > Integration",
    ],
    correctAnswer: "Unit > Integration > E2E",
    explanation:
      "The testing pyramid: many unit tests (fast, cheap), fewer integration tests, fewest E2E tests (slow, expensive). This balances comprehensive coverage with execution speed and maintenance cost.",
    difficulty: "intermediate",
    tags: ["testing", "test-pyramid"],
  },
  {
    id: "be-q12",
    roadmapId: "backend",
    nodeId: "be-system-design",
    question:
      "What is horizontal scaling?",
    questionType: "multiple_choice",
    options: [
      "Adding more CPU and RAM to a single server",
      "Adding more servers to distribute the load",
      "Compressing data to save space",
      "Reducing the number of database queries",
    ],
    correctAnswer: "Adding more servers to distribute the load",
    explanation:
      "Horizontal scaling (scale out) adds more machines. Vertical scaling (scale up) adds more power to one machine. Horizontal scaling is generally preferred for web apps because it offers better availability and cost efficiency.",
    difficulty: "intermediate",
    tags: ["system-design", "scaling"],
  },
];

// ═══════════════════════════════════════
// DevOps Roadmap Questions
// ═══════════════════════════════════════

const devopsQuestions: QuizQuestion[] = [
  {
    id: "do-q1",
    roadmapId: "devops",
    nodeId: "do-linux",
    question:
      "Which command lists all files in a directory, including hidden ones?",
    questionType: "multiple_choice",
    options: ["ls", "ls -a", "dir", "list --all"],
    correctAnswer: "ls -a",
    explanation:
      "ls -a shows all files including hidden ones (starting with .). ls alone hides dotfiles. The -l flag adds long format with permissions, size, and dates.",
    difficulty: "beginner",
    tags: ["linux", "commands"],
  },
  {
    id: "do-q2",
    roadmapId: "devops",
    nodeId: "do-linux",
    question:
      "What does the chmod 755 command do to a file?",
    questionType: "multiple_choice",
    options: [
      "Deletes the file",
      "Owner: read/write/execute, Group & Others: read/execute",
      "Makes the file read-only for everyone",
      "Transfers file ownership",
    ],
    correctAnswer:
      "Owner: read/write/execute, Group & Others: read/execute",
    explanation:
      "chmod 755 = rwxr-xr-x. 7 (4+2+1) = read+write+execute for owner. 5 (4+0+1) = read+execute for group and others. Common for scripts and directories.",
    difficulty: "intermediate",
    tags: ["linux", "permissions"],
  },
  {
    id: "do-q3",
    roadmapId: "devops",
    nodeId: "do-networking",
    question:
      "What port does HTTPS use by default?",
    questionType: "multiple_choice",
    options: ["80", "443", "8080", "3000"],
    correctAnswer: "443",
    explanation:
      "HTTPS uses port 443 by default. HTTP uses port 80. 8080 is a common alternative for development servers. 3000 is commonly used by Node.js dev servers.",
    difficulty: "beginner",
    tags: ["networking", "ports"],
  },
  {
    id: "do-q4",
    roadmapId: "devops",
    nodeId: "do-containers",
    question:
      "What is the purpose of a Dockerfile?",
    questionType: "multiple_choice",
    options: [
      "To manage Docker networks",
      "To define the instructions for building a Docker image",
      "To monitor running containers",
      "To configure Docker Compose services",
    ],
    correctAnswer:
      "To define the instructions for building a Docker image",
    explanation:
      "A Dockerfile contains instructions (FROM, RUN, COPY, CMD) for building a Docker image. docker-compose.yml manages multi-container apps. Docker networks are configured separately.",
    difficulty: "beginner",
    tags: ["docker", "dockerfile"],
  },
  {
    id: "do-q5",
    roadmapId: "devops",
    nodeId: "do-ci-cd",
    question: "What is Continuous Integration (CI)?",
    questionType: "multiple_choice",
    options: [
      "Deploying code to production automatically",
      "Automatically building and testing code changes when merged to a shared branch",
      "Writing code in a team",
      "Using Git for version control",
    ],
    correctAnswer:
      "Automatically building and testing code changes when merged to a shared branch",
    explanation:
      "CI automatically builds, tests, and validates code changes when developers push to a shared repository. This catches integration issues early. CD (Continuous Deployment) automates the release to production.",
    difficulty: "beginner",
    tags: ["ci-cd", "devops"],
  },
  {
    id: "do-q6",
    roadmapId: "devops",
    nodeId: "do-iac",
    question:
      "What does 'Infrastructure as Code' (IaC) mean?",
    questionType: "multiple_choice",
    options: [
      "Writing application code that runs on infrastructure",
      "Managing and provisioning infrastructure through machine-readable definition files",
      "Using a coding IDE to manage servers",
      "Writing CSS for infrastructure dashboards",
    ],
    correctAnswer:
      "Managing and provisioning infrastructure through machine-readable definition files",
    explanation:
      "IaC uses declarative files (Terraform, CloudFormation, Pulumi) to define infrastructure. Benefits: version control, reproducibility, automation, consistency across environments.",
    difficulty: "intermediate",
    tags: ["iac", "terraform"],
  },
  {
    id: "do-q7",
    roadmapId: "devops",
    nodeId: "do-k8s",
    question:
      "What is a Kubernetes Pod?",
    questionType: "multiple_choice",
    options: [
      "A virtual machine running Kubernetes",
      "The smallest deployable unit — one or more containers sharing network and storage",
      "A Kubernetes configuration file",
      "A type of Docker image",
    ],
    correctAnswer:
      "The smallest deployable unit — one or more containers sharing network and storage",
    explanation:
      "A Pod is the smallest Kubernetes unit. It wraps one or more containers that share networking (same IP) and storage volumes. Pods are managed by Deployments for scaling and updates.",
    difficulty: "intermediate",
    tags: ["kubernetes", "pods"],
  },
  {
    id: "do-q8",
    roadmapId: "devops",
    nodeId: "do-monitoring",
    question:
      "What are the three pillars of observability?",
    questionType: "multiple_choice",
    options: [
      "CPU, Memory, Disk",
      "Logs, Metrics, Traces",
      "Input, Processing, Output",
      "Alerts, Dashboards, Reports",
    ],
    correctAnswer: "Logs, Metrics, Traces",
    explanation:
      "The three pillars: Logs (event records), Metrics (numerical measurements over time), Traces (request flow through services). Tools: Prometheus (metrics), Grafana (dashboards), Jaeger (tracing).",
    difficulty: "intermediate",
    tags: ["monitoring", "observability"],
  },
];

// ═══════════════════════════════════════
// AI Engineer Roadmap Questions
// ═══════════════════════════════════════

const aiEngineerQuestions: QuizQuestion[] = [
  {
    id: "ai-q1",
    roadmapId: "ai-engineer",
    nodeId: "ai-python",
    question:
      "What Python library is most commonly used for numerical computing and arrays?",
    questionType: "multiple_choice",
    options: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"],
    correctAnswer: "NumPy",
    explanation:
      "NumPy provides efficient multi-dimensional arrays and mathematical operations. Pandas builds on NumPy for data manipulation. Matplotlib is for visualization. Scikit-learn is for machine learning algorithms.",
    difficulty: "beginner",
    tags: ["python", "numpy"],
  },
  {
    id: "ai-q2",
    roadmapId: "ai-engineer",
    nodeId: "ai-ml-basics",
    question:
      "What is overfitting in machine learning?",
    questionType: "multiple_choice",
    options: [
      "When a model performs well on both training and test data",
      "When a model learns noise in the training data and performs poorly on new data",
      "When a model is too simple to capture patterns",
      "When training takes too long",
    ],
    correctAnswer:
      "When a model learns noise in the training data and performs poorly on new data",
    explanation:
      "Overfitting occurs when a model memorizes training data (including noise) instead of learning generalizable patterns. Signs: high training accuracy, low test accuracy. Prevention: regularization, dropout, more data, cross-validation.",
    difficulty: "beginner",
    tags: ["ml", "overfitting"],
  },
  {
    id: "ai-q3",
    roadmapId: "ai-engineer",
    nodeId: "ai-ml-basics",
    question:
      "Supervised learning requires labeled training data.",
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "Supervised learning uses labeled data (input-output pairs) to learn a mapping function. Unsupervised learning finds patterns in unlabeled data. Semi-supervised uses a mix of both.",
    difficulty: "beginner",
    tags: ["ml", "supervised-learning"],
  },
  {
    id: "ai-q4",
    roadmapId: "ai-engineer",
    nodeId: "ai-deep-learning",
    question: "What is the purpose of an activation function in a neural network?",
    questionType: "multiple_choice",
    options: [
      "To initialize weights",
      "To introduce non-linearity so the network can learn complex patterns",
      "To reduce the number of parameters",
      "To speed up training",
    ],
    correctAnswer:
      "To introduce non-linearity so the network can learn complex patterns",
    explanation:
      "Activation functions (ReLU, sigmoid, tanh) add non-linearity. Without them, stacking layers would be equivalent to a single linear transformation. Non-linearity enables learning complex decision boundaries.",
    difficulty: "intermediate",
    tags: ["deep-learning", "neural-networks"],
  },
  {
    id: "ai-q5",
    roadmapId: "ai-engineer",
    nodeId: "ai-deep-learning",
    question: "What is the transformer architecture primarily known for?",
    questionType: "multiple_choice",
    options: [
      "Image generation",
      "Self-attention mechanism for processing sequences in parallel",
      "Reinforcement learning",
      "Unsupervised clustering",
    ],
    correctAnswer:
      "Self-attention mechanism for processing sequences in parallel",
    explanation:
      'Transformers use self-attention to weigh the importance of different parts of the input. Unlike RNNs, they process entire sequences in parallel. This is the architecture behind GPT, BERT, and other LLMs. Introduced in "Attention Is All You Need" (2017).',
    difficulty: "intermediate",
    tags: ["transformers", "attention"],
  },
  {
    id: "ai-q6",
    roadmapId: "ai-engineer",
    nodeId: "ai-nlp",
    question: "What does RAG stand for in the context of LLMs?",
    questionType: "multiple_choice",
    options: [
      "Random Access Generation",
      "Retrieval Augmented Generation",
      "Recurrent Attention Graph",
      "Rapid AI Generation",
    ],
    correctAnswer: "Retrieval Augmented Generation",
    explanation:
      "RAG retrieves relevant documents from a knowledge base and provides them as context to the LLM. This grounds responses in factual data, reduces hallucinations, and allows the model to access current information without retraining.",
    difficulty: "intermediate",
    tags: ["rag", "llm"],
  },
  {
    id: "ai-q7",
    roadmapId: "ai-engineer",
    nodeId: "ai-deployment",
    question: "What is MLOps?",
    questionType: "multiple_choice",
    options: [
      "A machine learning algorithm",
      "Practices for deploying and maintaining ML models in production",
      "A Python library for ML",
      "A cloud computing service",
    ],
    correctAnswer:
      "Practices for deploying and maintaining ML models in production",
    explanation:
      "MLOps combines ML + DevOps: model training pipelines, versioning, deployment, monitoring, and retraining. It ensures models are reliable, scalable, and maintainable in production environments.",
    difficulty: "intermediate",
    tags: ["mlops", "deployment"],
  },
  {
    id: "ai-q8",
    roadmapId: "ai-engineer",
    nodeId: "ai-ethics",
    question:
      "What is 'AI alignment' concerned with?",
    questionType: "multiple_choice",
    options: [
      "Training models faster",
      "Ensuring AI systems behave in accordance with human values and intentions",
      "Aligning data in databases",
      "Formatting AI outputs",
    ],
    correctAnswer:
      "Ensuring AI systems behave in accordance with human values and intentions",
    explanation:
      "AI alignment ensures AI systems pursue intended goals safely. Key concerns: reward hacking, specification gaming, distributional shift. Approaches: RLHF, constitutional AI, interpretability research.",
    difficulty: "advanced",
    tags: ["alignment", "safety"],
  },
];

// ═══════════════════════════════════════
// Full Stack Roadmap Questions
// ═══════════════════════════════════════

const fullstackQuestions: QuizQuestion[] = [
  {
    id: "fs-q1",
    roadmapId: "fullstack",
    nodeId: "fs-foundations",
    question:
      "What is the correct HTML5 doctype declaration?",
    questionType: "multiple_choice",
    options: [
      '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
      "<!DOCTYPE html>",
      "<html5>",
      "<?xml version='1.0'?>",
    ],
    correctAnswer: "<!DOCTYPE html>",
    explanation:
      "<!DOCTYPE html> is the HTML5 doctype declaration. It tells the browser to render the page in standards mode. Previous HTML versions had much longer doctype declarations.",
    difficulty: "beginner",
    tags: ["html", "doctype"],
  },
  {
    id: "fs-q2",
    roadmapId: "fullstack",
    nodeId: "fs-frontend",
    question:
      "What is component-based architecture?",
    questionType: "multiple_choice",
    options: [
      "Writing all code in a single file",
      "Building UIs from reusable, self-contained pieces with their own state and rendering logic",
      "Using only CSS for styling",
      "A server-side rendering pattern",
    ],
    correctAnswer:
      "Building UIs from reusable, self-contained pieces with their own state and rendering logic",
    explanation:
      "Component-based architecture breaks UIs into reusable, encapsulated pieces. Each component manages its own state, rendering, and behavior. This promotes code reuse, testability, and maintainable codebases.",
    difficulty: "beginner",
    tags: ["components", "architecture"],
  },
  {
    id: "fs-q3",
    roadmapId: "fullstack",
    nodeId: "fs-database",
    question: "What is an ORM?",
    questionType: "multiple_choice",
    options: [
      "Object Rendering Model",
      "Object-Relational Mapping — a layer that lets you interact with databases using objects",
      "Optimized Resource Manager",
      "Online Request Monitor",
    ],
    correctAnswer:
      "Object-Relational Mapping — a layer that lets you interact with databases using objects",
    explanation:
      "ORMs (Prisma, TypeORM, SQLAlchemy) let you work with database records as programming objects instead of writing raw SQL. They handle migrations, relations, and type safety.",
    difficulty: "intermediate",
    tags: ["orm", "database"],
  },
  {
    id: "fs-q4",
    roadmapId: "fullstack",
    nodeId: "fs-auth",
    question:
      "What is CORS and why is it needed?",
    questionType: "multiple_choice",
    options: [
      "A CSS framework",
      "Cross-Origin Resource Sharing — a security mechanism that controls which domains can access your API",
      "A JavaScript testing library",
      "A database connection protocol",
    ],
    correctAnswer:
      "Cross-Origin Resource Sharing — a security mechanism that controls which domains can access your API",
    explanation:
      "CORS is a browser security feature. By default, browsers block requests to different origins. CORS headers (Access-Control-Allow-Origin) explicitly allow cross-origin access. This prevents unauthorized API access.",
    difficulty: "intermediate",
    tags: ["cors", "security"],
  },
];

// ═══════════════════════════════════════
// Exports
// ═══════════════════════════════════════

export const allQuizQuestions: QuizQuestion[] = [
  ...frontendQuestions,
  ...backendQuestions,
  ...devopsQuestions,
  ...aiEngineerQuestions,
  ...fullstackQuestions,
];

export function getQuestionsForRoadmap(roadmapId: string): QuizQuestion[] {
  return allQuizQuestions.filter((q) => q.roadmapId === roadmapId);
}

export function getQuestionsForNode(
  roadmapId: string,
  nodeId: string
): QuizQuestion[] {
  return allQuizQuestions.filter(
    (q) => q.roadmapId === roadmapId && q.nodeId === nodeId
  );
}

export function getDiagnosticQuestions(
  roadmapId: string,
  count = 10
): QuizQuestion[] {
  const questions = getQuestionsForRoadmap(roadmapId);
  // Select a balanced mix: try to pick from different nodes, varied difficulty
  const nodeGroups = new Map<string, QuizQuestion[]>();
  for (const q of questions) {
    const list = nodeGroups.get(q.nodeId) || [];
    list.push(q);
    nodeGroups.set(q.nodeId, list);
  }

  const selected: QuizQuestion[] = [];
  const nodes = Array.from(nodeGroups.keys());

  // Round-robin pick from each node
  let idx = 0;
  while (selected.length < count && selected.length < questions.length) {
    const nodeId = nodes[idx % nodes.length];
    const nodeQuestions = nodeGroups.get(nodeId) || [];
    const remaining = nodeQuestions.filter((q) => !selected.includes(q));
    if (remaining.length > 0) {
      // Pick random from remaining
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      selected.push(pick);
    }
    idx++;
    // Safety: break if we've cycled through all nodes without adding
    if (idx > nodes.length * 10) break;
  }

  return selected;
}
