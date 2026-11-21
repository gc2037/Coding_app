import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Generates one runnable starter workspace for each subset of the six Mimo topics.
// 2^6 = 64 workspaces, including the empty starter workspace.
const topics = [
  { id: 'javascript', files: { 'script.js': `const greeting = (name = 'Mimo') => ` + '`Hello, ${name}!`' + `;\nconsole.log(greeting());\n` } },
  { id: 'html', files: { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Mimo combination</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>\n` } },
  { id: 'jsx', files: { 'Greeting.jsx': `export default function Greeting() {\n  return <h1>Hello, Mimo!</h1>;\n}\n` } },
  { id: 'css', files: { 'styles.css': `:root { font-family: system-ui, sans-serif; color: #202033; background: #f5f3ff; }\nbody { margin: 0; padding: 2rem; }\n.card { max-width: 36rem; margin: auto; padding: 2rem; border-radius: 1rem; background: white; box-shadow: 0 8px 30px #29204a1a; }\n` } },
  { id: 'react', files: { 'App.jsx': `import React from 'react';\n\nexport default function App() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <main className="card">\n      <h1>Mimo React starter</h1>\n      <button onClick={() => setCount((n) => n + 1)}>Count: {count}</button>\n    </main>\n  );\n}\n` } },
  { id: 'react-router', files: { 'RouterApp.jsx': `import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';\n\nexport default function RouterApp() {\n  return (\n    <BrowserRouter>\n      <nav><Link to="/">Home</Link> · <Link to="/about">About</Link></nav>\n      <Routes>\n        <Route path="/" element={<main className="card"><h1>Mimo Home</h1></main>} />\n        <Route path="/about" element={<main className="card"><h1>About this exercise</h1></main>} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n` } },
];

const outputRoot = path.resolve('FOR_MIMO_ONLY/combinations');
await mkdir(outputRoot, { recursive: true });

for (let mask = 0; mask < 2 ** topics.length; mask += 1) {
  const selected = topics.filter((_, index) => mask & (1 << index));
  const slug = selected.map(({ id }) => id).join('+') || 'starter';
  const directory = path.join(outputRoot, `${String(mask).padStart(2, '0')}-${slug}`);
  await mkdir(directory, { recursive: true });

  const allFiles = Object.assign({}, ...selected.map(({ files }) => files));
  for (const [filename, contents] of Object.entries(allFiles)) {
    await writeFile(path.join(directory, filename), contents, 'utf8');
  }
  await writeFile(path.join(directory, 'README.md'), [
    `# Mimo combination ${String(mask).padStart(2, '0')}`,
    '',
    `Included topics: ${selected.map(({ id }) => id).join(', ') || 'starter (none selected)'}.`,
    '',
    'This folder contains the actual starter source code for this combination.',
    selected.length ? '' : 'Select any topic(s) and run the generator to create their code files.',
    '',
  ].join('\n'), 'utf8');
}

console.log(`Generated ${2 ** topics.length} Mimo code combinations in ${outputRoot}`);
