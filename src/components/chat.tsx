"use client";

import Image from "next/image";

import { PromptInputBasic } from "./chatinput";
import { Markdown } from "./ui/markdown";
import { useState, useEffect, useMemo } from "react";
import React from "react";
import { ChatContainer } from "./ui/chat-container";
import { UIMessage } from "ai";
import { ToolMessage } from "./tools";
import { EnhancedToolMessage } from "./enhanced-tools";
import { useQuery } from "@tanstack/react-query";
import { chatState } from "@/actions/chat-streaming";
import { CompressedImage } from "@/lib/image-compression";
import { useChatSafe } from "./use-chat";
import { STREAMING_CONFIG } from "@/lib/streaming-config";

// Import the new beautiful chat components
import BeautifulChatLayout from "./beautiful-chat-layout";
import { StreamingMessage, StreamingChatContainer, StreamingInput } from "./streaming-message";

export default function Chat(props: {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
}) {
  const { data: chat } = useQuery({
    queryKey: ["stream", props.appId],
    queryFn: async () => {
      return chatState(props.appId);
    },
    refetchInterval: STREAMING_CONFIG.POLLING.REFETCH_INTERVAL,
    refetchOnWindowFocus: false, // Disable refetch on window focus to reduce blinking
    staleTime: STREAMING_CONFIG.POLLING.STALE_TIME,
    refetchOnMount: false, // Prevent refetch on mount
    refetchOnReconnect: false, // Prevent refetch on reconnect
    gcTime: STREAMING_CONFIG.POLLING.GC_TIME,
  });

  // Debounce the running state to reduce blinking
  const [debouncedRunning, setDebouncedRunning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRunning(props.running && chat?.state === "running");
    }, STREAMING_CONFIG.DEBOUNCE.RUNNING_STATE);

    return () => clearTimeout(timer);
  }, [props.running, chat?.state]);

  const { messages, sendMessage } = useChatSafe({
    messages: props.initialMessages,
    id: props.appId,
    resume: debouncedRunning,
  });

  const [input, setInput] = useState("");

  const onSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    
    // Prevent duplicate message sending
    if (!input.trim() || debouncedRunning || isSending) {
      return;
    }
    
    const messageText = input.trim();
    setIsSending(true);
    
    // Clear input immediately
    setInput("");
    
    // Send message immediately
    const messageId = crypto.randomUUID();
    
    sendMessage(
      {
        id: messageId,
        parts: [
          {
            type: "text",
            text: messageText,
          },
        ],
      },
      {
        headers: {
          "Vibe-App-Id": props.appId,
        },
      }
    ).catch((error) => {
      console.error("Failed to send message:", error);
      // Reset sending state on error
      setIsSending(false);
    });
    
    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
    }, 1000);
  };

  const onSubmitWithImages = (text: string, images: CompressedImage[]) => {
    if (!text.trim() && images.length === 0) return;
    
    const messageId = crypto.randomUUID();
    
    sendMessage(
      {
        id: messageId,
        parts: [
          {
            type: "text",
            text: text,
          },
          ...images.map((image) => ({
            type: "image" as const,
            image: image.data,
          })),
        ],
      },
      {
        headers: {
          "Vibe-App-Id": props.appId,
        },
      }
    );
  };

  async function handleStop() {
    try {
      const response = await fetch(`/api/chat/${props.appId}/stop`, {
        method: "POST",
      });
      
      if (!response.ok) {
        console.error("Failed to stop chat");
      }
    } catch (error) {
      console.error("Error stopping chat:", error);
    }
  }

  // Use the new beautiful chat layout
  return (
    <BeautifulChatLayout
      appId={props.appId}
      initialMessages={messages}
      isLoading={props.isLoading}
      running={debouncedRunning}
      onStop={handleStop}
      onSendMessage={(messageText) => {
        setInput(messageText);
        onSubmit();
      }}
      title="AI Assistant"
      className="h-full"
    />
  );
}

// Legacy message body component for backward compatibility
const MessageBody = React.memo(function MessageBody({ message }: { message: any }) {
  const isUser = message.role === "user";
  const isTool = message.role === "tool";

  if (isTool) {
    return <EnhancedToolMessage message={message} />;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <Markdown content={message.content} />
    </div>
  );
});
