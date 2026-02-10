// ═══════════════════════════════════════
// DevPath — AI Tutor Service
// Handles streaming AI responses from Claude/GPT
// Falls back to smart template responses when API keys aren't configured
// ═══════════════════════════════════════

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are DevPath AI Tutor — an expert programming instructor and mentor. Your role is to help developers learn and grow.

Guidelines:
- Be concise but thorough. Use markdown formatting with headers, lists, and code blocks.
- When explaining concepts, use practical code examples in the user's preferred language.
- Format code blocks with the language specified: \`\`\`typescript, \`\`\`python, etc.
- Break complex topics into numbered steps.
- Encourage practice by suggesting exercises or projects related to the topic.
- If the user shares code, review it constructively — highlight what's good and suggest improvements.
- Always be encouraging and supportive, but honest about mistakes.
- When you don't know something, say so rather than making things up.
- Keep responses focused on programming, software engineering, and developer career topics.`;

// Smart template responses for when no API key is configured
const templateResponses: Record<string, string> = {
  react: `**React Hooks** are functions that let you use state and lifecycle features in functional components.

Here's how \`useState\` works:

\`\`\`typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

**Key hooks to master:**
1. \`useState\` — Local component state
2. \`useEffect\` — Side effects (API calls, subscriptions)
3. \`useCallback\` — Memoize functions to prevent re-renders
4. \`useMemo\` — Memoize expensive computations
5. \`useRef\` — DOM references and persistent values
6. \`useContext\` — Share state across component tree

💡 **Pro tip:** Start with \`useState\` and \`useEffect\`, then learn the optimization hooks as needed.

Would you like me to dive deeper into any of these?`,

  typescript: `**TypeScript** adds static type checking to JavaScript, catching errors before runtime.

Here's a practical example:

\`\`\`typescript
// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

// Type-safe function
function getDisplayName(user: User): string {
  return \`\${user.name} (\${user.role})\`;
}

// Generics for reusable code
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}
\`\`\`

**Key TypeScript features:**
- **Interfaces & Types** — Define object shapes
- **Generics** — Write reusable, type-safe code
- **Union types** — \`string | number\`
- **Type guards** — Runtime type narrowing
- **Utility types** — \`Partial<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`

Want to explore generics or utility types further?`,

  api: `**REST API Best Practices:**

1. **Use proper HTTP methods:**
   - \`GET\` — Read resources
   - \`POST\` — Create resources
   - \`PUT/PATCH\` — Update resources
   - \`DELETE\` — Remove resources

2. **Consistent URL patterns:**
\`\`\`
GET    /api/v1/users          # List users
GET    /api/v1/users/:id      # Get one user
POST   /api/v1/users          # Create user
PATCH  /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user
\`\`\`

3. **Proper status codes:**
\`\`\`typescript
app.post('/api/v1/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    if (err.code === 'DUPLICATE_KEY') {
      res.status(409).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
\`\`\`

4. **Always paginate list endpoints**
5. **Version your API** — \`/api/v1/\`
6. **Use proper authentication** (JWT, OAuth2)

Would you like to learn about authentication or error handling?`,

  docker: `**Docker** packages applications and their dependencies into portable containers.

**Core concepts:**

\`\`\`dockerfile
# Dockerfile for a Node.js app
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**Essential commands:**
\`\`\`bash
# Build an image
docker build -t my-app .

# Run a container
docker run -d -p 3000:3000 my-app

# Docker Compose for multi-service apps
docker compose up -d
\`\`\`

**Key Docker concepts:**
1. **Images** — Immutable templates
2. **Containers** — Running instances of images  
3. **Volumes** — Persistent data storage
4. **Networks** — Container communication
5. **Docker Compose** — Multi-container orchestration

💡 **Best practice:** Use multi-stage builds to reduce image size.

Want me to explain Docker Compose or Kubernetes?`,

  default: `Great question! Let me break this down for you.

**Here's a structured approach:**

1. **Understand the fundamentals** — Every complex topic is built on simpler concepts. Start there.

2. **Read the documentation** — Official docs are your best friend. They're written by the people who built it.

3. **Practice with small examples** — Before building something complex, create minimal working examples.

4. **Build a real project** — Apply what you've learned in a project that interests you. This is where real learning happens.

5. **Review and refactor** — Look at your code critically. Is it readable? Efficient? Maintainable?

\`\`\`typescript
// Example: Start simple, then iterate
// Version 1: Get it working
function add(a: number, b: number): number {
  return a + b;
}

// Version 2: Make it better
function calculate(
  operation: 'add' | 'subtract' | 'multiply',
  a: number,
  b: number
): number {
  const ops = { add: (a, b) => a + b, subtract: (a, b) => a - b, multiply: (a, b) => a * b };
  return ops[operation](a, b);
}
\`\`\`

What specific topic would you like to explore? I can help with:
- 🎨 Frontend (React, Vue, CSS, HTML)
- ⚙️ Backend (Node.js, Python, Go, databases)
- 🚀 DevOps (Docker, CI/CD, cloud)
- 🧮 Algorithms & Data Structures
- 🤖 AI/ML concepts`,
};

function getTemplateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('react') || lower.includes('hook') || lower.includes('component')) {
    return templateResponses.react;
  }
  if (lower.includes('typescript') || lower.includes('type') || lower.includes('generic')) {
    return templateResponses.typescript;
  }
  if (lower.includes('api') || lower.includes('rest') || lower.includes('endpoint')) {
    return templateResponses.api;
  }
  if (lower.includes('docker') || lower.includes('container') || lower.includes('kubernetes')) {
    return templateResponses.docker;
  }
  return templateResponses.default;
}

/**
 * Send a message to the AI tutor and get a response.
 * Tries configured AI APIs first, falls back to templates.
 */
export async function sendTutorMessage(
  messages: ChatMessage[],
  apiProvider: 'anthropic' | 'openai' | 'auto' = 'auto'
): Promise<string> {
  const anthropicKey = import.meta.env.PUBLIC_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;
  const openaiKey = import.meta.env.PUBLIC_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  // Try Anthropic Claude first (preferred)
  if ((apiProvider === 'anthropic' || apiProvider === 'auto') && anthropicKey) {
    try {
      return await callAnthropic(fullMessages, anthropicKey);
    } catch (err) {
      console.warn('Anthropic API failed, trying fallback:', err);
      if (apiProvider === 'anthropic') throw err;
    }
  }

  // Try OpenAI GPT
  if ((apiProvider === 'openai' || apiProvider === 'auto') && openaiKey) {
    try {
      return await callOpenAI(fullMessages, openaiKey);
    } catch (err) {
      console.warn('OpenAI API failed, using templates:', err);
      if (apiProvider === 'openai') throw err;
    }
  }

  // Fallback to smart templates
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  return getTemplateResponse(lastUserMsg?.content || '');
}

async function callAnthropic(messages: ChatMessage[], apiKey: string): Promise<string> {
  // Convert system message to Anthropic format
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemMsg,
      messages: chatMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'I apologize, but I was unable to generate a response. Please try again.';
}

async function callOpenAI(messages: ChatMessage[], apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
}
