import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

// For some reason, if the chat is resumed during a router page navigation, it
// will try to resume the stream multiple times and result in some sort of leak
// where the chat is spammed with new messages. This only happens in dev mode. I
// think it's related to react rendering components twice in dev mode so
// discover bugs. This utility prevents a stream from being resumed multiple
// times.
const runningChats = new Set<string>();
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
