// ═══════════════════════════════════════
// DevPath — Monaco IDE Component
// Full IDE with syntax highlighting,
// real execution, test runner, AI review,
// and version history
// ═══════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  FileCode2,
  Maximize2,
  Minimize2,
  Settings2,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Braces,
  History,
  Save,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Eye,
  ArrowUpDown,
  Gauge,
  Shield,
  BookOpen,
  X,
} from 'lucide-react';
import {
  runCode as executeCode,
  runTests as executeTests,
  type ExecutionResult,
  type TestResult as RunnerTestResult,
  type TestSuiteResult,
} from '../../lib/code-runner';
import {
  getAICodeReview,
  type CodeReview,
} from '../../lib/code-review';
import {
  getVersions,
  saveVersion,
  restoreVersion,
  deleteVersion,
  computeDiff,
  getDiffStats,
  formatTimeAgo,
  type CodeVersion,
  type DiffLine,
} from '../../lib/version-history';
import { getProjectTests } from '../../data/project-tests';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface MonacoIDEProps {
  projectId: string;
  initialCode?: string;
  language?: string;
  fileName?: string;
  onSubmit?: (code: string) => void;
  readOnly?: boolean;
}

type TabKey = 'output' | 'tests' | 'ai-review' | 'history';

// ═══════════════════════════════════════
// Language Mapping
// ═══════════════════════════════════════

const languageMap: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yaml',
  markdown: 'markdown',
  jsx: 'javascript',
  tsx: 'typescript',
};

const fileExtension: Record<string, string> = {
  javascript: 'js',
  typescript: 'tsx',
  python: 'py',
  html: 'html',
  css: 'css',
  yaml: 'yml',
};

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function MonacoIDE({
  projectId,
  initialCode = '// Start coding here\n',
  language = 'javascript',
  fileName,
  onSubmit,
  readOnly = false,
}: MonacoIDEProps) {
  // ── State ──
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [testSuiteResult, setTestSuiteResult] = useState<TestSuiteResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('output');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [minimap, setMinimap] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  // AI Review state
  const [aiReview, setAiReview] = useState<CodeReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Version history
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [showDiff, setShowDiff] = useState<string | null>(null);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  // Editor ref
  const editorRef = useRef<any>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived
  const resolvedFileName = fileName || `solution.${fileExtension[language] || 'js'}`;
  const monacoLang = languageMap[language] || 'javascript';
  const projectTestData = getProjectTests(projectId);
  const testCases = projectTestData?.testCases || [];

  // ── Load versions on mount ──
  useEffect(() => {
    setVersions(getVersions(projectId));
  }, [projectId]);

  // ── Auto-save every 30 seconds ──
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (code !== initialCode && code.trim().length > 0) {
        saveVersion(projectId, code, language, undefined, true);
        setVersions(getVersions(projectId));
      }
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [code, projectId, language, initialCode]);

  // ── Monaco Editor Mount ──
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Custom dark theme matching our design system
    monaco.editor.defineTheme('devpath-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: 'c3e88d' },
        { token: 'number', foreground: 'f78c6c' },
        { token: 'type', foreground: 'ffcb6b' },
        { token: 'variable', foreground: 'eeffff' },
        { token: 'function', foreground: '82aaff' },
        { token: 'operator', foreground: '89ddff' },
        { token: 'delimiter', foreground: '89ddff' },
        { token: 'tag', foreground: 'f07178' },
        { token: 'attribute.name', foreground: 'ffcb6b' },
        { token: 'attribute.value', foreground: 'c3e88d' },
      ],
      colors: {
        'editor.background': '#0a0a0f',
        'editor.foreground': '#e0e0e8',
        'editor.lineHighlightBackground': '#ffffff08',
        'editor.selectionBackground': '#00e5a030',
        'editor.inactiveSelectionBackground': '#00e5a015',
        'editorLineNumber.foreground': '#4a5568',
        'editorLineNumber.activeForeground': '#00e5a0',
        'editorIndentGuide.background': '#ffffff08',
        'editorIndentGuide.activeBackground': '#ffffff15',
        'editor.selectionHighlightBackground': '#00e5a015',
        'editorCursor.foreground': '#00e5a0',
        'editorWhitespace.foreground': '#ffffff08',
        'editorBracketMatch.background': '#00e5a020',
        'editorBracketMatch.border': '#00e5a050',
        'scrollbarSlider.background': '#ffffff10',
        'scrollbarSlider.hoverBackground': '#ffffff20',
        'scrollbarSlider.activeBackground': '#ffffff30',
      },
    });

    monaco.editor.setTheme('devpath-dark');

    // Keyboard shortcuts
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRunCode(),
    });

    editor.addAction({
      id: 'save-submit',
      label: 'Submit Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const currentCode = editor.getValue();
        onSubmit?.(currentCode);
      },
    });

    editor.addAction({
      id: 'save-snapshot',
      label: 'Save Snapshot',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      run: () => handleSaveSnapshot(),
    });

    // Focus the editor
    editor.focus();
  };

  // ═══════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveTab('output');
    setOutput(['Running code...']);
    setOutputError(null);

    try {
      const result: ExecutionResult = await executeCode(code, language);
      setOutput(result.output);
      setOutputError(result.error);

      // Add execution metadata
      const meta = `\n─── Execution completed in ${result.executionTimeMs}ms ───`;
      setOutput((prev) => [...prev, meta]);
    } catch (err: any) {
      setOutput([]);
      setOutputError(err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const handleRunTests = useCallback(async () => {
    if (testCases.length === 0) {
      setActiveTab('tests');
      return;
    }
    setIsTesting(true);
    setActiveTab('tests');
    setTestSuiteResult(null);

    try {
      const result = await executeTests(code, language, testCases);
      setTestSuiteResult(result);
    } catch (err: any) {
      setTestSuiteResult({
        results: [],
        passed: 0,
        failed: 0,
        total: 0,
        totalTimeMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  }, [code, language, testCases]);

  const handleAIReview = useCallback(async () => {
    setIsReviewing(true);
    setActiveTab('ai-review');
    setAiReview(null);

    try {
      const review = await getAICodeReview(code, language, projectId);
      setAiReview(review);
    } catch {
      // fallback handled inside getAICodeReview
    } finally {
      setIsReviewing(false);
    }
  }, [code, language, projectId]);

  const handleSaveSnapshot = useCallback(() => {
    saveVersion(projectId, code, language, `Manual save`);
    setVersions(getVersions(projectId));
  }, [projectId, code, language]);

  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      const restored = restoreVersion(projectId, versionId);
      if (restored !== null) {
        setCode(restored);
        editorRef.current?.setValue(restored);
      }
    },
    [projectId]
  );

  const handleViewDiff = useCallback(
    (versionId: string) => {
      const versions = getVersions(projectId);
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        const diff = computeDiff(version.code, code);
        setDiffLines(diff);
        setShowDiff(versionId);
      }
    },
    [projectId, code]
  );

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const resetCode = useCallback(() => {
    setCode(initialCode);
    editorRef.current?.setValue(initialCode);
    setOutput([]);
    setOutputError(null);
    setTestSuiteResult(null);
    setAiReview(null);
  }, [initialCode]);

  // ═══════════════════════════════════════
  // Render
  // ═══════════════════════════════════════

  return (
    <div
      className={`flex flex-col bg-abyss border border-white/8 rounded-2xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* ── Toolbar ── */}
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
            <span className="text-xs font-mono text-dim">{resolvedFileName}</span>
          </div>

          <span className="text-xs text-muted uppercase tracking-wider">{language}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Run */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 disabled:opacity-50 transition-all"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </button>

          {/* Test */}
          <button
            onClick={handleRunTests}
            disabled={isTesting || testCases.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet/10 text-violet border border-violet/20 hover:bg-violet/15 disabled:opacity-50 transition-all"
            title={testCases.length === 0 ? 'No test cases for this project' : `Run ${testCases.length} tests`}
          >
            {isTesting ? <Loader2 size={12} className="animate-spin" /> : <Braces size={12} />}
            Test{testCases.length > 0 && ` (${testCases.length})`}
          </button>

          {/* AI Review */}
          <button
            onClick={handleAIReview}
            disabled={isReviewing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber/10 text-amber border border-amber/20 hover:bg-amber/15 disabled:opacity-50 transition-all"
          >
            {isReviewing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Review
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Snapshot */}
          <button
            onClick={handleSaveSnapshot}
            className="p-1.5 rounded-lg text-dim hover:text-teal hover:bg-teal/5 transition-all"
            title="Save snapshot (⌘+⇧+S)"
          >
            <Save size={14} />
          </button>

          {/* Copy */}
          <button onClick={copyCode} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Copy code">
            {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
          </button>

          {/* Reset */}
          <button onClick={resetCode} className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all" title="Reset to starter code">
            <RotateCcw size={14} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all"
            title="Editor settings"
          >
            <Settings2 size={14} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
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
                  {[12, 13, 14, 15, 16, 18, 20].map((s) => (
                    <option key={s} value={s}>
                      {s}px
                    </option>
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
                    <option key={s} value={s}>
                      {s}
                    </option>
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
                  checked={minimap}
                  onChange={(e) => setMinimap(e.target.checked)}
                  className="accent-teal"
                />
                Minimap
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 min-h-[350px] max-h-[500px]">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          theme="devpath-dark"
          options={{
            fontSize,
            tabSize,
            wordWrap: wordWrap ? 'on' : 'off',
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            cursorBlinking: 'smooth',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            folding: true,
            foldingHighlight: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'General Sans', monospace",
            fontLigatures: true,
            readOnly,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-abyss text-dim text-sm">
              <Loader2 size={20} className="animate-spin mr-2 text-teal" />
              Loading editor...
            </div>
          }
        />
      </div>

      {/* ── Output Panel ── */}
      <div className="border-t border-white/5">
        {/* Tab Bar */}
        <div className="flex items-center gap-0 bg-surface/30 border-b border-white/5">
          {(
            [
              { key: 'output' as const, label: 'Output', icon: Terminal },
              {
                key: 'tests' as const,
                label: `Tests${testSuiteResult ? ` (${testSuiteResult.passed}/${testSuiteResult.total})` : testCases.length > 0 ? ` (${testCases.length})` : ''}`,
                icon: Braces,
              },
              { key: 'ai-review' as const, label: 'AI Review', icon: Sparkles },
              {
                key: 'history' as const,
                label: `History${versions.length > 0 ? ` (${versions.length})` : ''}`,
                icon: History,
              },
            ] as { key: TabKey; label: string; icon: any }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-teal text-teal bg-teal/5'
                  : 'border-transparent text-dim hover:text-text'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}

          <span className="ml-auto pr-4 text-[10px] text-muted hidden md:block">
            ⌘+Enter to Run &nbsp;|&nbsp; ⌘+S to Submit &nbsp;|&nbsp; ⌘+⇧+S to Snapshot
          </span>
        </div>

        {/* Tab Content */}
        <div className="h-48 overflow-y-auto p-4 font-mono text-sm">
          {/* Output Tab */}
          {activeTab === 'output' && (
            <div>
              {output.length === 0 && !outputError ? (
                <p className="text-muted italic font-sans">Click "Run" to execute your code...</p>
              ) : isRunning ? (
                <div className="flex items-center gap-2 text-dim">
                  <Loader2 size={14} className="animate-spin" />
                  Executing...
                </div>
              ) : (
                <>
                  {output.map((line, i) => (
                    <div
                      key={i}
                      className={`${
                        line.startsWith('✓') || line.startsWith('───')
                          ? 'text-teal'
                          : line.startsWith('✗')
                          ? 'text-rose'
                          : line.startsWith('⚠')
                          ? 'text-amber'
                          : 'text-dim'
                      }`}
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                  {outputError && (
                    <div className="mt-2 p-3 rounded-lg bg-rose/5 border border-rose/20">
                      <div className="flex items-center gap-2 text-rose font-semibold text-xs mb-1">
                        <XCircle size={14} />
                        Error
                      </div>
                      <pre className="text-rose/80 text-xs whitespace-pre-wrap">{outputError}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <div>
              {testCases.length === 0 ? (
                <p className="text-muted italic font-sans">
                  No test cases defined for this project yet. Check back soon!
                </p>
              ) : !testSuiteResult && !isTesting ? (
                <p className="text-muted italic font-sans">
                  Click "Test" to run {testCases.length} test case{testCases.length !== 1 ? 's' : ''}...
                </p>
              ) : isTesting ? (
                <div className="flex items-center gap-2 text-dim">
                  <Loader2 size={14} className="animate-spin" />
                  Running test suite...
                </div>
              ) : testSuiteResult ? (
                <div className="space-y-2">
                  {/* Summary */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/5 mb-3">
                    {testSuiteResult.passed === testSuiteResult.total ? (
                      <span className="flex items-center gap-1.5 text-teal font-semibold font-sans">
                        <CheckCircle2 size={16} />
                        All {testSuiteResult.total} tests passed!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber font-semibold font-sans">
                        <AlertTriangle size={16} />
                        {testSuiteResult.passed}/{testSuiteResult.total} tests passed
                      </span>
                    )}
                    <span className="text-[10px] text-muted ml-auto">
                      {testSuiteResult.totalTimeMs}ms total
                    </span>
                  </div>

                  {testSuiteResult.results.map((test, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2.5 rounded-lg ${
                        test.passed ? 'bg-teal/5' : 'bg-rose/5'
                      }`}
                    >
                      {test.passed ? (
                        <CheckCircle2 size={14} className="text-teal mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-rose mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-sans ${test.passed ? 'text-teal' : 'text-rose'}`}>
                          {test.name}
                        </span>
                        {!test.passed && (
                          <div className="mt-1.5 text-[11px] space-y-0.5">
                            <div className="text-dim">
                              Expected: <span className="text-teal">{test.expected}</span>
                            </div>
                            <div className="text-dim">
                              Got: <span className="text-rose">{test.actual}</span>
                            </div>
                            {test.error && (
                              <div className="text-rose/70 mt-1">{test.error}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted flex-shrink-0">{test.timeMs}ms</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* AI Review Tab */}
          {activeTab === 'ai-review' && (
            <div>
              {!aiReview && !isReviewing ? (
                <p className="text-muted italic font-sans">
                  Click "AI Review" for intelligent code analysis...
                </p>
              ) : isReviewing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-dim font-sans">
                    <Sparkles size={14} className="text-amber animate-pulse" />
                    AI is reviewing your code...
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
                    ))}
                  </div>
                </div>
              ) : aiReview ? (
                <div className="space-y-4 font-sans">
                  {/* Score Header */}
                  <div className="flex items-center gap-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-2xl font-display font-bold ${
                          aiReview.score >= 8 ? 'text-teal' : aiReview.score >= 6 ? 'text-amber' : 'text-rose'
                        }`}
                      >
                        {aiReview.score}/10
                      </div>
                      <span className="text-xs text-muted">Overall</span>
                    </div>
                    <div className="flex gap-3 ml-auto">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-xs text-dim">
                          <Eye size={10} /> Readability
                        </div>
                        <div className="text-sm font-semibold text-text">{aiReview.readabilityScore}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-xs text-dim">
                          <ArrowUpDown size={10} /> Maintainability
                        </div>
                        <div className="text-sm font-semibold text-text">{aiReview.maintainabilityScore}/10</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-dim">{aiReview.summary}</p>

                  {/* Strengths */}
                  {aiReview.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-teal mb-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Strengths
                      </h4>
                      {aiReview.strengths.map((s, i) => (
                        <div key={i} className="text-xs text-dim pl-4 py-0.5">
                          • {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improvements */}
                  {aiReview.improvements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber mb-1.5 flex items-center gap-1">
                        <AlertTriangle size={12} /> Improvements
                      </h4>
                      {aiReview.improvements.map((s, i) => (
                        <div key={i} className="text-xs text-dim pl-4 py-0.5">
                          {i + 1}. {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Smells */}
                  {aiReview.codeSmells.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-rose mb-1.5 flex items-center gap-1">
                        <Gauge size={12} /> Code Smells
                      </h4>
                      {aiReview.codeSmells.map((smell, i) => (
                        <div key={i} className="text-xs pl-4 py-1 border-l-2 border-rose/20 ml-1 mb-1">
                          {smell.line && <span className="text-muted">Line {smell.line}: </span>}
                          <span className="text-rose/80">{smell.issue}</span>
                          <div className="text-dim mt-0.5">→ {smell.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security */}
                  {aiReview.securityIssues.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-rose mb-1.5 flex items-center gap-1">
                        <Shield size={12} /> Security Issues
                      </h4>
                      {aiReview.securityIssues.map((s, i) => (
                        <div key={i} className="text-xs text-rose/80 pl-4 py-0.5">
                          ⚠ {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Performance */}
                  {aiReview.performanceTips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-violet mb-1.5 flex items-center gap-1">
                        <Gauge size={12} /> Performance Tips
                      </h4>
                      {aiReview.performanceTips.map((s, i) => (
                        <div key={i} className="text-xs text-dim pl-4 py-0.5">
                          💡 {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {versions.length === 0 ? (
                <p className="text-muted italic font-sans">
                  No saved versions yet. Code is auto-saved every 30 seconds, or press ⌘+⇧+S to save manually.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {/* Diff overlay */}
                  {showDiff && (
                    <div className="mb-4 border border-white/10 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-surface/50 border-b border-white/5">
                        <span className="text-xs text-dim flex items-center gap-1.5">
                          <GitBranch size={12} className="text-violet" />
                          Diff view
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          {(() => {
                            const stats = getDiffStats(diffLines);
                            return (
                              <>
                                <span className="text-teal">+{stats.added}</span>
                                <span className="text-rose">-{stats.removed}</span>
                              </>
                            );
                          })()}
                          <button
                            onClick={() => setShowDiff(null)}
                            className="p-0.5 rounded hover:bg-white/5"
                          >
                            <X size={12} className="text-dim" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto text-[11px] font-mono">
                        {diffLines.slice(0, 100).map((line, i) => (
                          <div
                            key={i}
                            className={`px-3 py-0.5 ${
                              line.type === 'added'
                                ? 'bg-teal/8 text-teal/80'
                                : line.type === 'removed'
                                ? 'bg-rose/8 text-rose/80'
                                : 'text-muted/50'
                            }`}
                          >
                            <span className="inline-block w-4 text-right mr-2 opacity-50">
                              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                            </span>
                            {line.content || ' '}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {[...versions].reverse().map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-surface/30 hover:bg-surface/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text truncate">
                            {version.label}
                          </span>
                          {version.autoSave && (
                            <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-muted">
                              auto
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted">
                          {formatTimeAgo(version.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewDiff(version.id)}
                          className="p-1 rounded text-dim hover:text-violet hover:bg-violet/5 transition-all"
                          title="View diff"
                        >
                          <GitBranch size={12} />
                        </button>
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="p-1 rounded text-dim hover:text-teal hover:bg-teal/5 transition-all"
                          title="Restore this version"
                        >
                          <History size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface/30 border-t border-white/5 text-[11px] text-muted">
        <div className="flex items-center gap-3">
          <span>
            Ln {code.split('\n').length}, Col 1
          </span>
          <span>{language}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Spaces: {tabSize}</span>
          <span>{code.length} chars</span>
          {versions.length > 0 && (
            <span className="flex items-center gap-1">
              <History size={10} />
              {versions.length} snapshots
            </span>
          )}
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
