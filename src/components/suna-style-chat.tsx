"use client";

import { useState, useEffect, useRef } from 'react';
import { UIMessage } from 'ai';
import { Markdown } from './ui/markdown';
import { ToolMessage } from './tools';
import { CompressedImage } from '@/lib/image-compression';
import { ProgressIndicator } from './progress-indicator';
import { ProgressiveChat } from './progressive-chat';
import { Send, StopCircle, Paperclip, Download, Share2 } from 'lucide-react';

interface SunaStyleChatProps {
  appId: string;
  initialMessages: UIMessage[];
  onSendMessage: (message: string, images?: CompressedImage[]) => Promise<void>;
  isGenerating?: boolean;
  onStop?: () => void;
}

export function SunaStyleChat({
  appId,
  initialMessages,
  onSendMessage,
  isGenerating,
  onStop
}: SunaStyleChatProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: any = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      parts: [{ type: 'text', text: input }],
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowProgress(true);

    // Initialize progress steps based on message content
    const steps = generateProgressSteps(input);
    setProgressSteps(steps);

    try {
      await onSendMessage(input);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const generateProgressSteps = (message: string): any[] => {
    const steps = [];
    
    if (message.toLowerCase().includes('research') || message.toLowerCase().includes('find')) {
      steps.push({
        id: 'research',
        title: 'Researching',
        description: 'Gathering information from various sources',
        status: 'pending'
      });
    }
    
    if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('analysis')) {
      steps.push({
        id: 'analysis',
        title: 'Analyzing',
        description: 'Processing and analyzing the data',
        status: 'pending'
      });
    }
    
    if (message.toLowerCase().includes('generate') || message.toLowerCase().includes('create')) {
      steps.push({
        id: 'generation',
        title: 'Generating',
        description: 'Creating the final output',
        status: 'pending'
      });
    }
    
    if (message.toLowerCase().includes('code') || message.toLowerCase().includes('program')) {
      steps.push({
        id: 'coding',
        title: 'Coding',
        description: 'Writing and testing code',
        status: 'pending'
      });
    }

    // Default steps if no specific keywords found
    if (steps.length === 0) {
      steps.push(
        {
          id: 'processing',
          title: 'Processing',
          description: 'Understanding your request',
          status: 'pending'
        },
        {
          id: 'generating',
          title: 'Generating',
          description: 'Creating your response',
          status: 'pending'
        }
      );
    }

    return steps;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Handle file upload logic here
    console.log('Files selected:', files);
  };

  const handleDownload = () => {
    // Export chat as markdown or other format
    const chatContent = messages
      .map((msg: any) => `${msg.role}: ${msg.content || msg.parts?.[0]?.text || ''}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${appId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Share chat functionality
    if (navigator.share) {
      navigator.share({
        title: 'Chat Conversation',
        text: 'Check out this conversation',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adorable Assistant
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isGenerating ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Download chat"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Share chat"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {showProgress && progressSteps.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <ProgressIndicator steps={progressSteps} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {message.role === 'user' ? (
                <div>{message.content || (message.parts?.[0] as any)?.text || ''}</div>
              ) : (
                <div className="space-y-2">
                  <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content || (message.parts?.[0] as any)?.text || ''}
                  </Markdown>
                  
                  {/* Tool messages */}
                  {message.parts?.map((part, index) => {
                    if (part.type?.startsWith('tool-')) {
                      return <ToolMessage key={index} toolInvocation={part} />;
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isGenerating}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept="image/*"
          />
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={isGenerating}
          />
          
          {isGenerating ? (
            <button
              onClick={onStop}
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}