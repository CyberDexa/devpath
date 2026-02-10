import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Code,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  MessageSquare,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

const suggestedPrompts = [
  { icon: <Code size={16} />, label: 'Explain React hooks', category: 'Concepts' },
  { icon: <Lightbulb size={16} />, label: 'Best practices for REST APIs', category: 'Best Practices' },
  { icon: <BookOpen size={16} />, label: 'How does Docker networking work?', category: 'Deep Dive' },
  { icon: <Sparkles size={16} />, label: 'Review my code for improvements', category: 'Code Review' },
];

const mockConversations: Conversation[] = [
  { id: '1', title: 'React useEffect cleanup', lastMessage: 'The cleanup function runs when...', timestamp: new Date('2026-02-10'), messageCount: 6 },
  { id: '2', title: 'TypeScript generics explained', lastMessage: 'Generics allow you to create...', timestamp: new Date('2026-02-09'), messageCount: 4 },
  { id: '3', title: 'Docker vs Kubernetes', lastMessage: 'While Docker handles container...', timestamp: new Date('2026-02-08'), messageCount: 8 },
];

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-void)] overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-charcoal)] bg-[var(--color-abyss)]">
        <span className="text-xs text-[var(--color-steel)] font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[var(--color-steel)] hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-[var(--color-accent-teal)]" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-[var(--color-silver)] overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // Simple markdown-like rendering for code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0]?.trim() || 'code';
        const code = lines.slice(1).join('\n');
        return <CodeBlock key={i} code={code} language={lang} />;
      }
      // Handle inline code
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((ip, j) =>
            ip.startsWith('`') && ip.endsWith('`') ? (
              <code key={j} className="px-1.5 py-0.5 rounded bg-[var(--color-charcoal)] text-[var(--color-accent-teal)] text-xs font-mono">
                {ip.slice(1, -1)}
              </code>
            ) : (
              <span key={j}>{ip}</span>
            )
          )}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex gap-3 max-w-4xl', isUser ? 'ml-auto flex-row-reverse' : '')}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
          isUser
            ? 'bg-[var(--color-charcoal)]'
            : 'bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20'
        )}
      >
        {isUser ? (
          <User size={14} className="text-[var(--color-silver)]" />
        ) : (
          <Bot size={14} className="text-[var(--color-accent-teal)]" />
        )}
      </div>

      {/* Content */}
      <div
        className={clsx(
          'rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed',
          isUser
            ? 'bg-[var(--color-accent-teal)] text-[var(--color-void)] rounded-tr-md'
            : 'bg-[var(--color-obsidian)] border border-[var(--color-charcoal)] text-[var(--color-silver)] rounded-tl-md'
        )}
      >
        {renderContent(message.content)}
        <div className={clsx('text-[10px] mt-2', isUser ? 'text-[var(--color-void)]/60' : 'text-[var(--color-steel)]')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-[var(--color-accent-teal)]" />
      </div>
      <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-[var(--color-obsidian)] border border-[var(--color-charcoal)]">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--color-steel)]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Simulated AI responses
const aiResponses: Record<string, string> = {
  'default': `Great question! Let me help you with that.\n\nHere's a brief explanation:\n\n1. **Understand the concept** — Break it down into smaller pieces\n2. **Practice with examples** — The best way to learn is by doing\n3. **Build a project** — Apply your knowledge in a real-world scenario\n\nWould you like me to dive deeper into any of these areas?`,
  'react': `**React Hooks** are functions that let you use state and other React features in functional components.\n\nHere's a quick example of \`useState\`:\n\n\`\`\`typescript\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}\n\`\`\`\n\nKey hooks to learn:\n- \`useState\` — Manage local state\n- \`useEffect\` — Handle side effects\n- \`useCallback\` — Memoize functions\n- \`useMemo\` — Memoize values\n- \`useRef\` — Persist values without re-renders\n\nWant me to explain any of these in detail?`,
  'api': `**REST API Best Practices:**\n\n1. **Use proper HTTP methods** — GET, POST, PUT, DELETE, PATCH\n2. **Consistent naming** — Use plural nouns: \`/users\`, \`/posts\`\n3. **Version your API** — \`/api/v1/users\`\n4. **Proper status codes** — 200, 201, 400, 404, 500\n5. **Pagination** — Always paginate list endpoints\n\n\`\`\`typescript\n// Express example\napp.get('/api/v1/users', async (req, res) => {\n  const { page = 1, limit = 20 } = req.query;\n  const users = await User.findAll({\n    offset: (page - 1) * limit,\n    limit,\n  });\n  res.json({ data: users, page, limit });\n});\n\`\`\`\n\nShall I go deeper into authentication or error handling?`,
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('react') || lower.includes('hook')) return aiResponses.react;
  if (lower.includes('api') || lower.includes('rest')) return aiResponses.api;
  return aiResponses.default;
}

export function AiTutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [conversations, setConversations] = useState(mockConversations);
  const [questionsToday, setQuestionsToday] = useState(7);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setQuestionsToday((q) => q + 1);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 1000);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-[var(--color-charcoal)] bg-[var(--color-abyss)] overflow-hidden shrink-0"
          >
            <div className="p-4 h-full flex flex-col">
              {/* New chat button */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--color-charcoal)] text-sm text-[var(--color-silver)] hover:border-[var(--color-accent-teal)]/40 hover:text-[var(--color-accent-teal)] transition-all mb-4"
              >
                <Plus size={16} />
                New conversation
              </button>

              {/* Usage indicator */}
              <div className="px-3 py-2 rounded-lg bg-[var(--color-obsidian)] border border-[var(--color-charcoal)] mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--color-steel)]">Questions today</span>
                  <span className="text-[var(--color-silver)]">{questionsToday}/10</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-charcoal)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent-teal)] transition-all"
                    style={{ width: `${Math.min((questionsToday / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-steel)] mt-1.5">
                  <a href="/pricing" className="text-[var(--color-accent-teal)] hover:underline">Upgrade to Pro</a> for unlimited
                </p>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-steel)] px-2 mb-2">Recent</p>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-silver)] text-xs font-medium truncate">{conv.title}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-[var(--color-steel)] hover:text-[var(--color-rose)] transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--color-steel)] truncate mt-0.5">{conv.lastMessage}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-charcoal)] bg-[var(--color-abyss)]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-lg text-[var(--color-steel)] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <MessageSquare size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[var(--color-accent-teal)]/10 flex items-center justify-center">
                <Sparkles size={12} className="text-[var(--color-accent-teal)]" />
              </div>
              <span className="text-sm font-medium text-white">AI Tutor</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)]">
                Hybrid AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-steel)] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/20 flex items-center justify-center mb-6">
                <Bot size={28} className="text-[var(--color-accent-teal)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Hi! I'm your AI tutor</h2>
              <p className="text-[var(--color-steel)] text-center mb-8 max-w-md">
                Ask me anything about programming — concepts, code review, debugging, best practices, or career advice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.label)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] hover:border-[var(--color-accent-teal)]/30 hover:bg-[var(--color-accent-teal)]/[0.03] transition-all text-left group"
                  >
                    <span className="text-[var(--color-steel)] group-hover:text-[var(--color-accent-teal)] transition-colors">
                      {prompt.icon}
                    </span>
                    <div>
                      <p className="text-sm text-[var(--color-silver)] group-hover:text-white transition-colors">{prompt.label}</p>
                      <p className="text-[10px] text-[var(--color-steel)]">{prompt.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="space-y-5 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-6 pb-6 pt-2">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] focus-within:border-[var(--color-accent-teal)] focus-within:shadow-[0_0_0_3px_rgba(0,229,160,0.1)] transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about programming..."
                rows={1}
                className="w-full bg-transparent px-5 py-4 pr-14 text-sm text-white placeholder:text-[var(--color-steel)] outline-none resize-none leading-relaxed max-h-32"
                style={{ minHeight: '3.25rem' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className={clsx(
                  'absolute right-3 bottom-3 p-2 rounded-lg transition-all',
                  input.trim() && !isTyping
                    ? 'bg-[var(--color-accent-teal)] text-[var(--color-void)] hover:brightness-110'
                    : 'bg-[var(--color-charcoal)] text-[var(--color-steel)] cursor-not-allowed'
                )}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-[var(--color-steel)] text-center mt-2">
              AI tutor powered by Claude & GPT. Responses may not always be accurate — verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
