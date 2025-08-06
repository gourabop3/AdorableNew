"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const codeSnippets = [
  "const app = createApp()",
  "npm install vibe-ai",
  "export default function()",
  "useState([])",
  "useEffect(() => {})",
  "className='flex'",
  "<Button onClick={}>",
  "async/await",
  "import React from",
  "git push origin"
];

const FloatingCodeSnippet = ({ snippet, index }: { snippet: string; index: number }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: -100,
        y: Math.random() * window.innerHeight 
      }}
      animate={{ 
        opacity: [0, 0.6, 0],
        x: window.innerWidth + 100,
        y: Math.random() * window.innerHeight 
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        delay: index * 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 5
      }}
      className="absolute text-xs font-mono text-blue-400/30 bg-blue-50/20 px-2 py-1 rounded border border-blue-200/20 backdrop-blur-sm"
      style={{
        top: `${Math.random() * 80 + 10}%`,
      }}
    >
      {snippet}
    </motion.div>
  );
};

const FloatingShape = ({ index }: { index: number }) => {
  const shapes = ['circle', 'square', 'triangle'];
  const shape = shapes[index % shapes.length];
  
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 0,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      }}
      animate={{ 
        opacity: [0, 0.3, 0],
        scale: [0, 1, 0],
        rotate: 360,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      }}
      transition={{
        duration: 20 + Math.random() * 10,
        delay: index * 3,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute ${
        shape === 'circle' 
          ? 'w-4 h-4 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20' 
          : shape === 'square'
          ? 'w-3 h-3 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rotate-45'
          : 'w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-400/20'
      }`}
    />
  );
};

export function FloatingElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Code Snippets */}
      {codeSnippets.map((snippet, index) => (
        <FloatingCodeSnippet key={`code-${index}`} snippet={snippet} index={index} />
      ))}
      
      {/* Floating Geometric Shapes */}
      {Array.from({ length: 8 }).map((_, index) => (
        <FloatingShape key={`shape-${index}`} index={index} />
      ))}
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-repeat"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
}