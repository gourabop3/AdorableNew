import { useState } from "react";
import { PromptInputBasic } from "@/components/chatinput";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I am your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setIsGenerating(true);
    // Simulate AI response (replace with real streaming logic)
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: `You said: ${input}` },
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={msg.role === "user" ? "bg-blue-100 text-blue-800 px-3 py-2 rounded-lg inline-block" : "bg-gray-100 text-gray-800 px-3 py-2 rounded-lg inline-block"}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <PromptInputBasic
        input={input}
        onValueChange={setInput}
        isGenerating={isGenerating}
        onSubmit={handleSend}
        stop={() => setIsGenerating(false)}
      />
    </div>
  );
}