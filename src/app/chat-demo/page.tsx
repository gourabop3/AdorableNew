"use client";

import React, { useState } from "react";
import { UIMessage } from "ai";
import BeautifulChatLayout from "@/components/beautiful-chat-layout";
import { GradientChatContainer, FloatingActionButton } from "@/components/beautiful-chat-layout";
import { MessageSquare, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ChatDemoPage() {
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with coding, answer questions, or just chat. What would you like to explore today?",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Simulate AI response
    setIsStreaming(true);
    
    // Add user message
    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate streaming response
    setTimeout(() => {
      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I understand you said: "${message}". This is a simulated response to demonstrate the beautiful streaming chat interface. The response includes smooth animations, typing indicators, and a modern UI design inspired by AI Manus.`,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
    }, 2000);
  };

  const handleStop = () => {
    setIsStreaming(false);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSettings = () => {
    // Handle settings
    console.log("Settings clicked");
  };

  return (
    <GradientChatContainer>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Beautiful Chat Demo</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI Manus-inspired streaming chat interface
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Button
                  onClick={handleSettings}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <BeautifulChatLayout
            appId="demo-chat"
            initialMessages={messages}
            running={isStreaming}
            onStop={handleStop}
            onSendMessage={handleSendMessage}
            title="AI Assistant"
            className="h-[calc(100vh-80px)]"
          />
        </div>

        {/* Floating Action Buttons */}
        <FloatingActionButton
          onClick={handleNewChat}
          icon={<Plus className="w-6 h-6" />}
          label="New Chat"
        />
      </div>
    </GradientChatContainer>
  );
}