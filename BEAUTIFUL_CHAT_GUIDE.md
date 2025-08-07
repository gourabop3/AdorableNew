# 🎨 Beautiful Streaming Chat Guide

This guide shows you how to implement the beautiful streaming chat interface inspired by AI Manus in your Next.js project.

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import BeautifulChatLayout from "@/components/beautiful-chat-layout";

export default function MyChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Your message sending logic here
    setIsStreaming(true);
    // ... send message to AI
    setIsStreaming(false);
  };

  return (
    <BeautifulChatLayout
      appId="my-chat"
      initialMessages={messages}
      running={isStreaming}
      onSendMessage={handleSendMessage}
      title="AI Assistant"
    />
  );
}
```

### 2. Advanced Usage with Custom Styling

```tsx
import { GradientChatContainer, FloatingActionButton } from "@/components/beautiful-chat-layout";

export default function AdvancedChatPage() {
  return (
    <GradientChatContainer>
      <div className="min-h-screen flex flex-col">
        {/* Custom Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <h1 className="text-2xl font-bold p-4">My AI Chat</h1>
        </div>

        {/* Chat Container */}
        <div className="flex-1">
          <BeautifulChatLayout
            appId="advanced-chat"
            initialMessages={messages}
            running={isStreaming}
            onSendMessage={handleSendMessage}
            title="AI Assistant"
            className="h-full"
          />
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={handleNewChat}
          icon={<Plus className="w-6 h-6" />}
          label="New Chat"
        />
      </div>
    </GradientChatContainer>
  );
}
```

## 🎯 Key Features

### ✨ Smooth Animations
- **Message Bubbles**: Fade in with scale animations
- **Typing Indicators**: Animated dots during streaming
- **Avatar Animations**: Rotating and scaling effects
- **Scroll Animations**: Smooth auto-scroll with bounce effects

### 🌈 Beautiful Design
- **Gradient Backgrounds**: Purple to pink gradients
- **Glass Morphism**: Backdrop blur effects
- **Rounded Corners**: Modern 2xl border radius
- **Shadow Effects**: Subtle depth and elevation

### 📱 Responsive Layout
- **Mobile-First**: Optimized for all screen sizes
- **Flexible Input**: Auto-resizing textarea
- **Touch-Friendly**: Large touch targets
- **Keyboard Support**: Enter to send, Shift+Enter for new line

### 🔄 Streaming Features
- **Real-time Updates**: Live message streaming
- **Typing Indicators**: Visual feedback during AI responses
- **Stop Functionality**: Ability to interrupt AI
- **Status Indicators**: Complete, streaming, error states

## 🧩 Component Breakdown

### 1. BeautifulChatLayout
The main chat container with all features integrated.

```tsx
interface BeautifulChatLayoutProps {
  appId: string;                    // Unique chat identifier
  initialMessages: UIMessage[];     // Starting messages
  isLoading?: boolean;              // Loading state
  running: boolean;                 // Streaming state
  onStop?: () => void;             // Stop streaming callback
  onSendMessage?: (message: string) => void; // Send message callback
  title?: string;                   // Chat title
  className?: string;               // Custom CSS classes
}
```

### 2. StreamingMessage
Individual message component with streaming animations.

```tsx
interface StreamingMessageProps {
  message: UIMessage;               // Message data
  isStreaming?: boolean;            // Currently streaming
  isLast?: boolean;                 // Last message in chat
  onComplete?: () => void;          // Streaming complete callback
}
```

### 3. StreamingInput
Enhanced input component with streaming states.

```tsx
interface StreamingInputProps {
  onSubmit: (message: string) => void;  // Submit callback
  onStop: () => void;                   // Stop callback
  isStreaming: boolean;                 // Streaming state
  disabled?: boolean;                   // Disabled state
  placeholder?: string;                 // Input placeholder
}
```

## 🎨 Customization

### 1. Custom Colors

```tsx
// Override default colors in globals.css
:root {
  --chat-primary: 262.1 83.3% 57.8%;    /* Purple */
  --chat-secondary: 330 100% 50%;        /* Pink */
  --chat-accent: 217.2 91.2% 59.8%;     /* Blue */
}
```

### 2. Custom Animations

```tsx
// Custom animation variants
const customVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={customVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {/* Your content */}
</motion.div>
```

### 3. Custom Message Types

```tsx
// Add custom message types
const CustomMessage: React.FC<{ message: UIMessage }> = ({ message }) => {
  if (message.role === "system") {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
        <span className="text-yellow-800 dark:text-yellow-200">
          {message.content}
        </span>
      </div>
    );
  }
  
  return <StreamingMessage message={message} />;
};
```

## 🔧 Integration with Existing Code

### 1. Replace Existing Chat Component

```tsx
// Before
import Chat from "@/components/chat";

// After
import BeautifulChatLayout from "@/components/beautiful-chat-layout";
```

### 2. Update API Integration

```tsx
// Your existing API call
const handleSendMessage = async (message: string) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, appId })
    });
    
    // Handle response
    const data = await response.json();
    setMessages(prev => [...prev, data]);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### 3. Add Streaming Support

```tsx
// Enable streaming with Server-Sent Events
const handleStreamingMessage = async (message: string) => {
  const eventSource = new EventSource(`/api/chat/stream?message=${encodeURIComponent(message)}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setMessages(prev => [...prev, data]);
  };
  
  eventSource.onerror = () => {
    eventSource.close();
  };
};
```

## 🎯 Best Practices

### 1. Performance Optimization

```tsx
// Use React.memo for message components
const MessageBubble = React.memo(({ message }) => {
  return <StreamingMessage message={message} />;
});

// Debounce streaming state
const [debouncedStreaming, setDebouncedStreaming] = useState(false);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedStreaming(isStreaming);
  }, 100);
  return () => clearTimeout(timer);
}, [isStreaming]);
```

### 2. Accessibility

```tsx
// Add ARIA labels
<button
  aria-label="Send message"
  onClick={handleSubmit}
  className="send-button"
>
  <Send className="w-4 h-4" />
</button>

// Keyboard navigation
<textarea
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }}
/>
```

### 3. Error Handling

```tsx
// Add error boundaries
const ChatErrorBoundary: React.FC = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with the chat.</div>}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## 🚀 Advanced Features

### 1. File Upload Support

```tsx
const handleFileUpload = async (files: FileList) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const uploadedFiles = await response.json();
  // Handle uploaded files
};
```

### 2. Voice Input

```tsx
const handleVoiceInput = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.start();
  }
};
```

### 3. Message Reactions

```tsx
const MessageReactions: React.FC<{ messageId: string }> = ({ messageId }) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  
  return (
    <div className="flex gap-1 mt-2">
      {reactions.map(emoji => (
        <button
          key={emoji}
          onClick={() => handleReaction(messageId, emoji)}
          className="hover:scale-110 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
```

## 🎨 Theme Customization

### 1. Dark Mode Support

```tsx
// The components automatically support dark mode
// Just ensure your Tailwind config includes dark mode
module.exports = {
  darkMode: 'class', // or 'media'
  // ... rest of config
};
```

### 2. Custom Themes

```tsx
// Create custom theme variants
const themes = {
  purple: {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400'
  },
  blue: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    primary: 'from-green-500 to-emerald-500',
    secondary: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400'
  }
};
```

## 📱 Mobile Optimization

### 1. Touch Gestures

```tsx
// Add swipe gestures for mobile
const handleSwipe = (direction: 'left' | 'right') => {
  if (direction === 'left') {
    // Show message options
  } else if (direction === 'right') {
    // Reply to message
  }
};
```

### 2. Responsive Design

```tsx
// Ensure proper mobile layout
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <BeautifulChatLayout
    className="h-[calc(100vh-4rem)] sm:h-full"
  />
</div>
```

## 🔧 Troubleshooting

### Common Issues

1. **Messages not streaming**: Check your API endpoint and ensure SSE is properly configured
2. **Animations not working**: Ensure Framer Motion is installed and imported
3. **Styling issues**: Check Tailwind CSS configuration and class names
4. **Performance problems**: Use React.memo and debounce streaming states

### Debug Mode

```tsx
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

const logMessage = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Chat Debug] ${message}`, data);
  }
};
```

## 🎯 Next Steps

1. **Customize the design** to match your brand
2. **Add more message types** (images, files, code blocks)
3. **Implement real-time collaboration** features
4. **Add analytics and tracking** for user interactions
5. **Optimize for performance** with virtual scrolling for large chats

---

This beautiful streaming chat interface provides a modern, engaging user experience inspired by AI Manus while maintaining full compatibility with your existing Next.js setup. The components are highly customizable and ready for production use.