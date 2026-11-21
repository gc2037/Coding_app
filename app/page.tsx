'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGS = [
  ['javascript','JavaScript','node','18.15.0','console.log("Hello, world!");'],
  ['typescript','TypeScript','typescript','5.0.3','const hello: string = "Hello, world!";\nconsole.log(hello);'],
  ['python','Python','python','3.10.0','print("Hello, world!")'],
  ['java','Java','java','15.0.2','public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}'],
  ['cpp','C++','cpp','10.2.0','#include <iostream>\nint main() { std::cout << "Hello, world!"; }'],
  ['csharp','C#','csharp','6.12.0','using System;\nclass Program { static void Main() { Console.WriteLine("Hello, world!"); } }'],
  ['go','Go','go','1.16.2','package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello, world!") }'],
  ['rust','Rust','rust','1.68.2','fn main() { println!("Hello, world!"); }'],
  ['php','PHP','php','8.2.3','<?php echo "Hello, world!";'],
  ['ruby','Ruby','ruby','3.0.1','puts "Hello, world!"'],
  ['swift','Swift','swift','5.3.3','print("Hello, world!")'],
  ['kotlin','Kotlin','kotlin','1.8.20','fun main() { println("Hello, world!") }'],
  ['html','HTML','html','markup','<h1>Hello, world!</h1>'],
  ['css','CSS','css','stylesheet','h1 { color: #7c6cf2; }'],
  ['sql','SQL','sqlite','3.36.0','CREATE TABLE users (name TEXT);\nINSERT INTO users VALUES (\'Ada\');\nSELECT * FROM users;'],
] as const;

type Lang = typeof LANGS[number];
type Message = { role: 'user' | 'assistant'; content: string };

export default function Page() {
  const [language, setLanguage] = useState<Lang>(LANGS[0]);
  const [code, setCode] = useState(LANGS[0][4]);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [chat, setChat] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [chating, setChating] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), [chat]);

  function changeLanguage(next: Lang) { setLanguage(next); setCode(next[4]); setOutput(''); }

  async function runCode() {
    setRunning(true); setOutput('Running...');
    try {
      if (language[0] === 'html' || language[0] === 'css') {
        const blob = language[0] === 'html' ? code : `<style>${code}</style><h1>Preview</h1>`;
        const url = URL.createObjectURL(new Blob([blob], { type: 'text/html' }));
        window.open(url, '_blank', 'noopener,noreferrer');
        setOutput('Opened preview in a new tab.');
        return;
      }
      const response = await fetch('/api/execute', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ language: language[2], version: language[3], files: [{ name: language[0] === 'java' ? 'Main.java' : 'main', content: code }] }) });
      const data = await response.json();
      setOutput([data.run?.stdout, data.run?.stderr, data.compile?.stdout, data.compile?.stderr, data.message].filter(Boolean).join('\n') || 'Program completed with no output.');
    } catch (error) { setOutput(error instanceof Error ? error.message : 'Execution failed.'); }
    finally { setRunning(false); }
  }

  async function sendChat() {
    if (!prompt.trim() || chating) return;
    const next = [...chat, { role:'user' as const, content: prompt.trim() }];
    setChat(next); setPrompt(''); setChating(true);
    try {
      const response = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ messages:[{role:'system',content:`You are a concise coding assistant. The user's active language is ${language[1]}.`}, ...next.map(({role,content}) => ({role,content})), {role:'user',content:`Current code:\n\n\`\`\`${language[0]}\n${code}\n\`\`\``}] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat failed');
      setChat([...next, { role:'assistant', content:data.content }]);
    } catch (error) { setChat([...next, {role:'assistant', content:error instanceof Error ? error.message : 'Chat failed'}]); }
    finally { setChating(false); }
  }

  return (
    <main>
      <header><div className="brand"><span className="mark">&lt;/&gt;</span><b>Code Studio</b></div><div className="status"><i /> AI connected</div></header>
      <section className="workspace">
        <aside className="explorer"><div className="aside-title">LANGUAGE</div><div className="languages">{LANGS.map((lang) => <button key={lang[0]} className={language[0]===lang[0]?'active':''} onClick={()=>changeLanguage(lang)}><span className="lang-dot">{lang[1].slice(0,2).toUpperCase()}</span><span>{lang[1]}</span></button>)}</div></aside>
        <section className="editor-panel">
          <div className="toolbar"><div><span className="crumb">main</span><b>{language[1]}</b></div><button className="run" onClick={runCode} disabled={running}>▶ {running?'Running':'Run'}</button></div>
          <div className="editors"><div className="code-wrap"><Editor height="100%" language={language[0]} value={code} theme="vs-dark" onChange={(v)=>setCode(v||'')} options={{fontSize:14,minimap:{enabled:false},padding:{top:14},automaticLayout:true,scrollBeyondLastLine:false}} /></div>
          <div className="output"><div className="output-title"><span>OUTPUT</span><button onClick={()=>setOutput('')}>Clear</button></div><pre>{output || 'Run your code to see output here.'}</pre></div></div>
        </section>
        <aside className="chat"><div className="chat-title"><span>AI Assistant</span><span className="spark">✦</span></div><div className="messages">{chat.length===0 && <div className="empty"><span>✦</span><p>Ask about your code, debug an error, or request an implementation.</p></div>}{chat.map((message,i)=><div className={`message ${message.role}`} key={i}>{message.content}</div>)}{chating&&<div className="message assistant thinking">Thinking...</div>}<div ref={chatEnd}/></div>
          <div className="composer"><textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.prevent.preventDefault();sendChat();}}} placeholder="Ask the AI..."/><button onClick={sendChat} disabled={chating||!prompt.trim()} aria-label="Send">↑</button></div>
        </aside>
      </section>
    </main>
  );
}
