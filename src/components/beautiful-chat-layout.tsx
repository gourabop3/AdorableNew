"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { StreamingMessage, StreamingChatContainer, StreamingInput } from "./streaming-message";
import { 
  ArrowDown, 
  Sparkles, 
  Bot, 
  Settings, 
  Share2, 
  Download,
  Upload,
  Trash2,
  RefreshCw,
  MessageSquare,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeautifulChatLayoutProps {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  running: boolean;
  onStop?: () => void;
  onSendMessage?: (message: string) => void;
  title?: string;
  className?: string;
}

interface ChatHeaderProps {
  title: string;
  isStreaming: boolean;
  onStop?: () => void;
  onClear?: () => void;
  onExport?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  isStreaming, 
  onStop, 
  onClear, 
  onExport 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: isStreaming ? [1, 1.1, 1] : 1,
              rotate: isStreaming ? 360 : 0
            }}
            transition={{ 
              duration: isStreaming ? 2 : 0,
              repeat: isStreaming ? Infinity : 0,
              ease: "linear"
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Bot className="w-4 h-4 text-white" />
          </motion.div>
          
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI is thinking...</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && onStop && (
            <Button
              onClick={onStop}
              size="sm"
              variant="destructive"
              className="rounded-full"
            >
              <Zap className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={onExport}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onClear}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4"
      >
        <Bot className="w-8 h-8 text-white" />
      </motion.div>
      
      <h3 className="text-xl font-semibold mb-2">Welcome to AI Chat</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Start a conversation with your AI assistant. Ask questions, get help with coding, 
        or explore new ideas together.
      </p>
      
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 text-purple-500"
      >
        <ArrowDown className="w-6 h-6" />
      </motion.div>
    </motion.div>
  );
};

const ScrollToBottomButton: React.FC<{
  onClick: () => void;
  isVisible: boolean;
}> = ({ onClick, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClick}
          className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowDown className="w-5 h-5 mx-auto" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function BeautifulChatLayout({
  appId,
  initialMessages,
  isLoading = false,
  running,
  onStop,
  onSendMessage,
  title = "AI Assistant",
  className,
}: BeautifulChatLayoutProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    setIsStreaming(running);
  }, [running]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSubmit = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    if (onSendMessage) {
      onSendMessage(messageText);
    }
  };

  const handleStop = () => {
    setIsStreaming(false);
    onStop?.();
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleExport = () => {
    const chatData = {
      title,
      messages,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ChatHeader
        title={title}
        isStreaming={isStreaming}
        onStop={handleStop}
        onClear={handleClear}
        onExport={handleExport}
      />

      <div className="flex-1 relative">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto scroll-smooth"
        >
          <StreamingChatContainer>
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <StreamingMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && index === messages.length - 1}
                    isLast={index === messages.length - 1}
                    onComplete={() => setIsStreaming(false)}
                  />
                ))}
              </AnimatePresence>
            )}
            
            <div ref={messagesEndRef} />
          </StreamingChatContainer>
        </div>

        <ScrollToBottomButton
          onClick={scrollToBottom}
          isVisible={showScrollButton}
        />
      </div>

      <StreamingInput
        onSubmit={handleSubmit}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  );
}

// Enhanced chat container with gradient background
export const GradientChatContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20",
      className
    )}>
      {children}
    </div>
  );
};

// Floating action button for quick actions
export const FloatingActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}> = ({ onClick, icon, label, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow z-50 flex items-center justify-center",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={label}
    >
      {icon}
    </motion.button>
  );
};

// Message bubble with enhanced animations
export const AnimatedMessageBubble: React.FC<{
  children: React.ReactNode;
  isUser: boolean;
  className?: string;
}> = ({ children, isUser, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border",
        isUser
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </motion.div>
  );
};