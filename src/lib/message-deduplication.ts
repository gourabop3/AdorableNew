import { UIMessage } from "ai";

interface MessageFingerprint {
  id: string;
  timestamp: number;
  contentHash: string;
}

class MessageDeduplicator {
  private recentMessages: Map<string, MessageFingerprint> = new Map();
  private readonly maxAge = 60000; // 1 minute
  private readonly maxSize = 100; // Keep last 100 messages

  private generateContentHash(message: UIMessage): string {
    // Create a simple hash based on message content
    const content = this.extractTextContent(message);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private extractTextContent(message: UIMessage): string {
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter(part => part.type === "text")
        .map(part => part.text)
        .join("");
    }
    return "";
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.recentMessages.entries());
    
    // Remove old messages
    for (const [id, fingerprint] of entries) {
      if (now - fingerprint.timestamp > this.maxAge) {
        this.recentMessages.delete(id);
      }
    }

    // If still too many messages, remove oldest ones
    if (this.recentMessages.size > this.maxSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.recentMessages.size - this.maxSize);
      
      for (const [id] of sortedEntries) {
        this.recentMessages.delete(id);
      }
    }
  }

  isDuplicate(message: UIMessage): boolean {
    this.cleanup();
    
    const contentHash = this.generateContentHash(message);
    const textContent = this.extractTextContent(message);
    
    // Skip empty messages
    if (!textContent.trim()) {
      return false;
    }

    // Check for recent messages with same content
    for (const fingerprint of this.recentMessages.values()) {
      if (fingerprint.contentHash === contentHash) {
        return true;
      }
    }

    return false;
  }

  addMessage(message: UIMessage): void {
    this.cleanup();
    
    const contentHash = this.generateContentHash(message);
    const textContent = this.extractTextContent(message);
    
    // Only track non-empty messages
    if (textContent.trim()) {
      this.recentMessages.set(message.id, {
        id: message.id,
        timestamp: Date.now(),
        contentHash,
      });
    }
  }

  clear(): void {
    this.recentMessages.clear();
  }
}

// Global deduplicator instance
const messageDeduplicator = new MessageDeduplicator();

export function isDuplicateMessage(message: UIMessage): boolean {
  return messageDeduplicator.isDuplicate(message);
}

export function addMessageToDeduplicator(message: UIMessage): void {
  messageDeduplicator.addMessage(message);
}

export function clearMessageDeduplicator(): void {
  messageDeduplicator.clear();
}