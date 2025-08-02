"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Markdown } from "./ui/markdown";
import { CodeBlock, CodeBlockCode } from "./ui/code-block";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, PlayIcon } from "lucide-react";
import { Button } from "./ui/button";

interface EnhancedStreamingMessageProps {
  message: any;
  isStreaming?: boolean;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

function parseMessageContent(content: string): {
  textBlocks: string[];
  codeBlocks: CodeBlock[];
} {
  const textBlocks: string[] = [];
  const codeBlocks: CodeBlock[] = [];
  
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/);
  
  parts.forEach((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Extract code block
      const codeContent = part.slice(3, -3);
      const lines = codeContent.split('\n');
      const firstLine = lines[0];
      const language = firstLine.match(/^(\w+)/)?.[1] || 'typescript';
      const filename = firstLine.match(/^(\w+):(.+)$/)?.[2] || undefined;
      const code = lines.slice(1).join('\n');
      
      codeBlocks.push({
        language,
        code,
        filename
      });
    } else if (part.trim()) {
      textBlocks.push(part);
    }
  });
  
  return { textBlocks, codeBlocks };
}

function StreamingCodeBlock({ 
  codeBlock, 
  isStreaming, 
  onComplete 
}: { 
  codeBlock: CodeBlock; 
  isStreaming?: boolean;
  onComplete?: () => void;
}) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const typingSpeed = 20; // ms per character
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && codeBlock.code !== displayedCode) {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < codeBlock.code.length) {
          setDisplayedCode(codeBlock.code.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          setIsTyping(false);
          onComplete?.();
        }
      };
      
      typeNextChar();
    } else if (!isStreaming) {
      setDisplayedCode(codeBlock.code);
      setIsTyping(false);
    }
  }, [codeBlock.code, isStreaming, displayedCode, onComplete]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeBlock.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const runCode = () => {
    setIsRunning(true);
    // Simulate running code
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="my-4">
      <CodeBlock className="relative group">
        {/* Header with filename and actions */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            {codeBlock.filename && (
              <span className="text-sm font-mono text-muted-foreground">
                {codeBlock.filename}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
              {codeBlock.language}
            </span>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="h-8 w-8 p-0"
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Code content */}
        <div className="relative">
          <CodeBlockCode
            code={displayedCode}
            language={codeBlock.language}
            className="relative"
          />
          
          {/* Typing cursor */}
          {isTyping && (
            <div className="absolute top-0 right-0 w-0.5 h-4 bg-primary animate-pulse" />
          )}
          
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="absolute top-2 right-2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
        </div>
      </CodeBlock>
    </div>
  );
}

function StreamingTextBlock({ 
  text, 
  isStreaming 
}: { 
  text: string; 
  isStreaming?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 30; // ms per character

  useEffect(() => {
    if (isStreaming && text !== displayedText) {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };
      
      typeNextChar();
    } else if (!isStreaming) {
      setDisplayedText(text);
      setIsTyping(false);
    }
  }, [text, isStreaming, displayedText]);

  return (
    <div className="mb-4">
      <Markdown className="prose prose-sm dark:prose-invert max-w-none">
        {displayedText}
      </Markdown>
      {isTyping && (
        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1" />
      )}
    </div>
  );
}

export const EnhancedStreamingMessage = memo(function EnhancedStreamingMessage({
  message,
  isStreaming = false
}: EnhancedStreamingMessageProps) {
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set());
  
  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1 mb-4">
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-xl px-4 py-1 max-w-[80%] ml-auto">
          {message.parts.map((part: any, index: number) => {
            if (part.type === "text") {
              return <div key={index}>{part.text}</div>;
            } else if (
              part.type === "file" &&
              part.mediaType?.startsWith("image/")
            ) {
              return (
                <div key={index} className="mt-2">
                  <img
                    src={part.url as string}
                    alt="User uploaded image"
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              );
            }
            return <div key={index}>unexpected message</div>;
          })}
        </div>
      </div>
    );
  }

  // Handle assistant messages with enhanced streaming
  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part: any, index: any) => {
          if (part.type === "text") {
            const { textBlocks, codeBlocks } = parseMessageContent(part.text);
            
            return (
              <div key={index} className="space-y-4">
                {/* Render text blocks */}
                {textBlocks.map((textBlock, textIndex) => (
                  <StreamingTextBlock
                    key={`text-${textIndex}`}
                    text={textBlock}
                    isStreaming={isStreaming}
                  />
                ))}
                
                {/* Render code blocks */}
                {codeBlocks.map((codeBlock, codeIndex) => (
                  <StreamingCodeBlock
                    key={`code-${codeIndex}`}
                    codeBlock={codeBlock}
                    isStreaming={isStreaming}
                    onComplete={() => {
                      setCompletedBlocks(prev => new Set([...prev, codeIndex]));
                    }}
                  />
                ))}
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            return <div key={index} className="mb-4">
              {/* Tool message component would go here */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground mb-2">
                  Using tool: {part.toolInvocation?.toolName}
                </div>
                <div className="text-sm">
                  {part.toolInvocation?.state === "result" ? (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(part.toolInvocation.result, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>;
          }
        })}
      </div>
    );
  }

  if (message.parts) {
    return (
      <div className="mb-4">
        <Markdown className="prose prose-sm dark:prose-invert max-w-none">
          {message.parts
            .map((part: any) =>
              part.type === "text" ? part.text : "[something went wrong]"
            )
            .join("")}
        </Markdown>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
});