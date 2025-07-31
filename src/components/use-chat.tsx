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
      console.log("Resuming stream for:", id);
      chat.resumeStream();
      runningChats.add(id);
    }

    return () => {
      if (runningChats.has(id)) {
        console.log("Cleaning up stream for:", id);
        chat.stop().then(() => {
          runningChats.delete(id);
        });
      }
    };
  }, [resume, id, chat]);

  return chat;
}
