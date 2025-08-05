"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon,
  MessageSquareIcon,
  BrainIcon,
  EyeIcon,
  CodeIcon,
  ZapIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  TerminalIcon,
  GlobeIcon
} from "lucide-react";
import { toast } from "sonner";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  content: React.ReactNode;
}

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string[]>([]);
  const [appDescription, setAppDescription] = useState("Create a todo app with user authentication and dark mode");
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const codeLines = [
    "import React, { useState, useEffect } from 'react';",
    "import { useTheme } from 'next-themes';",
    "",
    "export default function TodoApp() {",
    "  const [todos, setTodos] = useState([]);",
    "  const [input, setInput] = useState('');",
    "  const [user, setUser] = useState(null);",
    "  const { theme, setTheme } = useTheme();",
    "",
    "  const addTodo = () => {",
    "    if (input.trim()) {",
    "      setTodos([...todos, {",
    "        id: Date.now(),",
    "        text: input,",
    "        completed: false,",
    "        createdAt: new Date()",
    "      }]);",
    "      setInput('');",
    "    }",
    "  };",
    "",
    "  const toggleTodo = (id) => {",
    "    setTodos(todos.map(todo =>",
    "      todo.id === id ? { ...todo, completed: !todo.completed } : todo",
    "    ));",
    "  };",
    "",
    "  const deleteTodo = (id) => {",
    "    setTodos(todos.filter(todo => todo.id !== id));",
    "  };",
    "",
    "  return (",
    "    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>",
    "      <div className='max-w-4xl mx-auto p-6'>",
    "        <header className='flex justify-between items-center mb-8'>",
    "          <h1 className='text-3xl font-bold'>My Todo App</h1>",
    "          <button",
    "            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}",
    "            className='p-2 rounded-lg bg-gray-200 dark:bg-gray-700'",
    "          >",
    "            {theme === 'dark' ? '🌞' : '🌙'}",
    "          </button>",
    "        </header>",
    "",
    "        <div className='mb-6'>",
    "          <div className='flex gap-2'>",
    "            <input",
    "              value={input}",
    "              onChange={(e) => setInput(e.target.value)}",
    "              onKeyPress={(e) => e.key === 'Enter' && addTodo()}",
    "              placeholder='Add a new todo...'",
    "              className='flex-1 p-3 border rounded-lg bg-transparent'",
    "            />",
    "            <button",
    "              onClick={addTodo}",
    "              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'",
    "            >",
    "              Add",
    "            </button>",
    "          </div>",
    "        </div>",
    "",
    "        <div className='space-y-2'>",
    "          {todos.map(todo => (",
    "            <div key={todo.id} className='flex items-center gap-3 p-4 border rounded-lg'>",
    "              <input",
    "                type='checkbox'",
    "                checked={todo.completed}",
    "                onChange={() => toggleTodo(todo.id)}",
    "                className='w-5 h-5'",
    "              />",
    "              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>",
    "                {todo.text}",
    "              </span>",
    "              <button",
    "                onClick={() => deleteTodo(todo.id)}",
    "                className='text-red-500 hover:text-red-700'",
    "              >",
    "                Delete",
    "              </button>",
    "            </div>",
    "          ))}",
    "        </div>",
    "      </div>",
    "    </div>",
    "  );",
    "}"
  ];

  const demoSteps: DemoStep[] = [
    {
      id: 0,
      title: "Describe Your App",
      description: "Tell us what you want to build",
      icon: <MessageSquareIcon className="w-5 h-5" />,
      duration: 3000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <h3 className="font-semibold mb-3">What would you like to build?</h3>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your app idea..."
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 resize-none"
              rows={3}
            />
            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAppDescription("Create a blog with comments and user profiles")}
              >
                Blog Platform
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAppDescription("Build an e-commerce store with payment integration")}
              >
                E-commerce
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAppDescription("Create a project management dashboard")}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "AI Analysis",
      description: "Understanding your requirements",
      icon: <BrainIcon className="w-5 h-5" />,
      duration: 4000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BrainIcon className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold">AI Analysis in Progress</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Analyzing requirements...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Selecting optimal tech stack...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Planning component structure...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm">Generating code architecture...</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Selected Technologies:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Next.js 15</Badge>
                <Badge variant="secondary">React 19</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Tailwind CSS</Badge>
                <Badge variant="secondary">NextAuth.js</Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Code Generation",
      description: "AI writing your application",
      icon: <CodeIcon className="w-5 h-5" />,
      duration: 5000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CodeIcon className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold">Generating Code</h3>
              </div>
              <Badge variant="outline">{Math.round(progress)}%</Badge>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {generatedCode.map((line, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-500 mr-4 w-8 text-right">{index + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
              <div className="flex">
                <span className="text-gray-500 mr-4 w-8 text-right">{generatedCode.length + 1}</span>
                <span className="animate-pulse">|</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>Estimated time: {Math.max(0, Math.round((100 - progress) / 20))}s remaining</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "App Preview",
      description: "Your generated application",
      icon: <EyeIcon className="w-5 h-5" />,
      duration: 3000,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold">Your App is Ready!</h3>
              </div>
              <Badge className="bg-green-500">Complete</Badge>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm text-gray-600">Todo App - localhost:3000</span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">My Todo App</h2>
                  <button className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    🌙
                  </button>
                </div>
                
                <div className="flex gap-2 mb-6">
                  <input
                    placeholder="Add a new todo..."
                    className="flex-1 p-3 border rounded-lg"
                    defaultValue="Buy groceries"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="flex-1">Buy groceries</span>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="flex-1">Call mom</span>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="flex-1 line-through text-gray-500">Write code</span>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode.join('\n'));
                  setCopiedCode(true);
                  toast.success('Code copied to clipboard!');
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-2"
              >
                {copiedCode ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLinkIcon className="w-4 h-4" />
                View Live
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4" />
                Deploy
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    setGeneratedCode([]);
    setShowPreview(false);
    
    // Auto-advance through steps
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < demoSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 3000);
  };

  const pauseDemo = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setGeneratedCode([]);
    setShowPreview(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setProgress(0);
    setGeneratedCode([]);
    setShowPreview(false);
  };

  // Simulate code generation
  useEffect(() => {
    if (currentStep === 2 && isPlaying) {
      const codeInterval = setInterval(() => {
        setGeneratedCode(prev => {
          if (prev.length < codeLines.length) {
            return [...prev, codeLines[prev.length]];
          }
          return prev;
        });
        setProgress(prev => {
          if (prev < 100) {
            return prev + 2;
          }
          return prev;
        });
      }, 100);

      return () => clearInterval(codeInterval);
    }
  }, [currentStep, isPlaying]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="interactive-demo">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            See Vibe in Action
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch how AI transforms your ideas into fully functional applications in real-time
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={isPlaying ? pauseDemo : startDemo}
            className="flex items-center gap-2"
            size="lg"
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            {isPlaying ? 'Pause Demo' : 'Start Demo'}
          </Button>
          <Button
            onClick={resetDemo}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <RotateCcwIcon className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {demoSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentStep === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="demo-content">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {demoSteps[currentStep].icon}
                  <div>
                    <CardTitle className="text-xl">{demoSteps[currentStep].title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {demoSteps[currentStep].description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Step {currentStep + 1} of {demoSteps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {demoSteps[currentStep].content}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <ZapIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">30s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Generation Time</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
            <SparklesIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Production Ready</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <CodeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Technologies Supported</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
            <GlobeIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1-Click</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Deploy to Vercel</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" className="flex items-center gap-2 mx-auto">
            Try It Yourself
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            No credit card required • Start building in seconds
          </p>
        </div>
      </div>
    </div>
  );
}