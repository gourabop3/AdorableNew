import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

// This utility prevents stream resumption race conditions and duplicate messages
// by tracking running chats and implementing proper cleanup
const runningChats = new Set<string>();
const streamCleanupTimeouts = new Map<string, NodeJS.Timeout>();
export function useChatSafe(
  options: Parameters<typeof useChat>[0] & { id: string; onFinish?: () => void }
) {
  const id = options.id;
  const resume = options?.resume;

  options.resume = undefined;

  const onFinish = options.onFinish;
  options.onFinish = () => {
    runningChats.delete(id);
    // Clear any pending cleanup timeout
    const timeout = streamCleanupTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      streamCleanupTimeouts.delete(id);
    }
    if (onFinish) {
      onFinish();
    }
  };

  const chat = useChat(options);

  useEffect(() => {
    if (!runningChats.has(id) && resume) {
      chat.resumeStream();
      runningChats.add(id);
      
      // Set up automatic cleanup after 30 seconds to prevent stuck states
      const cleanupTimeout = setTimeout(() => {
        if (runningChats.has(id)) {
          console.warn(`Auto-cleaning stuck stream for ${id}`);
          runningChats.delete(id);
          streamCleanupTimeouts.delete(id);
        }
      }, 30000);
      
      streamCleanupTimeouts.set(id, cleanupTimeout);
    }

    return () => {
      if (runningChats.has(id)) {
        chat.stop().then(() => {
          runningChats.delete(id);
          const timeout = streamCleanupTimeouts.get(id);
          if (timeout) {
            clearTimeout(timeout);
            streamCleanupTimeouts.delete(id);
          }
        });
      }
    };
  }, [resume, id, chat]);

  return chat;
}
