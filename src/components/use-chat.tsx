import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";

// For some reason, if the chat is resumed during a router page navigation, it
// will try to resume the stream multiple times and result in some sort of leak
// where the chat is spammed with new messages. This only happens in dev mode. I
// think it's related to react rendering components twice in dev mode so
// discover bugs. This utility prevents a stream from being resumed multiple
// times.
// Use an HMR-stable global to track running chats so hot-reloads/edits don't reset it
const getRunningChats = (): Set<string> => {
  const globalObj = typeof window !== "undefined" ? (window as any) : (globalThis as any);
  if (!globalObj.__vibeRunningChats) {
    globalObj.__vibeRunningChats = new Set<string>();
  }
  return globalObj.__vibeRunningChats as Set<string>;
};
const runningChats = getRunningChats();
export function useChatSafe(
  options: Parameters<typeof useChat>[0] & { id: string; onFinish?: () => void }
) {
  const id = options.id;
  const resume = options?.resume;

  // Configure the API endpoint and headers for app-specific communication
  const chatOptions = {
    ...options,
    id: id, // Ensure the chat ID is properly set for message persistence
    api: "/api/chat", // Use the main chat API endpoint
    headers: {
      "Vibe-App-Id": id, // Pass the app ID in headers
      ...options.headers, // Include any additional headers
    },
    resume: undefined, // We'll handle resume manually
  };

  const onFinish = options.onFinish;
  chatOptions.onFinish = () => {
    runningChats.delete(id);
    if (onFinish) {
      onFinish();
    }
  };

  const chat = useChat(chatOptions);

  // Add a sending flag to prevent double-sends
  const [isSending, setIsSending] = useState(false);
  // Add a ref to track the current stream
  const streamRef = useRef(null);
  // Add a Set to track message IDs
  const messageIds = useRef(new Set());

  useEffect(() => {
    if (!runningChats.has(id) && resume) {
      chat.resumeStream();
      runningChats.add(id);
    }

    return () => {
      if (runningChats.has(id)) {
        chat.stop().then(() => {
          runningChats.delete(id);
        });
      }
    };
  }, [resume, id]);

  return chat;
}
