import { SYSTEM_MESSAGE } from "@/lib/system";
import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { z } from "zod";

export const memory = new Memory({
  options: {
    lastMessages: 1000,
    semanticRecall: false,
    threads: {
      generateTitle: true,
    },
  },
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!,
  }),
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  processors: [
    // new ToolCallFilter({
    //   exclude: ["read_file", "read_multiple_files"],
    // }),
    // new TokenLimiter(100_000),
  ],
});

export const builderAgent = new Agent({
  name: "BuilderAgent",
  model: google("gemini-2.5-pro"),
  instructions: SYSTEM_MESSAGE,
  memory,
  tools: {
    update_todo_list: createTool({
      id: "update_todo_list",
      description:
        "Use the update todo list tool to keep track of the tasks you need to do to accomplish the user's request. You should should update the todo list each time you complete an item. You can remove tasks from the todo list, but only if they are no longer relevant or you've finished the user's request completely and they are asking for something else. Make sure to update the todo list each time the user asks you do something new. If they're asking for something new, you should probably just clear the whole todo list and start over with new items. For complex logic, use multiple todos to ensure you get it all right rather than just a single todo for implementing all logic.",
      inputSchema: z.object({
        items: z.array(
          z.object({
            description: z.string(),
            completed: z.boolean(),
          })
        ),
      }),
      execute: async ({}) => {
        return {};
      },
    }),
    verify_file_changes: createTool({
      id: "verify_file_changes",
      description:
        "Use this tool to document and verify file operations. For 1st prompt (new app): just verify file creation. For 2nd+ prompts (modifications): verify you read existing files before modifying them. This enforces the pattern: 1st prompt = create files directly, 2nd+ prompts = read before modify.",
      inputSchema: z.object({
        action: z.enum(["created_new_file", "read_before_modify", "verify_after_modify"]),
        file_path: z.string(),
        prompt_number: z.number().optional(),
        what_you_found: z.string().optional(),
        what_you_changed: z.string().optional(),
        verification_result: z.string().optional(),
      }),
      execute: async ({ action, file_path, prompt_number, what_you_found, what_you_changed, verification_result }) => {
        const timestamp = new Date().toISOString();
        
        if (action === "created_new_file") {
          return {
            success: true,
            message: `✅ NEW FILE CREATED: ${file_path} at ${timestamp}`,
            reminder: "Good! For new apps, you create files directly without reading first."
          };
        } else if (action === "read_before_modify") {
          return {
            success: true,
            message: `✅ READ BEFORE MODIFY: Read ${file_path} at ${timestamp}. Found: ${what_you_found}`,
            reminder: `Excellent! For prompt #${prompt_number || 'N'} (modification), you properly read the existing file first.`
          };
        } else if (action === "verify_after_modify") {
          return {
            success: true,
            message: `✅ VERIFIED CHANGES: Modified ${file_path} at ${timestamp}. Changes: ${what_you_changed}. Verification: ${verification_result}`,
            reminder: "Perfect! You followed the complete read-modify-verify cycle."
          };
        }
        
        return { success: false, message: "Unknown action" };
      },
    }),
  },
});
