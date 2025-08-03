import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { MCPClient } from "@mastra/mcp";
import { builderAgent } from "@/mastra/agents/builder";
import { UIMessage } from "ai";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import { getAbortCallback, setStream, stopStream } from "@/lib/streams";
import { StreamContinuityManager, StreamHealthMonitor } from "@/lib/stream-utils";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest } from "next/server";
import { redisPublisher } from "@/lib/redis";
import { MessageList } from "@mastra/core/agent";

export async function POST(req: NextRequest) {
  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp();
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  // Add request deduplication with shorter timeout
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const cacheKey = `request:${appId}:${requestId}`;
  
  // Check if this request is already being processed (shorter timeout)
  const existingRequest = await redisPublisher.get(cacheKey);
  if (existingRequest === "processing") {
    console.log("Duplicate request detected, returning existing response");
    return new Response("Request already being processed", { status: 409 });
  }
  
  // Set request processing flag with shorter timeout
  await redisPublisher.set(cacheKey, "processing", { EX: 10 }); // Reduced from 30 to 10 seconds

  const streamState = await redisPublisher.get(
    "app:" + appId + ":stream-state"
  );

  // Improved stream state management - don't force stop unless necessary
  if (streamState === "running") {
    console.log("Stream already running for appId:", appId);
    
    // Check if stream is actually active using continuity manager
    const continuityManager = StreamContinuityManager.getInstance();
    const isActuallyActive = await continuityManager.isStreamActive(appId);
    
    if (isActuallyActive) {
      // Stream is genuinely active, wait a bit before forcing stop
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const updatedState = await redisPublisher.get(
        "app:" + appId + ":stream-state"
      );
      
      // Only force stop if stream is still running after 1 second
      if (updatedState === "running") {
        console.log("Force stopping previous stream for appId:", appId);
        stopStream(appId);
        await continuityManager.endStream(appId);

        // Wait with timeout instead of infinite loop
        const maxAttempts = 30; // 15 seconds max
        let attempts = 0;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const currentState = await redisPublisher.get(
            "app:" + appId + ":stream-state"
          );
          if (currentState !== "running") {
            break;
          }
          attempts++;
        }

        // If stream is still running after max attempts, return an error
        if (attempts >= maxAttempts) {
          await redisPublisher.del(`app:${appId}:stream-state`);
          return new Response(
            "Previous stream is still shutting down, please try again",
            { status: 429 }
          );
        }
      }
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const { mcpEphemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
  });

  const resumableStream = await sendMessage(
    appId,
    mcpEphemeralUrl,
    messages.at(-1)!
  );

  // Initialize stream tracking
  const continuityManager = StreamContinuityManager.getInstance();
  await continuityManager.startStream(appId);
  await redisPublisher.set(`app:${appId}:stream-start`, Date.now().toString(), { EX: 30 });

  return resumableStream.response();
}

export async function sendMessage(
  appId: string,
  mcpUrl: string,
  message: UIMessage
) {
  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: {
      dev_server: {
        url: new URL(mcpUrl),
      },
    },
  });

  const toolsets = await mcp.getToolsets();

  await (
    await builderAgent.getMemory()
  )?.saveMessages({
    messages: [
      {
        content: {
          parts: message.parts,
          format: 3,
        },
        role: "user",
        createdAt: new Date(),
        id: message.id,
        threadId: appId,
        type: "text",
        resourceId: appId,
      },
    ],
  });

  const controller = new AbortController();
  let shouldAbort = false;
  await getAbortCallback(appId, () => {
    shouldAbort = true;
  });

  let lastKeepAlive = Date.now();

  const messageList = new MessageList({
    resourceId: appId,
    threadId: appId,
  });

  const stream = await builderAgent.stream([], {
    threadId: appId,
    resourceId: appId,
    maxSteps: 100,
    maxRetries: 0,
    maxOutputTokens: 8000,
    toolsets,
    async onChunk() {
      // More frequent keep-alive updates to prevent buffering
      if (Date.now() - lastKeepAlive > 2000) { // Reduced from 5000 to 2000ms
        lastKeepAlive = Date.now();
        
        // Use continuity manager for better stream tracking
        const continuityManager = StreamContinuityManager.getInstance();
        await continuityManager.updateStreamActivity(appId);
        await StreamHealthMonitor.markStreamActivity(appId);
      }
    },
    async onStepFinish(step) {
      messageList.add(step.response.messages, "response");

      if (shouldAbort) {
        const continuityManager = StreamContinuityManager.getInstance();
        await continuityManager.endStream(appId);
        controller.abort("Aborted stream after step finish");
        const messages = messageList.drainUnsavedMessages();
        console.log(messages);
        await builderAgent.getMemory()?.saveMessages({
          messages,
        });
      }
    },
    onError: async (error) => {
      await mcp.disconnect();
      const continuityManager = StreamContinuityManager.getInstance();
      await continuityManager.endStream(appId);
      await redisPublisher.del(cacheKey); // Clean up request deduplication
      
      // Enhanced error handling for quota issues
      if (error?.message?.includes('quota') || error?.message?.includes('429') || error?.statusCode === 429) {
        console.error("❌ Gemini API quota exceeded:", error.message);
        
        // Extract retry delay from error if available
        let retryDelay = 60; // default 60 seconds
        let quotaViolations = [];
        
        try {
          if (error.responseBody) {
            const errorData = JSON.parse(error.responseBody);
            if (errorData.error?.details) {
              const retryInfo = errorData.error.details.find((detail: any) => 
                detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
              );
              if (retryInfo?.retryDelay) {
                retryDelay = parseInt(retryInfo.retryDelay.replace('s', ''));
              }
              
              const quotaFailure = errorData.error.details.find((detail: any) => 
                detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
              );
              if (quotaFailure?.violations) {
                quotaViolations = quotaFailure.violations;
              }
            }
          }
        } catch (error) {
          console.warn("Could not parse error details:", error);
        }
        
        console.log(`⏰ Suggested retry delay: ${retryDelay} seconds`);
        console.log("🚫 Quota violations:", quotaViolations.map((v: any) => v.quotaId).join(', '));
        console.log("💡 To fix this:");
        console.log("   1. Wait for quota reset (usually 1 minute for per-minute limits, 24 hours for daily limits)");
        console.log("   2. Upgrade to a paid Google AI API plan for higher quotas");
        console.log("   3. Implement request rate limiting in your application");
        console.log("   4. Consider using a different model or reducing request frequency");
      } else {
        console.error("❌ Other error:", error);
      }
    },
    onFinish: async () => {
      const continuityManager = StreamContinuityManager.getInstance();
      await continuityManager.endStream(appId);
      await redisPublisher.del(cacheKey); // Clean up request deduplication
      await mcp.disconnect();
    },
    abortSignal: controller.signal,
  });

  console.log("Stream created for appId:", appId, "with prompt:", message);

  return await setStream(appId, message, stream);
}
