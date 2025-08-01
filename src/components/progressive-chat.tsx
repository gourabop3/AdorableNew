"use client";

import { useState, useEffect, useRef } from 'react';
import { UIMessage } from 'ai';
import { Markdown } from './ui/markdown';
import { ToolMessage } from './tools';
import { CompressedImage } from '@/lib/image-compression';

interface ProgressiveMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming: boolean;
  parts: any[];
  timestamp: Date;
}

interface ProgressiveChatProps {
  appId: string;
  initialMessages: UIMessage[];
  onSendMessage: (message: string, images?: CompressedImage[]) => Promise<void>;
  isGenerating?: boolean;
}

export function ProgressiveChat({ 
  appId, 
  initialMessages, 
  onSendMessage, 
  isGenerating 
}: ProgressiveChatProps) {
  const [messages, setMessages] = useState<ProgressiveMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert initial messages to progressive format
  useEffect(() => {
    const convertedMessages = initialMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: (msg.parts?.[0] as any)?.text || '',
      isStreaming: false,
      parts: msg.parts || [],
      timestamp: new Date(),
    }));
    setMessages(convertedMessages);
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ProgressiveMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      isStreaming: false,
      parts: [{ type: 'text', text: input }],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Add assistant message placeholder
    const assistantMessage: ProgressiveMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
      parts: [],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await onSendMessage(input);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const updateStreamingMessage = (content: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.isStreaming 
          ? { ...msg, content: msg.content + content, isStreaming: true }
          : msg
      )
    );
  };

  const finishStreamingMessage = () => {
    setMessages(prev => 
      prev.map(msg => 
        msg.isStreaming 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
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
                <div>{message.content}</div>
              ) : (
                <div className="space-y-2">
                  <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content}
                  </Markdown>
                  
                  {/* Show typing indicator for streaming messages */}
                  {message.isStreaming && (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  )}
                  
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}