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
          "Adorable-App-Id": props.appId,
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
    }, STREAMING_CONFIG.DEBOUNCE.SENDING_RESET);
  };

  const onSubmitWithImages = (text: string, images: CompressedImage[]) => {
    const parts: Parameters<typeof sendMessage>[0]["parts"] = [];

    if (text.trim()) {
      parts.push({
        type: "text",
        text: text,
      });
    }

    images.forEach((image) => {
      parts.push({
        type: "file",
        mediaType: image.mimeType,
        url: image.data,
      });
    });

    sendMessage(
      {
        parts,
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  async function handleStop() {
    try {
      await fetch("/api/chat/" + props.appId + "/stream", {
        method: "DELETE",
        headers: {
          "Adorable-App-Id": props.appId,
        },
      });
    } catch (error) {
      console.error("Failed to stop stream:", error);
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ transform: "translateZ(0)" }}
    >
      {props.topBar}
      <div
        className="flex-1 overflow-y-auto flex flex-col space-y-6 min-h-0 transition-all duration-300"
        style={{ overflowAnchor: "auto" }}
      >
        <ChatContainer autoScroll>
          {messages.map((message: any) => (
            <MessageBody key={message.id} message={message} />
          ))}
        </ChatContainer>
      </div>
      <div className="flex-shrink-0 p-3 transition-all bg-background md:backdrop-blur-sm">
        <PromptInputBasic
          stop={handleStop}
          input={input}
          onValueChange={(value) => {
            setInput(value);
          }}
          onSubmit={onSubmit}
          onSubmitWithImages={onSubmitWithImages}
          isGenerating={props.isLoading || debouncedRunning}
        />
      </div>
    </div>
  );
}

const MessageBody = React.memo(function MessageBody({ message }: { message: any }) {
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
                  <Image
                    src={part.url as string}
                    alt="User uploaded image"
                    width={200}
                    height={200}
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

  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part: any, index: any) => {
          if (part.type === "text") {
            return (
              <div key={index} className="mb-4">
                <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                  {part.text}
                </Markdown>
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            // if (
            //   part.toolInvocation.state === "result" &&
            //   part.toolInvocation.result.isError
            // ) {
            //   return (
            //     <div
            //       key={index}
            //       className="border-red-500 border text-sm text-red-800 rounded bg-red-100 px-2 py-1 mt-2 mb-4"
            //     >
            //       {part.toolInvocation.result?.content?.map(
            //         (content: { type: "text"; text: string }, i: number) => (
            //           <div key={i}>{content.text}</div>
            //         )
            //       )}
            //       {/* Unexpectedly failed while using tool{" "}
            //       {part.toolInvocation.toolName}. Please try again. again. */}
            //     </div>
            //   );
            // }

            // if (
            //   message.parts!.length - 1 == index &&
            //   part.toolInvocation.state !== "result"
            // ) {
            return <EnhancedToolMessage key={index} toolInvocation={part} />;
            // } else {
            //   return undefined;
            // }
          }
        })}
      </div>
    );
  }

  if (message.parts) {
    return (
      <Markdown className="prose prose-sm dark:prose-invert max-w-none">
        {message.parts
          .map((part: any) =>
            part.type === "text" ? part.text : "[something went wrong]"
          )
          .join("")}
      </Markdown>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
});
