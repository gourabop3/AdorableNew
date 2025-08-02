"use client";

import { memo, useEffect, useRef, useState } from "react";
import { CodeBlock, CodeBlockCode } from "./ui/code-block";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  FolderOpen, 
  Edit, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Terminal,
  Code,
  Plus,
  Save,
  Cursor,
  Copy
} from "lucide-react";
import { Button } from "./ui/button";

interface ProgressiveCodeStreamingProps {
  message: any;
  isStreaming?: boolean;
  isLastMessage?: boolean;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  isComplete: boolean;
}

function parseCodeBlocks(content: string): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  const regex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const [, language, filename, code] = match;
    codeBlocks.push({
      language: language || 'typescript',
      code: code.trim(),
      filename: filename || undefined,
      isComplete: true
    });
  }
  
  return codeBlocks;
}

function ProgressiveCodeBlock({ 
  codeBlock, 
  isStreaming,
  isLastMessage
}: { 
  codeBlock: CodeBlock; 
  isStreaming?: boolean;
  isLastMessage?: boolean;
}) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const typingSpeed = 30; // ms per character
  const lineDelay = 100; // ms delay between lines
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && isLastMessage && codeBlock.code !== displayedCode) {
      setIsTyping(true);
      setCurrentLine(0);
      setCurrentChar(0);
      
      const lines = codeBlock.code.split('\n');
      let currentLineIndex = 0;
      let currentCharIndex = 0;
      
      const typeNextChar = () => {
        if (currentLineIndex < lines.length) {
          const line = lines[currentLineIndex];
          
          if (currentCharIndex < line.length) {
            // Type next character
            const newCode = lines.slice(0, currentLineIndex).join('\n') + '\n' + 
                           line.slice(0, currentCharIndex + 1);
            setDisplayedCode(newCode);
            setCurrentChar(currentCharIndex + 1);
            currentCharIndex++;
            setTimeout(typeNextChar, typingSpeed);
          } else {
            // Move to next line
            currentLineIndex++;
            currentCharIndex = 0;
            setCurrentLine(currentLineIndex);
            setCurrentChar(0);
            
            if (currentLineIndex < lines.length) {
              setTimeout(typeNextChar, lineDelay);
            } else {
              setIsTyping(false);
            }
          }
        } else {
          setIsTyping(false);
        }
      };
      
      typeNextChar();
    } else if (!isStreaming || !isLastMessage) {
      setDisplayedCode(codeBlock.code);
      setIsTyping(false);
    }
  }, [codeBlock.code, isStreaming, isLastMessage, displayedCode]);

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
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="my-4">
      <CodeBlock className="relative group border-2 border-primary/20 hover:border-primary/40 transition-colors">
        {/* Header with filename and actions */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center gap-2">
            {codeBlock.filename && (
              <span className="text-sm font-mono text-muted-foreground">
                📄 {codeBlock.filename}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
              {codeBlock.language}
            </span>
            {isStreaming && isLastMessage && isTyping && (
              <div className="flex items-center gap-1">
                <Cursor className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs text-primary">Writing...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
               variant="ghost"
               size="sm"
               onClick={runCode}
               disabled={isRunning}
               className="h-8 w-8 p-0 hover:bg-primary/10"
             >
               <Play className="h-4 w-4" />
             </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
                             {copied ? (
                 <CheckCircle className="h-4 w-4 text-green-500" />
               ) : (
                 <Copy className="h-4 w-4" />
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
            <div className="absolute top-4 right-4 w-0.5 h-4 bg-primary animate-pulse" />
          )}
          
          {/* Progress indicator */}
          {isStreaming && isLastMessage && isTyping && (
            <div className="absolute bottom-2 right-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Writing code...</span>
              </div>
            </div>
          )}
        </div>
      </CodeBlock>
    </div>
  );
}

function ProgressiveTextBlock({ 
  text, 
  isStreaming,
  isLastMessage
}: { 
  text: string; 
  isStreaming?: boolean;
  isLastMessage?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 50; // ms per character

  useEffect(() => {
    if (isStreaming && isLastMessage && text !== displayedText) {
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
    } else if (!isStreaming || !isLastMessage) {
      setDisplayedText(text);
      setIsTyping(false);
    }
  }, [text, isStreaming, isLastMessage, displayedText]);

  return (
    <div className="mb-4">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}

export const ProgressiveCodeStreaming = memo(function ProgressiveCodeStreaming({
  message,
  isStreaming = false,
  isLastMessage = false
}: ProgressiveCodeStreamingProps) {
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

  // Handle assistant messages with progressive code streaming
  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part: any, index: any) => {
          if (part.type === "text") {
            const textContent = part.text;
            const codeBlocks = parseCodeBlocks(textContent);
            
            // Split text content by code blocks
            let textParts = [textContent];
            codeBlocks.forEach(block => {
              const blockText = `\`\`\`${block.language}${block.filename ? ':' + block.filename : ''}\n${block.code}\n\`\`\``;
              textParts = textParts.flatMap(part => part.split(blockText));
            });
            
            return (
              <div key={index} className="space-y-4">
                {/* Render text blocks */}
                {textParts.map((textPart, textIndex) => {
                  if (textPart.trim()) {
                    return (
                      <ProgressiveTextBlock
                        key={`text-${textIndex}`}
                        text={textPart}
                        isStreaming={isStreaming}
                        isLastMessage={isLastMessage}
                      />
                    );
                  }
                  return null;
                })}
                
                {/* Render code blocks */}
                {codeBlocks.map((codeBlock, codeIndex) => (
                  <ProgressiveCodeBlock
                    key={`code-${codeIndex}`}
                    codeBlock={codeBlock}
                    isStreaming={isStreaming}
                    isLastMessage={isLastMessage}
                  />
                ))}
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            return (
              <div key={index} className="mb-4">
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Using tool: {part.toolInvocation?.toolName}</span>
                  </div>
                  <div className="text-sm">
                    {part.toolInvocation?.state === "result" ? (
                      <pre className="whitespace-pre-wrap text-xs bg-white dark:bg-gray-900 p-2 rounded border">
                        {JSON.stringify(part.toolInvocation.result, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  if (message.parts) {
    return (
      <div className="mb-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.parts
            .map((part: any) =>
              part.type === "text" ? part.text : "[something went wrong]"
            )
            .join("")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
});