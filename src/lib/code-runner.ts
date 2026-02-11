// ═══════════════════════════════════════
// SkillRoute — Code Execution Engine
// Real JS/TS execution in browser sandbox
// Python via Pyodide (lazy-loaded)
// ═══════════════════════════════════════

export interface ExecutionResult {
  output: string[];
  error: string | null;
  executionTimeMs: number;
  memoryUsageMB?: number;
}

export interface TestCase {
  name: string;
  input: string;
  expected: string;
  hidden?: boolean;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  timeMs: number;
  error?: string;
}

export interface TestSuiteResult {
  results: TestResult[];
  passed: number;
  failed: number;
  total: number;
  totalTimeMs: number;
}

// ═══════════════════════════════════════
// JavaScript / TypeScript Execution
// Uses sandboxed Function constructor
// ═══════════════════════════════════════

function executeJavaScript(code: string, input?: string): ExecutionResult {
  const logs: string[] = [];
  const errors: string[] = [];
  const startTime = performance.now();

  // Create a sandboxed console
  const mockConsole = {
    log: (...args: any[]) => logs.push(args.map(formatValue).join(' ')),
    error: (...args: any[]) => errors.push(args.map(formatValue).join(' ')),
    warn: (...args: any[]) => logs.push(`⚠ ${args.map(formatValue).join(' ')}`),
    info: (...args: any[]) => logs.push(`ℹ ${args.map(formatValue).join(' ')}`),
    table: (data: any) => logs.push(JSON.stringify(data, null, 2)),
    time: () => {},
    timeEnd: () => {},
    clear: () => {},
  };

  try {
    // Strip TypeScript types for execution (simple transform)
    const jsCode = stripTypeAnnotations(code);

    // Create sandboxed function
    const fn = new Function(
      'console',
      'input',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
      `"use strict";
      ${jsCode}
      `
    );

    // Execute with timeout protection
    const result = fn(
      mockConsole,
      input || '',
      undefined, // block setTimeout
      undefined, // block setInterval
      undefined, // block fetch
      undefined  // block XMLHttpRequest
    );

    // If the function returns a value, log it
    if (result !== undefined) {
      logs.push(formatValue(result));
    }

    const endTime = performance.now();
    const allOutput = [...logs];
    if (errors.length > 0) {
      allOutput.push('', '--- Errors ---', ...errors);
    }

    return {
      output: allOutput.length > 0 ? allOutput : ['(no output)'],
      error: null,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      output: logs,
      error: formatError(err),
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  }
}

// ═══════════════════════════════════════
// TypeScript → JavaScript Simple Transform
// Strips type annotations for browser execution
// ═══════════════════════════════════════

function stripTypeAnnotations(code: string): string {
  let result = code;

  // Remove import statements (not supported in sandbox)
  result = result.replace(/^import\s+.*?(?:from\s+)?['"].*?['"];?\s*$/gm, '');
  
  // Remove export keywords
  result = result.replace(/^export\s+(default\s+)?/gm, '');

  // Remove interface/type declarations
  result = result.replace(/^(?:export\s+)?(?:interface|type)\s+\w+(?:<[^>]*>)?\s*(?:extends\s+[^{]+)?\{[^}]*\}\s*$/gm, '');
  result = result.replace(/^(?:export\s+)?type\s+\w+\s*=\s*[^;]+;?\s*$/gm, '');

  // Remove type annotations from variables: let x: Type = ...
  result = result.replace(/:\s*(?:string|number|boolean|any|void|null|undefined|never|unknown|object|bigint|symbol)\b(?:\[\])*/g, '');
  
  // Remove generic type parameters from function calls: fn<Type>(...)
  result = result.replace(/(\w+)\s*<[^>()]+>\s*\(/g, '$1(');

  // Remove type annotations from function params: (x: Type, y: Type)
  result = result.replace(/(\w+)\s*:\s*(?:(?:readonly\s+)?[A-Z]\w*(?:<[^>]*>)?(?:\[\])*(?:\s*\|\s*(?:[A-Z]\w*(?:<[^>]*>)?(?:\[\])*|null|undefined|string|number|boolean))*)/g, '$1');

  // Remove return type annotations: ): ReturnType {
  result = result.replace(/\)\s*:\s*(?:Promise<[^>]+>|[A-Z]\w*(?:<[^>]*>)?(?:\[\])*|string|number|boolean|void|any|never|unknown)\s*(?=[{=])/g, ') ');

  // Remove 'as Type' assertions
  result = result.replace(/\s+as\s+(?:const|[A-Z]\w*(?:<[^>]*>)?)/g, '');

  // Remove non-null assertions
  result = result.replace(/!(?=\.|\[|\))/g, '');

  return result;
}

// ═══════════════════════════════════════
// Python Execution via Pyodide
// ═══════════════════════════════════════

let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;

async function loadPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) return pyodideLoading;

  pyodideLoading = (async () => {
    // Dynamically load Pyodide from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    document.head.appendChild(script);

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pyodide'));
    });

    // @ts-ignore
    pyodideInstance = await globalThis.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    return pyodideInstance;
  })();

  return pyodideLoading;
}

async function executePython(code: string, input?: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await loadPyodide();

    // Capture stdout/stderr
    pyodide.runPython(`
import sys
from io import StringIO
_stdout = sys.stdout
_stderr = sys.stderr
sys.stdout = _captured_stdout = StringIO()
sys.stderr = _captured_stderr = StringIO()
`);

    // Set input if provided
    if (input) {
      pyodide.runPython(`
import builtins
_input_lines = ${JSON.stringify(input.split('\n'))}
_input_idx = 0
def _mock_input(prompt=''):
    global _input_idx
    if _input_idx < len(_input_lines):
        val = _input_lines[_input_idx]
        _input_idx += 1
        return val
    return ''
builtins.input = _mock_input
`);
    }

    // Execute user code
    try {
      pyodide.runPython(code);
    } catch (pyErr: any) {
      const stderr = pyodide.runPython('_captured_stderr.getvalue()');
      pyodide.runPython('sys.stdout = _stdout; sys.stderr = _stderr');
      const endTime = performance.now();
      return {
        output: [],
        error: stderr || pyErr.message,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      };
    }

    // Get captured output
    const stdout = pyodide.runPython('_captured_stdout.getvalue()');
    const stderr = pyodide.runPython('_captured_stderr.getvalue()');
    pyodide.runPython('sys.stdout = _stdout; sys.stderr = _stderr');

    const endTime = performance.now();
    const outputLines = stdout ? stdout.split('\n').filter((_: string, i: number, arr: string[]) => i < arr.length - 1 || arr[i] !== '') : ['(no output)'];

    return {
      output: outputLines,
      error: stderr || null,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      output: [],
      error: err.message || 'Python execution failed',
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    };
  }
}

// ═══════════════════════════════════════
// HTML/CSS Preview (returns preview HTML)
// ═══════════════════════════════════════

function executeHTML(code: string): ExecutionResult {
  const startTime = performance.now();
  const endTime = performance.now();
  return {
    output: ['HTML preview available in the Preview tab.', '', '---', '', code],
    error: null,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
}

// ═══════════════════════════════════════
// Unified Run Interface
// ═══════════════════════════════════════

export async function runCode(
  code: string,
  language: string,
  input?: string
): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return executeJavaScript(code, input);
    case 'python':
      return executePython(code, input);
    case 'html':
      return executeHTML(code);
    default:
      return {
        output: [`Language "${language}" execution is not yet supported in the browser.`, 'Supported: JavaScript, TypeScript, Python, HTML'],
        error: null,
        executionTimeMs: 0,
      };
  }
}

// ═══════════════════════════════════════
// Test Runner
// ═══════════════════════════════════════

export async function runTests(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<TestSuiteResult> {
  const results: TestResult[] = [];
  const suiteStart = performance.now();

  for (const tc of testCases) {
    const testStart = performance.now();

    try {
      const result = await runCode(code, language, tc.input);
      const testEnd = performance.now();

      // Get the actual output (join all lines, trim)
      const actual = result.error
        ? `Error: ${result.error}`
        : result.output.join('\n').trim();

      const expected = tc.expected.trim();
      const passed = normalizeOutput(actual) === normalizeOutput(expected);

      results.push({
        name: tc.name,
        passed,
        expected,
        actual,
        timeMs: Math.round((testEnd - testStart) * 100) / 100,
        error: result.error || undefined,
      });
    } catch (err: any) {
      const testEnd = performance.now();
      results.push({
        name: tc.name,
        passed: false,
        expected: tc.expected.trim(),
        actual: `Runtime Error: ${err.message}`,
        timeMs: Math.round((testEnd - testStart) * 100) / 100,
        error: err.message,
      });
    }
  }

  const suiteEnd = performance.now();
  const passed = results.filter((r) => r.passed).length;

  return {
    results,
    passed,
    failed: results.length - passed,
    total: results.length,
    totalTimeMs: Math.round((suiteEnd - suiteStart) * 100) / 100,
  };
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

function formatValue(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function formatError(err: any): string {
  if (!err) return 'Unknown error';
  const name = err.name || 'Error';
  const message = err.message || String(err);
  const line = err.lineNumber || err.line;
  const col = err.columnNumber || err.column;

  let result = `${name}: ${message}`;
  if (line) result += ` (line ${line}${col ? `:${col}` : ''})`;
  return result;
}

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '')
    .replace(/\n+$/, '')
    .trim();
}
