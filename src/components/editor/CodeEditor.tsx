import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  FileCode2,
  Maximize2,
  Minimize2,
  Settings2,
  Sun,
  Moon,
  Download,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Braces,
} from "lucide-react";

interface TestResult {
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  time?: number;
}

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  fileName?: string;
  testCases?: { name: string; input: string; expected: string }[];
  onSubmit?: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  initialCode = "// Start coding here\n",
  language = "javascript",
  fileName = "solution.js",
  testCases = [],
  onSubmit,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "tests" | "ai-review">("output");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;

  // Sync scroll between line numbers and textarea
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineCountRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle tab key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const indent = " ".repeat(tabSize);

        if (e.shiftKey) {
          // Unindent
          const beforeCursor = code.substring(0, start);
          const lastNewline = beforeCursor.lastIndexOf("\n");
          const lineStart = lastNewline + 1;
          const lineContent = code.substring(lineStart, start);

          if (lineContent.startsWith(indent)) {
            const newCode = code.substring(0, lineStart) + code.substring(lineStart + tabSize);
            setCode(newCode);
            setTimeout(() => {
              target.selectionStart = target.selectionEnd = start - tabSize;
            });
          }
        } else {
          const newCode = code.substring(0, start) + indent + code.substring(end);
          setCode(newCode);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + tabSize;
          });
        }
      }

      // Auto-close brackets
      const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
      if (pairs[e.key]) {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newCode = code.substring(0, start) + e.key + code.substring(start, end) + pairs[e.key] + code.substring(end);
        setCode(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        });
      }

      // Cmd/Ctrl + Enter to run
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }

      // Cmd/Ctrl + S to save/submit
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSubmit?.(code);
      }
    },
    [code, tabSize, onSubmit]
  );

  // Simulate code execution
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setActiveTab("output");
    setOutput(["Running code...", ""]);

    // Simulated delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    setOutput([
      `$ node ${fileName}`,
      "",
      "✓ Code compiled successfully",
      "",
      "Output:",
      "───────────────────────────",
      "Hello, World!",
      '{ status: "success", data: [...] }',
      "",
      `Execution time: ${(Math.random() * 50 + 10).toFixed(1)}ms`,
      `Memory: ${(Math.random() * 5 + 1).toFixed(1)}MB`,
    ]);
    setIsRunning(false);
  }, [fileName]);

  // Simulate test execution
  const runTests = useCallback(async () => {
    setIsTesting(true);
    setActiveTab("tests");
    setTestResults([]);

    await new Promise((r) => setTimeout(r, 1200));

    const results: TestResult[] = [
      { name: "Basic input returns correct output", passed: true, time: 3 },
      { name: "Handles empty input", passed: true, time: 1 },
      { name: "Edge case: large dataset", passed: true, time: 12 },
      { name: "Performance test (1000 iterations)", passed: Math.random() > 0.3, time: 45, expected: "< 100ms", actual: Math.random() > 0.3 ? "45ms" : "152ms" },
      { name: "Memory efficiency", passed: true, time: 8 },
      { name: "Concurrent access", passed: Math.random() > 0.4, time: 23, expected: "No race conditions", actual: Math.random() > 0.4 ? "Thread-safe" : "Race condition detected" },
    ];

    setTestResults(results);
    setIsTesting(false);
  }, []);

  // Simulate AI review
  const requestAiReview = useCallback(async () => {
    setIsReviewing(true);
    setActiveTab("ai-review");
    setAiReview(null);

    await new Promise((r) => setTimeout(r, 2000));

    setAiReview(
      `## Code Review Summary

**Overall Score: 8/10** ⭐

### Strengths
- Clean code structure and good naming conventions
- Proper error handling patterns
- Efficient algorithm choice

### Suggestions

1. **Performance**: Consider using a \`Map\` instead of an object for O(1) lookups. This would improve performance for large datasets.

2. **Type Safety**: Add TypeScript generics to make the function more reusable:
\`\`\`typescript
function process<T extends Record<string, unknown>>(data: T[]): T[]
\`\`\`

3. **Edge Cases**: Add null checks for the input parameters. Currently the function would throw if called with \`undefined\`.

4. **Testing**: Consider adding property-based tests using a library like \`fast-check\` for better coverage.

### What You Did Well
- ✅ Single responsibility principle
- ✅ Immutable data patterns
- ✅ Clear documentation comments`
    );
    setIsReviewing(false);
  }, []);

  // Copy code
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Reset code
  const resetCode = useCallback(() => {
    setCode(initialCode);
    setOutput([]);
    setTestResults([]);
    setAiReview(null);
  }, [initialCode]);

  const passedTests = testResults.filter((t) => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div
      className={`flex flex-col bg-abyss border border-white/8 rounded-2xl overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose/60 hover:bg-rose transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber/60 hover:bg-amber transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-teal/60 hover:bg-teal transition-colors cursor-pointer" />
          </div>

          {/* File tab */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-abyss rounded-lg border border-white/5">
            <FileCode2 size={14} className="text-teal" />
            <span className="text-xs font-mono text-dim">{fileName}</span>
          </div>

          {/* Language */}
          <span className="text-xs text-muted uppercase tracking-wider">{language}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Run */}
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 disabled:opacity-50 transition-all"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </button>

          {/* Test */}
          <button
            onClick={runTests}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet/10 text-violet border border-violet/20 hover:bg-violet/15 disabled:opacity-50 transition-all"
          >
            {isTesting ? <Loader2 size={12} className="animate-spin" /> : <Braces size={12} />}
            Test
          </button>

          {/* AI Review */}
          <button
            onClick={requestAiReview}
            disabled={isReviewing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber/10 text-amber border border-amber/20 hover:bg-amber/15 disabled:opacity-50 transition-all"
          >
            {isReviewing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Review
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Utilities */}
          <button onClick={copyCode} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Copy code">
            {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
          </button>
          <button onClick={resetCode} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Reset code">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Settings">
            <Settings2 size={14} />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Toggle fullscreen">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-surface/30 text-xs">
              <label className="flex items-center gap-2 text-dim">
                Font Size:
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                  className="bg-raised border border-white/8 rounded px-2 py-0.5 text-text"
                >
                  {[12, 13, 14, 15, 16, 18].map((s) => (
                    <option key={s} value={s}>{s}px</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-dim">
                Tab Size:
                <select
                  value={tabSize}
                  onChange={(e) => setTabSize(+e.target.value)}
                  className="bg-raised border border-white/8 rounded px-2 py-0.5 text-text"
                >
                  {[2, 4, 8].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="accent-teal"
                />
                Word Wrap
              </label>
              <label className="flex items-center gap-2 text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="accent-teal"
                />
                Line Numbers
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="flex flex-1 min-h-[300px] max-h-[500px]">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div
            ref={lineCountRef}
            className="flex flex-col items-end py-4 px-3 bg-surface/20 border-r border-white/5 select-none overflow-hidden"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.6" }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i} className="font-mono text-muted/50 leading-[1.6]">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 bg-transparent text-text font-mono p-4 resize-none focus:outline-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
            tabSize,
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            overflowWrap: wordWrap ? "break-word" : "normal",
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="border-t border-white/5">
        {/* Tab Bar */}
        <div className="flex items-center gap-0 bg-surface/30 border-b border-white/5">
          {[
            { key: "output" as const, label: "Output", icon: Terminal },
            {
              key: "tests" as const,
              label: `Tests${totalTests > 0 ? ` (${passedTests}/${totalTests})` : ""}`,
              icon: Braces,
            },
            { key: "ai-review" as const, label: "AI Review", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.key
                  ? "border-teal text-teal bg-teal/5"
                  : "border-transparent text-dim hover:text-text"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}

          {/* Keyboard shortcut hint */}
          <span className="ml-auto pr-4 text-[10px] text-muted hidden md:block">
            ⌘+Enter to Run &nbsp;|&nbsp; ⌘+S to Submit
          </span>
        </div>

        {/* Tab Content */}
        <div className="h-40 overflow-y-auto p-4 font-mono text-sm">
          {activeTab === "output" && (
            <div>
              {output.length === 0 ? (
                <p className="text-muted italic">Click "Run" to execute your code...</p>
              ) : isRunning ? (
                <div className="flex items-center gap-2 text-dim">
                  <Loader2 size={14} className="animate-spin" />
                  Executing...
                </div>
              ) : (
                output.map((line, i) => (
                  <div key={i} className={`${line.startsWith("✓") ? "text-teal" : line.startsWith("✗") ? "text-rose" : "text-dim"}`}>
                    {line || "\u00A0"}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "tests" && (
            <div>
              {testResults.length === 0 ? (
                isTesting ? (
                  <div className="flex items-center gap-2 text-dim">
                    <Loader2 size={14} className="animate-spin" />
                    Running test suite...
                  </div>
                ) : (
                  <p className="text-muted italic">Click "Test" to run the test suite...</p>
                )
              ) : (
                <div className="space-y-2">
                  {/* Summary */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/5 mb-3">
                    {passedTests === totalTests ? (
                      <span className="flex items-center gap-1.5 text-teal font-semibold">
                        <CheckCircle2 size={16} />
                        All tests passed!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber font-semibold">
                        <AlertTriangle size={16} />
                        {passedTests}/{totalTests} tests passed
                      </span>
                    )}
                  </div>

                  {testResults.map((test, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2 rounded-lg ${
                        test.passed ? "bg-teal/5" : "bg-rose/5"
                      }`}
                    >
                      {test.passed ? (
                        <CheckCircle2 size={14} className="text-teal mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-rose mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs ${test.passed ? "text-teal" : "text-rose"}`}>
                          {test.name}
                        </span>
                        {!test.passed && test.expected && (
                          <div className="mt-1 text-[11px] text-dim">
                            Expected: <span className="text-teal">{test.expected}</span> | Got: <span className="text-rose">{test.actual}</span>
                          </div>
                        )}
                      </div>
                      {test.time && (
                        <span className="text-[10px] text-muted flex-shrink-0">{test.time}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai-review" && (
            <div>
              {!aiReview && !isReviewing ? (
                <p className="text-muted italic">Click "AI Review" for intelligent code analysis...</p>
              ) : isReviewing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-dim">
                    <Sparkles size={14} className="text-amber animate-pulse" />
                    AI is reviewing your code...
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-dim [&_h2]:text-text [&_h2]:font-display [&_h2]:text-base [&_h2]:mt-0 [&_h3]:text-text [&_h3]:font-display [&_h3]:text-sm [&_strong]:text-text [&_code]:text-teal [&_code]:bg-teal/8 [&_code]:px-1 [&_code]:rounded">
                  {aiReview.split("\n").map((line, i) => {
                    // Simple markdown rendering
                    if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
                    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
                    if (line.startsWith("- ✅")) return <p key={i} className="flex items-center gap-1 text-teal"><CheckCircle2 size={12} />{line.slice(4)}</p>;
                    if (line.startsWith("```")) return null;
                    if (line.trim() === "") return <br key={i} />;
                    return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/`(.*?)`/g, "<code>$1</code>")
                    }} />;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface/30 border-t border-white/5 text-[11px] text-muted">
        <div className="flex items-center gap-3">
          <span>Ln {lines.length}, Col 1</span>
          <span>{language}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Spaces: {tabSize}</span>
          <span>{code.length} chars</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}
