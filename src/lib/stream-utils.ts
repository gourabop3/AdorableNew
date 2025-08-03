"use server";

import { redisPublisher } from "./redis";

// Stream continuity management
export class StreamContinuityManager {
  private static instance: StreamContinuityManager;
  private activeStreams = new Map<string, { startTime: number; lastActivity: number }>();

  static getInstance(): StreamContinuityManager {
    if (!StreamContinuityManager.instance) {
      StreamContinuityManager.instance = new StreamContinuityManager();
    }
    return StreamContinuityManager.instance;
  }

  async startStream(appId: string): Promise<void> {
    this.activeStreams.set(appId, {
      startTime: Date.now(),
      lastActivity: Date.now()
    });
    
    await redisPublisher.set(`app:${appId}:stream-state`, "running", { EX: 15 });
    await redisPublisher.set(`app:${appId}:stream-continuity`, "active", { EX: 30 });
  }

  async updateStreamActivity(appId: string): Promise<void> {
    const stream = this.activeStreams.get(appId);
    if (stream) {
      stream.lastActivity = Date.now();
    }
    
    await redisPublisher.set(`app:${appId}:stream-state`, "running", { EX: 15 });
  }

  async endStream(appId: string): Promise<void> {
    this.activeStreams.delete(appId);
    await redisPublisher.del(`app:${appId}:stream-state`);
    await redisPublisher.del(`app:${appId}:stream-continuity`);
  }

  async isStreamActive(appId: string): Promise<boolean> {
    const continuity = await redisPublisher.get(`app:${appId}:stream-continuity`);
    return continuity === "active";
  }

  async getStreamAge(appId: string): Promise<number> {
    const stream = this.activeStreams.get(appId);
    if (!stream) return 0;
    return Date.now() - stream.startTime;
  }
}

// Chunk management for smoother streaming
export class ChunkManager {
  private static readonly CHUNK_DELAY = 30; // 30ms between chunks
  private static readonly CODE_CHUNK_SIZE = 1; // 1 character for code
  private static readonly TEXT_CHUNK_SIZE = 10; // 10 characters for text

  static async processChunk(chunk: string, isCodeBlock: boolean = false): Promise<string[]> {
    if (isCodeBlock) {
      // For code blocks, return character by character
      return chunk.split('');
    } else {
      // For regular text, return in small chunks
      const chunks: string[] = [];
      for (let i = 0; i < chunk.length; i += this.TEXT_CHUNK_SIZE) {
        chunks.push(chunk.slice(i, i + this.TEXT_CHUNK_SIZE));
      }
      return chunks;
    }
  }

  static getChunkDelay(isCodeBlock: boolean = false): number {
    return isCodeBlock ? this.CHUNK_DELAY * 2 : this.CHUNK_DELAY;
  }
}

// Stream health monitoring
export class StreamHealthMonitor {
  static async checkStreamHealth(appId: string): Promise<{
    isHealthy: boolean;
    age: number;
    lastActivity: number;
  }> {
    const streamState = await redisPublisher.get(`app:${appId}:stream-state`);
    const continuity = await redisPublisher.get(`app:${appId}:stream-continuity`);
    
    const isHealthy = streamState === "running" && continuity === "active";
    const age = Date.now() - (parseInt(await redisPublisher.get(`app:${appId}:stream-start`) || "0"));
    const lastActivity = parseInt(await redisPublisher.get(`app:${appId}:stream-last-activity`) || "0");
    
    return { isHealthy, age, lastActivity };
  }

  static async markStreamActivity(appId: string): Promise<void> {
    await redisPublisher.set(`app:${appId}:stream-last-activity`, Date.now().toString(), { EX: 30 });
  }
}