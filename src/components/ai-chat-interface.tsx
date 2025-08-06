"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SendIcon, 
  MessageSquareIcon, 
  CodeIcon, 
  EyeIcon,
  PlayIcon,
  StopIcon,
  RefreshCwIcon,
  DownloadIcon,
  ShareIcon,
  SettingsIcon,
  SparklesIcon,
  ZapIcon,
  BrainIcon,
  RocketIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  UserIcon,
  BotIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  ExternalLinkIcon
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "code" | "component" | "preview";
  metadata?: {
    framework?: string;
    status?: "generating" | "complete" | "error";
    preview?: string;
    code?: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI development assistant. I can help you build full-stack applications, create components, and deploy your projects. What would you like to build today?",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("nextjs");
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Todo App with Authentication",
      messages: [],
      lastUpdated: new Date()
    },
    {
      id: "2", 
      title: "E-commerce Dashboard",
      messages: [],
      lastUpdated: new Date()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState("1");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const frameworks = [
    { id: "nextjs", name: "Next.js", icon: "⚡" },
    { id: "react", name: "React", icon: "⚛️" },
    { id: "vue", name: "Vue.js", icon: "💚" },
    { id: "svelte", name: "Svelte", icon: "🧡" },
    { id: "angular", name: "Angular", icon: "🅰️" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'll help you build that! Let me generate the code and preview for you.",
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add code generation message
      setTimeout(() => {
        const codeMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Here's your generated application:",
          timestamp: new Date(),
          type: "component",
          metadata: {
            framework: selectedFramework,
            status: "complete",
            code: `// Generated ${selectedFramework} component
import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  const addItem = () => {
    if (input.trim()) {
      setItems([...items, { 
        id: Date.now(), 
        text: input,
        completed: false 
      }]);
      setInput('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center gap-2 p-2 border rounded">
            <input type="checkbox" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
            preview: "https://example.com/preview"
          }
        };

        setMessages(prev => [...prev, codeMessage]);
        setIsGenerating(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      lastUpdated: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI development assistant. What would you like to build today?",
      timestamp: new Date(),
      type: "text"
    }]);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
            <Button size="sm" onClick={createNewSession}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Framework Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Framework</label>
            <select 
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {frameworks.map(fw => (
                <option key={fw.id} value={fw.id}>
                  {fw.icon} {fw.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  currentSessionId === session.id
                    ? "bg-blue-100 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-gray-900 truncate">
                  {session.title}
                </div>
                <div className="text-xs text-gray-500">
                  {session.lastUpdated.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200/50">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BrainIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Development Assistant</h3>
                <p className="text-sm text-gray-500">Ready to help you build amazing apps</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <EyeIcon className="w-4 h-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button variant="ghost" size="sm">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className={`${showPreview ? "w-1/2" : "w-full"} flex flex-col`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" 
                          ? "bg-blue-500" 
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}>
                        {message.role === "user" ? (
                          <UserIcon className="w-4 h-4 text-white" />
                        ) : (
                          <BotIcon className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200 shadow-sm"
                      }`}>
                        {message.type === "component" && message.metadata?.code ? (
                          <div className="space-y-3">
                            <p className="text-gray-700">{message.content}</p>
                            
                            {/* Code Block */}
                            <div className="bg-gray-900 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                                <div className="flex items-center space-x-2">
                                  <CodeIcon className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-300">
                                    {message.metadata.framework} Component
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyCode(message.metadata?.code || "")}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <CopyIcon className="w-4 h-4" />
                                </Button>
                              </div>
                              <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                                <code>{message.metadata.code}</code>
                              </pre>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <RocketIcon className="w-4 h-4 mr-2" />
                                Deploy
                              </Button>
                              <Button size="sm" variant="outline">
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              <Button size="sm" variant="outline">
                                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                Open in Editor
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className={message.role === "user" ? "text-white" : "text-gray-700"}>
                            {message.content}
                          </p>
                        )}

                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${
                          message.role === "user" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Generating Indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <BotIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin">
                          <SparklesIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-gray-600">Generating your app...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe the app you want to build..."
                    className="w-full p-4 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isGenerating}
                    size="sm"
                    className="absolute right-2 bottom-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-xs">
                    <ZapIcon className="w-3 h-3 mr-1" />
                    450 credits remaining
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200/50 bg-white/50">
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      onClick={() => setPreviewMode("desktop")}
                    >
                      Desktop
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      onClick={() => setPreviewMode("mobile")}
                    >
                      Mobile
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex items-center justify-center h-full">
                <div className={`bg-white rounded-lg shadow-lg border ${
                  previewMode === "mobile" ? "w-80 h-96" : "w-full h-full"
                }`}>
                  <div className="p-6 text-center text-gray-500">
                    <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Preview will appear here when you generate an app</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}