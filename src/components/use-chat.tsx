import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

// This utility prevents stream resumption race conditions and duplicate messages
// by tracking running chats and implementing proper cleanup
const runningChats = new Set<string>();
export function useChatSafe(
  options: Parameters<typeof useChat>[0] & { id: string; onFinish?: () => void }
) {
  const id = options.id;
  const resume = options?.resume;

  // Ensure we have the correct API path
  if (!options.api) {
    options.api = "/api/chat";
  }

  options.resume = undefined;

  const onFinish = options.onFinish;
  options.onFinish = () => {
    runningChats.delete(id);
    if (onFinish) {
      onFinish();
    }
  };

  const chat = useChat(options);

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
  }, [resume, id, chat]);

  return chat;
}
