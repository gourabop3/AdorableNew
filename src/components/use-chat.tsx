import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

// For some reason, if the chat is resumed during a router page navigation, it
// will try to resume the stream multiple times and result in some sort of leak
// where the chat is spammed with new messages. This only happens in dev mode. I
// think it's related to react rendering components twice in dev mode so
// discover bugs. This utility prevents a stream from being resumed multiple
// times.
const runningChats = new Set<string>();
const resumingChats = new Set<string>(); // Track chats that are currently resuming

export function useChatSafe(
  options: Parameters<typeof useChat>[0] & { id: string; onFinish?: () => void }
) {
  const id = options.id;
  const resume = options?.resume;
  const isResumingRef = useRef(false);

  options.resume = undefined;

  const onFinish = options.onFinish;
  options.onFinish = () => {
    runningChats.delete(id);
    resumingChats.delete(id);
    isResumingRef.current = false;
    if (onFinish) {
      onFinish();
    }
  };

  const chat = useChat(options);

  useEffect(() => {
    // Prevent multiple simultaneous resumptions
    if (!runningChats.has(id) && !resumingChats.has(id) && resume && !isResumingRef.current) {
      isResumingRef.current = true;
      resumingChats.add(id);
      
      // Add small delay to prevent rapid resumptions
      setTimeout(() => {
        if (resumingChats.has(id)) {
          chat.resumeStream();
          runningChats.add(id);
          resumingChats.delete(id);
          isResumingRef.current = false;
        }
      }, 100);
    }

    return () => {
      if (runningChats.has(id)) {
        chat.stop().then(() => {
          runningChats.delete(id);
          resumingChats.delete(id);
          isResumingRef.current = false;
        });
      }
    };
  }, [resume, id, chat]);

  return chat;
}
