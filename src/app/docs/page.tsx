"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Code, 
  Database, 
  Globe, 
  Layers, 
  Palette, 
  Rocket, 
  Shield, 
  Zap,
  ChevronRight,
  ExternalLink,
  Github,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";

const techStack = {
  frontend: [
    { name: "Next.js 15", description: "React framework with App Router", icon: "⚛️", category: "Framework" },
    { name: "React 19", description: "Latest React with concurrent features", icon: "⚛️", category: "Library" },
    { name: "TypeScript", description: "Type-safe JavaScript development", icon: "🔷", category: "Language" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework", icon: "🎨", category: "Styling" },
    { name: "Radix UI", description: "Accessible component primitives", icon: "♿", category: "Components" },
    { name: "Lucide React", description: "Beautiful icon library", icon: "🎯", category: "Icons" },
  ],
  backend: [
    { name: "Node.js", description: "JavaScript runtime environment", icon: "🟢", category: "Runtime" },
    { name: "Drizzle ORM", description: "Type-safe database toolkit", icon: "🗄️", category: "Database" },
    { name: "PostgreSQL", description: "Advanced open-source database", icon: "🐘", category: "Database" },
    { name: "Redis", description: "In-memory data structure store", icon: "🔴", category: "Cache" },
    { name: "Zod", description: "TypeScript-first schema validation", icon: "🛡️", category: "Validation" },
  ],
  ai: [
    { name: "AI SDK", description: "Vercel's AI development toolkit", icon: "🤖", category: "AI" },
    { name: "Mastra", description: "AI agent framework", icon: "🧠", category: "AI" },
    { name: "Model Context Protocol", description: "AI model integration", icon: "🔗", category: "AI" },
    { name: "Google AI", description: "Google's AI services integration", icon: "🔍", category: "AI" },
  ],
  deployment: [
    { name: "Vercel", description: "Cloud platform for web apps", icon: "☁️", category: "Hosting" },
    { name: "Docker", description: "Containerization platform", icon: "🐳", category: "Container" },
    { name: "Git", description: "Version control system", icon: "📝", category: "VCS" },
  ],
  tools: [
    { name: "ESLint", description: "JavaScript linting utility", icon: "🔍", category: "Linting" },
    { name: "Prettier", description: "Code formatter", icon: "✨", category: "Formatting" },
    { name: "Drizzle Kit", description: "Database migration tool", icon: "🔄", category: "Migration" },
  ]
};

const learningPath = [
  {
    day: 1,
    title: "Project Setup & Next.js Fundamentals",
    topics: ["Next.js 15 App Router", "TypeScript basics", "Project structure"],
    duration: "4 hours",
    difficulty: "Beginner"
  },
  {
    day: 2,
    title: "React 19 & Modern React Patterns",
    topics: ["React 19 features", "Hooks", "Component patterns"],
    duration: "5 hours",
    difficulty: "Beginner"
  },
  {
    day: 3,
    title: "Styling with Tailwind CSS",
    topics: ["Utility classes", "Responsive design", "Custom components"],
    duration: "4 hours",
    difficulty: "Beginner"
  },
  {
    day: 4,
    title: "UI Components with Radix UI",
    topics: ["Accessibility", "Component primitives", "Custom styling"],
    duration: "4 hours",
    difficulty: "Intermediate"
  },
  {
    day: 5,
    title: "State Management & Data Flow",
    topics: ["React state", "Context API", "Zustand"],
    duration: "5 hours",
    difficulty: "Intermediate"
  },
  {
    day: 6,
    title: "Database Design & Drizzle ORM",
    topics: ["Database schema", "Drizzle ORM", "Type safety"],
    duration: "6 hours",
    difficulty: "Intermediate"
  },
  {
    day: 7,
    title: "Authentication & Authorization",
    topics: ["User authentication", "Session management", "Security"],
    duration: "5 hours",
    difficulty: "Intermediate"
  },
  {
    day: 8,
    title: "API Routes & Backend Logic",
    topics: ["Next.js API routes", "Request handling", "Error management"],
    duration: "5 hours",
    difficulty: "Intermediate"
  },
  {
    day: 9,
    title: "AI Integration & AI SDK",
    topics: ["AI SDK setup", "Streaming responses", "AI agents"],
    duration: "6 hours",
    difficulty: "Advanced"
  },
  {
    day: 10,
    title: "Mastra AI Agent Framework",
    topics: ["Agent creation", "Tool integration", "Memory management"],
    duration: "6 hours",
    difficulty: "Advanced"
  },
  {
    day: 11,
    title: "Real-time Features & WebSockets",
    topics: ["Real-time updates", "WebSocket integration", "Live collaboration"],
    duration: "5 hours",
    difficulty: "Advanced"
  },
  {
    day: 12,
    title: "Caching & Performance",
    topics: ["Redis caching", "Performance optimization", "CDN setup"],
    duration: "4 hours",
    difficulty: "Advanced"
  },
  {
    day: 13,
    title: "Testing & Quality Assurance",
    topics: ["Unit testing", "Integration testing", "E2E testing"],
    duration: "5 hours",
    difficulty: "Intermediate"
  },
  {
    day: 14,
    title: "Error Handling & Monitoring",
    topics: ["Error boundaries", "Logging", "Monitoring tools"],
    duration: "4 hours",
    difficulty: "Intermediate"
  },
  {
    day: 15,
    title: "Security Best Practices",
    topics: ["Input validation", "XSS prevention", "CSRF protection"],
    duration: "4 hours",
    difficulty: "Advanced"
  },
  {
    day: 16,
    title: "Deployment & CI/CD",
    topics: ["Vercel deployment", "Environment variables", "CI/CD pipeline"],
    duration: "4 hours",
    difficulty: "Intermediate"
  },
  {
    day: 17,
    title: "Performance Optimization",
    topics: ["Code splitting", "Lazy loading", "Bundle optimization"],
    duration: "5 hours",
    difficulty: "Advanced"
  },
  {
    day: 18,
    title: "Accessibility & SEO",
    topics: ["WCAG guidelines", "SEO optimization", "Meta tags"],
    duration: "4 hours",
    difficulty: "Intermediate"
  },
  {
    day: 19,
    title: "Mobile Optimization",
    topics: ["Responsive design", "PWA features", "Mobile testing"],
    duration: "4 hours",
    difficulty: "Intermediate"
  },
  {
    day: 20,
    title: "Advanced AI Features",
    topics: ["Custom AI models", "Fine-tuning", "AI workflows"],
    duration: "6 hours",
    difficulty: "Advanced"
  },
  {
    day: 21,
    title: "Scalability & Architecture",
    topics: ["Microservices", "Load balancing", "Database scaling"],
    duration: "5 hours",
    difficulty: "Advanced"
  },
  {
    day: 22,
    title: "Project Completion & Deployment",
    topics: ["Final testing", "Production deployment", "Documentation"],
    duration: "4 hours",
    difficulty: "Intermediate"
  }
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Vibe</span>
            </Link>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/docs" className="text-blue-600 font-medium">
                Documentation
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Vibe Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Complete guide to building AI-powered applications with our modern tech stack. 
            Master everything from Next.js to AI integration in 22 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
            <Button variant="outline" size="lg">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
            <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="w-5 h-5 mr-2" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Vibe is an AI-powered development platform that helps you build amazing applications faster than ever before.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Modern React with Next.js 15
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Type-safe development with TypeScript
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      AI integration with Mastra framework
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Real-time collaboration features
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">AI-Powered Development</h4>
                      <p className="text-sm text-gray-600">Build apps with natural language prompts</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-time Collaboration</h4>
                      <p className="text-sm text-gray-600">Work together with your team in real-time</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Modern Tech Stack</h4>
                      <p className="text-sm text-gray-600">Built with the latest technologies</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Type Safety</h4>
                      <p className="text-sm text-gray-600">End-to-end type safety with TypeScript</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="tech-stack" className="space-y-8">
            <div className="grid gap-8">
              {Object.entries(techStack).map(([category, technologies]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {category === 'frontend' && <Globe className="w-5 h-5 mr-2" />}
                      {category === 'backend' && <Database className="w-5 h-5 mr-2" />}
                      {category === 'ai' && <Zap className="w-5 h-5 mr-2" />}
                      {category === 'deployment' && <Rocket className="w-5 h-5 mr-2" />}
                      {category === 'tools' && <Code className="w-5 h-5 mr-2" />}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {technologies.map((tech) => (
                        <div key={tech.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{tech.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                              <p className="text-sm text-gray-600">{tech.description}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {tech.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning-path" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">22-Day Learning Path</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Master the complete tech stack with our structured learning path. 
                Each day builds upon the previous, taking you from beginner to expert.
              </p>
            </div>

            <div className="grid gap-6">
              {learningPath.map((day) => (
                <Card key={day.day} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold">
                            {day.day}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {day.duration}
                              </div>
                              <Badge 
                                variant={day.difficulty === 'Beginner' ? 'default' : 
                                        day.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                              >
                                {day.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <ul className="space-y-1">
                            {day.topics.map((topic, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>
                  Complete API documentation for Vibe's core features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-sm">
                        POST /api/auth/login<br/>
                        POST /api/auth/logout<br/>
                        GET /api/auth/user
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Apps</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-sm">
                        GET /api/apps<br/>
                        POST /api/apps<br/>
                        GET /api/apps/[id]<br/>
                        PUT /api/apps/[id]<br/>
                        DELETE /api/apps/[id]
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Generation</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-sm">
                        POST /api/generate<br/>
                        POST /api/stream<br/>
                        GET /api/status/[id]
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
                <h3 className="text-xl font-bold text-gray-900">Vibe</h3>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered development platform for building amazing applications.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="text-gray-600 hover:text-gray-900 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/docs/examples" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://github.com/vibe-dev" className="text-gray-600 hover:text-gray-900 transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@vibe.dev" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">
                © 2024 Vibe. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}