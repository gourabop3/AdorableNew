"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { Markdown } from "./ui/markdown";
import { 
  Bot, 
  User, 
  Code, 
  Globe, 
  Terminal, 
  FileText, 
  Search,
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface StreamingMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  isLast?: boolean;
  onComplete?: () => void;
}

interface TypingIndicatorProps {
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="inline-flex items-center gap-1 ml-2"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="w-1.5 h-1.5 bg-current rounded-full"
        />
      ))}
    </motion.div>
  );
};

const MessageStatus: React.FC<{ status: 'streaming' | 'complete' | 'error' }> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'streaming':
        return <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
    >
      {getStatusIcon()}
      <span className="capitalize">{status}</span>
    </motion.div>
  );
};

const ToolBadge: React.FC<{ toolName?: string }> = ({ toolName }) => {
  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Code className="w-4 h-4" />;
    
    const toolIcons: Record<string, React.ReactNode> = {
      browser: <Globe className="w-4 h-4" />,
      terminal: <Terminal className="w-4 h-4" />,
      file: <FileText className="w-4 h-4" />,
      search: <Search className="w-4 h-4" />,
    };
    
    return toolIcons[toolName] || <Code className="w-4 h-4" />;
  };

  if (!toolName) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium"
    >
      {getToolIcon(toolName)}
      <span className="capitalize">{toolName}</span>
    </motion.div>
  );
};

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  message,
  isStreaming = false,
  isLast = false,
  onComplete,
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'streaming' | 'complete' | 'error'>('streaming');
  const contentRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === "user";
  const isTool = message.role === "tool";

  // Simulate streaming effect for assistant messages
  useEffect(() => {
    if (isUser || !message.content) return;

    setIsTyping(true);
    setStatus('streaming');

    let currentIndex = 0;
    const content = message.content;
    const streamSpeed = 30; // characters per second

    const streamText = () => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(streamText, 1000 / streamSpeed);
      } else {
        setIsTyping(false);
        setStatus('complete');
        onComplete?.();
      }
    };

    streamText();
  }, [message.content, isUser, onComplete]);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (contentRef.current && isLast) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [displayedContent, isLast]);

  const getAvatarIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isTool) return getToolIcon(message.toolName);
    return <Bot className="w-4 h-4" />;
  };

  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Code className="w-4 h-4" />;
    
    const toolIcons: Record<string, React.ReactNode> = {
      browser: <Globe className="w-4 h-4" />,
      terminal: <Terminal className="w-4 h-4" />,
      file: <FileText className="w-4 h-4" />,
      search: <Search className="w-4 h-4" />,
    };
    
    return toolIcons[toolName] || <Code className="w-4 h-4" />;
  };

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex gap-3 p-4 transition-all duration-200",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.1, 
            type: "spring", 
            stiffness: 200,
            damping: 15
          }}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
            isTool 
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
              : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          )}
        >
          {getAvatarIcon()}
        </motion.div>
      )}

      <div className="flex-1 max-w-[85%] space-y-2">
        {/* Tool badge for tool messages */}
        {isTool && <ToolBadge toolName={message.toolName} />}

        {/* Message content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm border",
            isUser
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
              : isTool
              ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <Markdown content={message.content} />
            ) : (
              <div className="relative">
                <Markdown content={displayedContent} />
                <AnimatePresence>
                  {isTyping && isLast && (
                    <TypingIndicator isVisible={true} />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status indicator for assistant messages */}
        {!isUser && isLast && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <MessageStatus status={status} />
          </motion.div>
        )}
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.1, 
            type: "spring", 
            stiffness: 200,
            damping: 15
          }}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-white flex items-center justify-center shadow-sm"
        >
          <User className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Enhanced chat container with streaming support
export const StreamingChatContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
      className
    )}>
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced input with streaming states
export const StreamingInput: React.FC<{
  onSubmit: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}> = ({ onSubmit, onStop, isStreaming, disabled, placeholder = "Type your message..." }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSubmit(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
              rows={1}
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 bottom-2"
            >
              {isStreaming ? (
                <motion.button
                  onClick={onStop}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={!input.trim() || disabled}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};