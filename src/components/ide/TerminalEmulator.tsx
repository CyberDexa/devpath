// ═══════════════════════════════════════
// DevPath — Terminal Emulator Component
// Simulated interactive shell for running
// commands in the browser sandbox
// ═══════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Plus,
  ChevronDown,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: number;
}

interface TerminalTab {
  id: string;
  name: string;
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  cwd: string;
  env: Record<string, string>;
}

interface TerminalEmulatorProps {
  onRunCode?: (code: string, language: string) => Promise<{ output: string[]; error: string | null }>;
  projectId?: string;
  initialCwd?: string;
  className?: string;
}

// ═══════════════════════════════════════
// File system simulation
// ═══════════════════════════════════════

const virtualFS: Record<string, string> = {
  '/home/dev/README.md': '# DevPath Project\n\nWelcome to your coding environment!\n',
  '/home/dev/package.json': '{\n  "name": "devpath-sandbox",\n  "version": "1.0.0"\n}',
};

// ═══════════════════════════════════════
// Built-in commands
// ═══════════════════════════════════════

function executeCommand(
  cmd: string,
  tab: TerminalTab,
  updateTab: (updates: Partial<TerminalTab>) => void,
  onRunCode?: (code: string, lang: string) => Promise<{ output: string[]; error: string | null }>
): TerminalLine[] {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case '':
      return [];

    case 'help':
      return [
        { type: 'info', content: '╭─────────────────────────────────────╮', timestamp: Date.now() },
        { type: 'info', content: '│ DevPath Terminal — Available Commands│', timestamp: Date.now() },
        { type: 'info', content: '├─────────────────────────────────────┤', timestamp: Date.now() },
        { type: 'output', content: '  help          Show this help message', timestamp: Date.now() },
        { type: 'output', content: '  clear         Clear the terminal', timestamp: Date.now() },
        { type: 'output', content: '  echo <text>   Print text to terminal', timestamp: Date.now() },
        { type: 'output', content: '  pwd           Print working directory', timestamp: Date.now() },
        { type: 'output', content: '  ls            List files', timestamp: Date.now() },
        { type: 'output', content: '  cd <dir>      Change directory', timestamp: Date.now() },
        { type: 'output', content: '  cat <file>    Display file contents', timestamp: Date.now() },
        { type: 'output', content: '  touch <file>  Create an empty file', timestamp: Date.now() },
        { type: 'output', content: '  mkdir <dir>   Create a directory', timestamp: Date.now() },
        { type: 'output', content: '  env           Show environment vars', timestamp: Date.now() },
        { type: 'output', content: '  export K=V    Set environment variable', timestamp: Date.now() },
        { type: 'output', content: '  node <code>   Execute JavaScript', timestamp: Date.now() },
        { type: 'output', content: '  python <code> Execute Python', timestamp: Date.now() },
        { type: 'output', content: '  date          Show current date/time', timestamp: Date.now() },
        { type: 'output', content: '  whoami        Show current user', timestamp: Date.now() },
        { type: 'output', content: '  uname         Show system info', timestamp: Date.now() },
        { type: 'output', content: '  history       Show command history', timestamp: Date.now() },
        { type: 'info', content: '╰─────────────────────────────────────╯', timestamp: Date.now() },
      ];

    case 'clear':
      updateTab({ lines: [] });
      return [];

    case 'echo':
      return [{ type: 'output', content: args.join(' '), timestamp: Date.now() }];

    case 'pwd':
      return [{ type: 'output', content: tab.cwd, timestamp: Date.now() }];

    case 'whoami':
      return [{ type: 'output', content: 'dev', timestamp: Date.now() }];

    case 'date':
      return [{ type: 'output', content: new Date().toString(), timestamp: Date.now() }];

    case 'uname':
      return [{ type: 'output', content: 'DevPath Sandbox 1.0.0 (WASM/Browser)', timestamp: Date.now() }];

    case 'ls': {
      const targetDir = args[0] ? resolvePath(tab.cwd, args[0]) : tab.cwd;
      const entries = new Set<string>();

      for (const path of Object.keys(virtualFS)) {
        if (path.startsWith(targetDir + '/')) {
          const relative = path.slice(targetDir.length + 1);
          const firstPart = relative.split('/')[0];
          entries.add(relative.includes('/') ? firstPart + '/' : firstPart);
        }
      }

      if (entries.size === 0) {
        return [{ type: 'output', content: '(empty)', timestamp: Date.now() }];
      }

      const sorted = Array.from(entries).sort((a, b) => {
        const aDir = a.endsWith('/');
        const bDir = b.endsWith('/');
        if (aDir !== bDir) return aDir ? -1 : 1;
        return a.localeCompare(b);
      });

      return sorted.map((entry) => ({
        type: 'output' as const,
        content: entry.endsWith('/')
          ? `\x1b[1;34m${entry}\x1b[0m`
          : entry,
        timestamp: Date.now(),
      }));
    }

    case 'cd': {
      if (!args[0] || args[0] === '~') {
        updateTab({ cwd: '/home/dev' });
        return [];
      }
      if (args[0] === '..') {
        const parent = tab.cwd.split('/').slice(0, -1).join('/') || '/';
        updateTab({ cwd: parent });
        return [];
      }
      const newPath = resolvePath(tab.cwd, args[0]);
      // Check if directory exists in virtual FS
      const isDir = Object.keys(virtualFS).some((p) => p.startsWith(newPath + '/'));
      if (isDir || newPath === '/') {
        updateTab({ cwd: newPath });
        return [];
      }
      return [{ type: 'error', content: `cd: ${args[0]}: No such directory`, timestamp: Date.now() }];
    }

    case 'cat': {
      if (!args[0]) {
        return [{ type: 'error', content: 'cat: missing file operand', timestamp: Date.now() }];
      }
      const filePath = resolvePath(tab.cwd, args[0]);
      if (virtualFS[filePath]) {
        return virtualFS[filePath].split('\n').map((line) => ({
          type: 'output' as const,
          content: line,
          timestamp: Date.now(),
        }));
      }
      return [{ type: 'error', content: `cat: ${args[0]}: No such file`, timestamp: Date.now() }];
    }

    case 'touch': {
      if (!args[0]) {
        return [{ type: 'error', content: 'touch: missing file operand', timestamp: Date.now() }];
      }
      const filePath = resolvePath(tab.cwd, args[0]);
      if (!virtualFS[filePath]) {
        virtualFS[filePath] = '';
      }
      return [{ type: 'success', content: `Created ${args[0]}`, timestamp: Date.now() }];
    }

    case 'mkdir': {
      if (!args[0]) {
        return [{ type: 'error', content: 'mkdir: missing directory operand', timestamp: Date.now() }];
      }
      const dirPath = resolvePath(tab.cwd, args[0]);
      virtualFS[dirPath + '/.keep'] = '';
      return [{ type: 'success', content: `Created directory ${args[0]}`, timestamp: Date.now() }];
    }

    case 'env':
      return Object.entries(tab.env).map(([k, v]) => ({
        type: 'output' as const,
        content: `${k}=${v}`,
        timestamp: Date.now(),
      }));

    case 'export': {
      const assignment = args.join(' ');
      const eqIdx = assignment.indexOf('=');
      if (eqIdx === -1) {
        return [{ type: 'error', content: 'Usage: export KEY=VALUE', timestamp: Date.now() }];
      }
      const key = assignment.slice(0, eqIdx);
      const value = assignment.slice(eqIdx + 1).replace(/^['"]|['"]$/g, '');
      updateTab({ env: { ...tab.env, [key]: value } });
      return [];
    }

    case 'history':
      return tab.history.map((cmd, i) => ({
        type: 'output' as const,
        content: `  ${String(i + 1).padStart(4)}  ${cmd}`,
        timestamp: Date.now(),
      }));

    case 'node': {
      if (!args[0]) {
        return [{ type: 'info', content: 'Usage: node -e "code" or node <filename>', timestamp: Date.now() }];
      }
      if (args[0] === '-e' && args.length > 1) {
        const code = args.slice(1).join(' ').replace(/^['"]|['"]$/g, '');
        // Will be handled async by the caller
        return [{ type: 'info', content: `Executing: ${code}`, timestamp: Date.now() }];
      }
      const filePath = resolvePath(tab.cwd, args[0]);
      if (virtualFS[filePath]) {
        return [{ type: 'info', content: `Running ${args[0]}...`, timestamp: Date.now() }];
      }
      return [{ type: 'error', content: `node: ${args[0]}: No such file`, timestamp: Date.now() }];
    }

    case 'python':
    case 'python3': {
      if (!args[0]) {
        return [{ type: 'info', content: 'Usage: python -c "code" or python <filename>', timestamp: Date.now() }];
      }
      if (args[0] === '-c' && args.length > 1) {
        const code = args.slice(1).join(' ').replace(/^['"]|['"]$/g, '');
        return [{ type: 'info', content: `Executing: ${code}`, timestamp: Date.now() }];
      }
      return [{ type: 'info', content: 'Running Python...', timestamp: Date.now() }];
    }

    case 'npm':
      return [
        { type: 'info', content: `npm ${args.join(' ')}`, timestamp: Date.now() },
        { type: 'output', content: 'npm commands are simulated in this sandbox environment.', timestamp: Date.now() },
      ];

    case 'git':
      return [
        { type: 'info', content: `git ${args.join(' ')}`, timestamp: Date.now() },
        { type: 'output', content: 'git commands are simulated in this sandbox environment.', timestamp: Date.now() },
      ];

    default:
      return [{ type: 'error', content: `${command}: command not found. Type 'help' for available commands.`, timestamp: Date.now() }];
  }
}

function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) return path;
  if (path.startsWith('~')) return '/home/dev' + path.slice(1);
  const parts = [...cwd.split('/').filter(Boolean), ...path.split('/').filter(Boolean)];
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '..') resolved.pop();
    else if (part !== '.') resolved.push(part);
  }
  return '/' + resolved.join('/');
}

// ═══════════════════════════════════════
// Terminal Emulator Component
// ═══════════════════════════════════════

export default function TerminalEmulator({
  onRunCode,
  projectId,
  initialCwd = '/home/dev',
  className = '',
}: TerminalEmulatorProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'term-1',
      name: 'Terminal 1',
      lines: [
        {
          type: 'info',
          content: 'DevPath Terminal v1.0.0 — Type "help" for commands',
          timestamp: Date.now(),
        },
      ],
      history: [],
      historyIndex: -1,
      cwd: initialCwd,
      env: {
        HOME: '/home/dev',
        USER: 'dev',
        SHELL: '/bin/devsh',
        PATH: '/usr/local/bin:/usr/bin',
        NODE_ENV: 'development',
      },
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('term-1');
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTab?.lines]);

  const updateTab = useCallback(
    (tabId: string, updates: Partial<TerminalTab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const handleCommand = useCallback(
    async (cmd: string) => {
      if (!activeTab) return;

      // Add command to history
      const newHistory = [...activeTab.history, cmd];
      const inputLine: TerminalLine = {
        type: 'input',
        content: `${activeTab.cwd.replace('/home/dev', '~')} $ ${cmd}`,
        timestamp: Date.now(),
      };

      // Execute the command
      const tabUpdater = (updates: Partial<TerminalTab>) => {
        updateTab(activeTab.id, updates);
      };

      const outputLines = executeCommand(cmd, activeTab, tabUpdater, onRunCode);

      // Handle async code execution commands
      const parts = cmd.trim().split(/\s+/);
      const command = parts[0]?.toLowerCase();

      if (
        onRunCode &&
        ((command === 'node' && parts[1] === '-e') ||
          ((command === 'python' || command === 'python3') && parts[1] === '-c'))
      ) {
        const code = parts.slice(2).join(' ').replace(/^['"]|['"]$/g, '');
        const lang = command === 'node' ? 'javascript' : 'python';

        updateTab(activeTab.id, {
          lines: [...activeTab.lines, inputLine, ...outputLines],
          history: newHistory,
          historyIndex: -1,
        });

        try {
          const result = await onRunCode(code, lang);
          const resultLines: TerminalLine[] = [];

          if (result.output.length > 0) {
            result.output.forEach((line) => {
              resultLines.push({ type: 'output', content: line, timestamp: Date.now() });
            });
          }
          if (result.error) {
            resultLines.push({ type: 'error', content: result.error, timestamp: Date.now() });
          }

          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTab.id
                ? { ...t, lines: [...t.lines, ...resultLines] }
                : t
            )
          );
        } catch (err: any) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTab.id
                ? {
                    ...t,
                    lines: [
                      ...t.lines,
                      { type: 'error', content: err.message, timestamp: Date.now() },
                    ],
                  }
                : t
            )
          );
        }
      } else {
        updateTab(activeTab.id, {
          lines: [...activeTab.lines, inputLine, ...outputLines],
          history: newHistory,
          historyIndex: -1,
        });
      }
    },
    [activeTab, onRunCode, updateTab]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeTab && activeTab.history.length > 0) {
        const newIdx =
          activeTab.historyIndex === -1
            ? activeTab.history.length - 1
            : Math.max(0, activeTab.historyIndex - 1);
        updateTab(activeTab.id, { historyIndex: newIdx });
        setInput(activeTab.history[newIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeTab) {
        const newIdx =
          activeTab.historyIndex === -1
            ? -1
            : activeTab.historyIndex + 1 >= activeTab.history.length
            ? -1
            : activeTab.historyIndex + 1;
        updateTab(activeTab.id, { historyIndex: newIdx });
        setInput(newIdx === -1 ? '' : activeTab.history[newIdx] || '');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      updateTab(activeTab.id, { lines: [] });
    } else if (e.key === 'c' && e.ctrlKey) {
      setInput('');
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? {
                ...t,
                lines: [
                  ...t.lines,
                  {
                    type: 'input',
                    content: `${t.cwd.replace('/home/dev', '~')} $ ${input}^C`,
                    timestamp: Date.now(),
                  },
                ],
              }
            : t
        )
      );
    }
  };

  const addTab = () => {
    const id = `term-${Date.now()}`;
    const newTab: TerminalTab = {
      id,
      name: `Terminal ${tabs.length + 1}`,
      lines: [
        {
          type: 'info',
          content: 'DevPath Terminal v1.0.0',
          timestamp: Date.now(),
        },
      ],
      history: [],
      historyIndex: -1,
      cwd: initialCwd,
      env: { ...activeTab.env },
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(tabs.find((t) => t.id !== tabId)?.id || tabs[0].id);
    }
  };

  const copyOutput = () => {
    const text = activeTab.lines.map((l) => l.content).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLine = (line: TerminalLine) => {
    const colors: Record<string, string> = {
      input: 'text-text',
      output: 'text-dim',
      error: 'text-rose',
      info: 'text-sky/70',
      success: 'text-teal',
    };

    // Handle simple ANSI color codes (blue for directories)
    const content = line.content
      .replace(/\x1b\[1;34m/g, '<span class="text-sky font-semibold">')
      .replace(/\x1b\[0m/g, '</span>');

    if (content.includes('<span')) {
      return (
        <div
          className={`${colors[line.type]} text-[13px] font-mono leading-relaxed whitespace-pre-wrap`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <div className={`${colors[line.type]} text-[13px] font-mono leading-relaxed whitespace-pre-wrap`}>
        {line.content}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-abyss border border-white/8 rounded-xl overflow-hidden ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface/50 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all whitespace-nowrap ${
                tab.id === activeTabId
                  ? 'bg-abyss text-teal border border-white/8'
                  : 'text-dim hover:text-text hover:bg-white/3'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <TerminalIcon size={11} />
              <span className="font-mono">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 hover:bg-white/10 rounded"
                >
                  <X size={9} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTab}
            className="p-1 rounded text-dim hover:text-teal hover:bg-teal/5 transition-all"
            title="New terminal"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={copyOutput}
            className="p-1 rounded text-dim hover:text-text hover:bg-white/5 transition-all"
            title="Copy output"
          >
            {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
          </button>
          <button
            onClick={() => updateTab(activeTab.id, { lines: [] })}
            className="p-1 rounded text-dim hover:text-text hover:bg-white/5 transition-all"
            title="Clear terminal"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-dim hover:text-text hover:bg-white/5 transition-all"
            title="Toggle fullscreen"
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {activeTab.lines.map((line, i) => (
          <div key={`${line.timestamp}-${i}`}>{renderLine(line)}</div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-0 text-[13px] font-mono mt-0.5">
          <span className="text-teal font-semibold">
            {activeTab.cwd.replace('/home/dev', '~')}
          </span>
          <span className="text-dim mx-1">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-text outline-none caret-teal"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-surface/30 border-t border-white/5 text-[10px] text-muted font-mono">
        <span>{activeTab.cwd}</span>
        <div className="flex items-center gap-2">
          <span>{activeTab.history.length} commands</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            bash
          </span>
        </div>
      </div>
    </div>
  );
}
