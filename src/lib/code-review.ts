// ═══════════════════════════════════════
// SkillRoute — AI Code Review Service
// Real Claude/GPT code review integration
// ═══════════════════════════════════════

import { sendTutorMessage, type ChatMessage } from './ai-tutor';

export interface CodeReview {
  score: number; // 1-10
  summary: string;
  strengths: string[];
  improvements: string[];
  codeSmells: { line?: number; issue: string; suggestion: string }[];
  securityIssues: string[];
  performanceTips: string[];
  readabilityScore: number; // 1-10
  maintainabilityScore: number; // 1-10
  rawMarkdown: string;
}

const REVIEW_PROMPT = `You are an expert code reviewer. Analyze the code and return a structured review in this EXACT JSON format (no markdown, just raw JSON):

{
  "score": <number 1-10>,
  "summary": "<one paragraph summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "codeSmells": [{"line": <number or null>, "issue": "<issue>", "suggestion": "<fix>"}],
  "securityIssues": ["<issue 1>"],
  "performanceTips": ["<tip 1>"],
  "readabilityScore": <number 1-10>,
  "maintainabilityScore": <number 1-10>
}

Be constructive, specific, and actionable. Focus on real issues, not style preferences.
If there are no security issues, return an empty array.`;

/**
 * Get an AI-powered code review
 */
export async function getAICodeReview(
  code: string,
  language: string,
  projectContext?: string
): Promise<CodeReview> {
  const contextStr = projectContext
    ? `\n\nProject context: ${projectContext}`
    : '';

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Review this ${language} code:${contextStr}\n\n\`\`\`${language}\n${code}\n\`\`\``,
    },
  ];

  try {
    const response = await sendTutorMessage(
      [{ role: 'system', content: REVIEW_PROMPT }, ...messages],
      'auto'
    );

    // Try to parse JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: clamp(parsed.score || 7, 1, 10),
          summary: parsed.summary || 'Code review completed.',
          strengths: parsed.strengths || [],
          improvements: parsed.improvements || [],
          codeSmells: parsed.codeSmells || [],
          securityIssues: parsed.securityIssues || [],
          performanceTips: parsed.performanceTips || [],
          readabilityScore: clamp(parsed.readabilityScore || 7, 1, 10),
          maintainabilityScore: clamp(parsed.maintainabilityScore || 7, 1, 10),
          rawMarkdown: response,
        };
      } catch {
        // JSON parsing failed, return markdown review
      }
    }

    // Fallback: return the markdown as-is with defaults
    return generateFallbackReview(code, language, response);
  } catch {
    // API failed entirely, generate a local review
    return generateFallbackReview(code, language);
  }
}

/**
 * Generate a local code review when AI is unavailable
 */
function generateFallbackReview(code: string, language: string, markdown?: string): CodeReview {
  const lines = code.split('\n');
  const lineCount = lines.length;
  const charCount = code.length;
  const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
  const hasErrorHandling = code.includes('try') || code.includes('catch') || code.includes('except');
  const hasFunctions = code.includes('function') || code.includes('=>') || code.includes('def ');
  const hasTypes = code.includes(': string') || code.includes(': number') || code.includes('interface');
  const hasTests = code.includes('test(') || code.includes('describe(') || code.includes('it(');
  const longLines = lines.filter((l) => l.length > 100).length;
  const emptyLines = lines.filter((l) => l.trim() === '').length;
  const commentRatio = lines.filter((l) => l.trim().startsWith('//') || l.trim().startsWith('#')).length / Math.max(lineCount, 1);

  let score = 7;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const codeSmells: { line?: number; issue: string; suggestion: string }[] = [];
  const performanceTips: string[] = [];

  // Analyze strengths
  if (hasFunctions) strengths.push('Good use of functions for code organization');
  if (hasComments) strengths.push('Code includes documentation comments');
  if (hasErrorHandling) strengths.push('Error handling is implemented');
  if (hasTypes && (language === 'typescript')) strengths.push('TypeScript types are used for type safety');
  if (emptyLines / lineCount > 0.1) strengths.push('Good use of whitespace for readability');
  if (lineCount < 200) strengths.push('Concise and focused implementation');

  // Analyze improvements
  if (!hasComments) { improvements.push('Add comments to explain complex logic'); score -= 1; }
  if (!hasErrorHandling) { improvements.push('Add error handling for robustness'); score -= 0.5; }
  if (longLines > 5) { improvements.push('Break long lines (>100 chars) for readability'); score -= 0.5; }
  if (!hasFunctions && lineCount > 30) { improvements.push('Extract logic into named functions'); score -= 0.5; }
  if (language === 'typescript' && !hasTypes) { improvements.push('Add TypeScript types for better safety'); score -= 0.5; }
  if (commentRatio < 0.05 && lineCount > 20) { improvements.push('Increase comment density for maintainability'); }

  // Detect code smells
  lines.forEach((line, i) => {
    if (line.includes('console.log') && !line.trim().startsWith('//')) {
      codeSmells.push({ line: i + 1, issue: 'console.log left in code', suggestion: 'Remove or replace with proper logging' });
    }
    if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
      codeSmells.push({ line: i + 1, issue: `${line.match(/TODO|FIXME|HACK/)?.[0]} comment found`, suggestion: 'Address before submitting' });
    }
    if (line.includes('var ')) {
      codeSmells.push({ line: i + 1, issue: 'Using var instead of let/const', suggestion: 'Use const for immutable values, let for mutable' });
    }
    if (line.includes('== ') && !line.includes('===') && !line.includes('!==')) {
      codeSmells.push({ line: i + 1, issue: 'Loose equality comparison', suggestion: 'Use === for strict equality' });
    }
  });

  // Performance tips
  if (code.includes('.forEach') && code.includes('.map')) {
    performanceTips.push('Consider combining multiple array iterations into a single reduce()');
  }
  if (code.includes('for (') && code.includes('.length')) {
    performanceTips.push('Cache array length outside loop: const len = arr.length');
  }
  if (code.match(/await\s+/g)?.length && code.match(/await\s+/g)!.length > 3) {
    performanceTips.push('Multiple awaits may be parallelizable with Promise.all()');
  }

  score = Math.max(1, Math.min(10, Math.round(score)));

  return {
    score,
    summary: `Code analysis of ${lineCount} lines of ${language}. ${strengths.length > 0 ? strengths[0] + '.' : ''} ${improvements.length > 0 ? 'Consider: ' + improvements[0] + '.' : ''}`,
    strengths: strengths.length > 0 ? strengths : ['Code is functional'],
    improvements: improvements.length > 0 ? improvements : ['No major improvements needed'],
    codeSmells: codeSmells.slice(0, 8),
    securityIssues: [],
    performanceTips: performanceTips.length > 0 ? performanceTips : ['No obvious performance concerns'],
    readabilityScore: Math.max(5, score - (longLines > 3 ? 2 : 0)),
    maintainabilityScore: Math.max(5, score - (hasFunctions ? 0 : 1)),
    rawMarkdown: markdown || generateMarkdownReview(score, strengths, improvements, codeSmells, performanceTips),
  };
}

function generateMarkdownReview(
  score: number,
  strengths: string[],
  improvements: string[],
  codeSmells: { line?: number; issue: string; suggestion: string }[],
  performanceTips: string[]
): string {
  return `## Code Review Summary

**Overall Score: ${score}/10** ${'⭐'.repeat(Math.round(score / 2))}

### Strengths
${strengths.map((s) => `- ✅ ${s}`).join('\n')}

### Suggestions for Improvement
${improvements.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${codeSmells.length > 0 ? `### Code Smells
${codeSmells.map((s) => `- ${s.line ? `Line ${s.line}: ` : ''}**${s.issue}** — ${s.suggestion}`).join('\n')}` : ''}

${performanceTips.length > 0 ? `### Performance Tips
${performanceTips.map((t) => `- 💡 ${t}`).join('\n')}` : ''}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
