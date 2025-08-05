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
        "Use this tool to document and verify that you have properly read files before modifying them and verified changes after making them. This tool helps enforce the 'read before write' pattern and ensures you're not pretending to make changes. Always use this after reading files and after making changes.",
      inputSchema: z.object({
        action: z.enum(["read_before_modify", "verify_after_modify"]),
        file_path: z.string(),
        what_you_found: z.string().optional(),
        what_you_changed: z.string().optional(),
        verification_result: z.string().optional(),
      }),
      execute: async ({ action, file_path, what_you_found, what_you_changed, verification_result }) => {
        const timestamp = new Date().toISOString();
        
        if (action === "read_before_modify") {
          return {
            success: true,
            message: `✅ VERIFIED: Read ${file_path} at ${timestamp}. Found: ${what_you_found}`,
            reminder: "Now you can make informed changes to this file based on what you actually read."
          };
        } else if (action === "verify_after_modify") {
          return {
            success: true,
            message: `✅ VERIFIED: Modified ${file_path} at ${timestamp}. Changes: ${what_you_changed}. Verification: ${verification_result}`,
            reminder: "Changes have been properly verified. Good job following the read-modify-verify pattern!"
          };
        }
        
        return { success: false, message: "Unknown action" };
      },
    }),
  },
});
