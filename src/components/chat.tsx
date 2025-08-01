"use client";

import Image from "next/image";

import { PromptInputBasic } from "./chatinput";
import { Markdown } from "./ui/markdown";
import { useState, useEffect, useCallback } from "react";
import { ChatContainer } from "./ui/chat-container";
import { UIMessage } from "ai";
import { ToolMessage } from "./tools";
import { useQuery } from "@tanstack/react-query";
import { chatState } from "@/actions/chat-streaming";
import { CompressedImage } from "@/lib/image-compression";
import { useChatSafe } from "./use-chat";
import { DebugPanel } from "./debug-panel";
import { SunaStyleChat } from "./suna-style-chat";

export default function Chat(props: {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
}) {
  // Optimize polling: only poll when actually needed
  const { data: chat } = useQuery({
    queryKey: ["stream", props.appId],
    queryFn: async () => {
      return chatState(props.appId);
    },
    refetchInterval: (data) => {
      // Only poll every 2 seconds when running, 5 seconds when idle
      return data?.state === "running" ? 2000 : 5000;
    },
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    staleTime: 1000, // Consider data fresh for 1 second
  });

  const { messages, sendMessage } = useChatSafe({
    messages: props.initialMessages,
    id: props.appId,
    resume: props.running && chat?.state === "running",
  });

  const [input, setInput] = useState("");

  const onSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    sendMessage(
      {
        parts: [
          {
            type: "text",
            text: input,
          },
        ],
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  }, [input, sendMessage, props.appId]);

  const onSubmitWithImages = useCallback((text: string, images: CompressedImage[]) => {
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
  }, [sendMessage, props.appId]);

  const handleStop = useCallback(async () => {
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
  }, [props.appId]);

  // Use Suna-style chat interface
  return (
    <div className="flex flex-col h-full">
      {props.topBar}
      
      <SunaStyleChat
        appId={props.appId}
        initialMessages={messages}
        onSendMessage={async (message: string, images?: CompressedImage[]) => {
          if (images && images.length > 0) {
            await onSubmitWithImages(message, images);
          } else {
            await onSubmit();
          }
        }}
        isGenerating={props.isLoading || chat?.state === "running"}
        onStop={handleStop}
      />
      
      {/* Debug panel - only visible in development */}
      <DebugPanel 
        appId={props.appId} 
        isVisible={process.env.NODE_ENV === 'development'} 
      />
    </div>
  );
}

function MessageBody({ message }: { message: any }) {
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
            return <ToolMessage key={index} toolInvocation={part} />;
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
}
