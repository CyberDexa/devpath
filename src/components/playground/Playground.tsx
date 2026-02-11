// ═══════════════════════════════════════
// DevPath — Code Playground Component
// Language selector + MonacoIDE
// ═══════════════════════════════════════

import { useState } from 'react';
import MonacoIDE from '../ide/MonacoIDE';

const languages = [
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: '🟨',
    starter: `// JavaScript playground
console.log("Hello, World!");

const sum = (a, b) => a + b;
console.log("2 + 3 =", sum(2, 3));

const arr = [1, 2, 3, 4, 5];
console.log("Doubled:", arr.map(x => x * 2));

// Try writing your own code below:
`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    icon: '🔷',
    starter: `// TypeScript playground
interface User {
  name: string;
  age: number;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}! You are \${user.age}.\`;
};

console.log(greet({ name: "DevPath", age: 1 }));

const nums: number[] = [1, 2, 3];
console.log("Sum:", nums.reduce((a, b) => a + b, 0));
`,
  },
  {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    starter: `# Python playground
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
`,
  },
  {
    id: 'html',
    label: 'HTML',
    icon: '🌐',
    starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <style>
    body {
      font-family: system-ui;
      background: #0a0a0f;
      color: #e0e0e8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    h1 { color: #00e5a0; }
  </style>
</head>
<body>
  <h1>Hello, DevPath!</h1>
</body>
</html>`,
  },
];

export default function Playground() {
  const [selectedLang, setSelectedLang] = useState('javascript');
  const currentLang = languages.find((l) => l.id === selectedLang) || languages[0];

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLang(lang.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              selectedLang === lang.id
                ? 'bg-teal/10 border-teal/30 text-teal'
                : 'bg-surface/50 border-white/5 text-dim hover:text-text hover:border-white/10'
            }`}
          >
            <span>{lang.icon}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* IDE — key forces re-mount on language change */}
      <MonacoIDE
        key={selectedLang}
        projectId={`playground-${selectedLang}`}
        initialCode={currentLang.starter}
        language={selectedLang}
      />
    </div>
  );
}
