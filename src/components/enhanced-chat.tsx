"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Square, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ArrowDown,
  FileText,
  Code,
  Globe,
  Terminal,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "./ui/markdown";
import { ToolMessage } from "./tools";
import { EnhancedToolMessage } from "./enhanced-tools";
import { useChatSafe } from "./use-chat";
import { CompressedImage } from "@/lib/image-compression";

interface EnhancedChatProps {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
  onStop?: () => void;
}

interface MessageProps {
  message: UIMessage;
  isLast: boolean;
  isStreaming: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ message, isLast, isStreaming }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isTool = message.role === "tool";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 p-4 transition-all duration-200",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isTool 
              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          )}
        >
          {isTool ? getToolIcon(message.toolName) : <Bot className="w-4 h-4" />}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
            : isTool
            ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}
      >
        {isTool ? (
          <EnhancedToolMessage message={message} />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown content={message.content} />
          </div>
        )}
        
        {isLast && isStreaming && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block w-2 h-2 bg-current rounded-full ml-2"
          />
        )}
      </motion.div>

      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-white flex items-center justify-center"
        >
          <User className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  );
};

const StreamingIndicator: React.FC<{ isStreaming: boolean }> = ({ isStreaming }) => {
  if (!isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-3 p-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
      >
        <Sparkles className="w-4 h-4 text-white" />
      </motion.div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>AI is thinking</span>
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

const EnhancedChatInput: React.FC<{
  onSubmit: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}> = ({ onSubmit, onStop, isStreaming, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || disabled) return;
    
    onSubmit(input.trim());
    setInput("");
  }, [input, onSubmit, disabled]);

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
      className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              rows={1}
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 bottom-2"
            >
              {isStreaming ? (
                <Button
                  onClick={onStop}
                  size="sm"
                  variant="destructive"
                  className="w-8 h-8 rounded-full p-0"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || disabled}
                  size="sm"
                  className="w-8 h-8 rounded-full p-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function EnhancedChat({
  appId,
  initialMessages,
  isLoading = false,
  topBar,
  running,
  onStop,
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { sendMessage } = useChatSafe({
    messages: initialMessages,
    id: appId,
    resume: running,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setIsStreaming(running);
  }, [running]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      await sendMessage(
        {
          id: userMessage.id,
          parts: [{ type: "text", text: messageText }],
        },
        {
          headers: { "Vibe-App-Id": appId },
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    setIsStreaming(false);
    onStop?.();
  };

  return (
    <div className="flex flex-col h-full">
      {topBar && (
        <div className="flex-shrink-0 border-b border-border">
          {topBar}
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isStreaming={isStreaming && index === messages.length - 1}
              />
            ))}
          </AnimatePresence>

          <StreamingIndicator isStreaming={isStreaming} />
        </div>

        <div ref={messagesEndRef} />

        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <ArrowDown className="w-5 h-5 mx-auto" />
          </motion.button>
        )}
      </div>

      <EnhancedChatInput
        onSubmit={handleSubmit}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={isLoading}
      />
    </div>
  );
}