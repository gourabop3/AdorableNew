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
        "Use this tool to document and verify file operations efficiently. For 1st prompt (new app): just verify file creation. For 2nd+ prompts (modifications): verify you read existing files before modifying them. IMPORTANT: Keep verification FAST - don't run lengthy tests for small changes. This enforces the pattern: 1st prompt = create files directly, 2nd+ prompts = read before modify.",
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
            reminder: "Perfect! You followed the complete read-modify-verify cycle. Remember: keep testing FAST - only use http_test for major changes."
          };
        }
        
        return { success: false, message: "Unknown action" };
      },
    }),
    search_website_design: createTool({
      id: "search_website_design",
      description:
        "Search Google for current website designs and layouts to clone. Use this when user asks to clone a website like 'clone YouTube' or 'build Netflix homepage'. This will find current design references and screenshots to recreate the exact same layout and styling.",
      inputSchema: z.object({
        website_name: z.string().describe("The website to search for (e.g., 'YouTube', 'Netflix', 'Instagram')"),
        search_type: z.enum(["homepage", "interface", "design", "layout"]).describe("What aspect to search for"),
        additional_terms: z.string().optional().describe("Additional search terms like '2025', 'current', 'mobile' etc."),
      }),
      execute: async ({ website_name, search_type, additional_terms }) => {
        try {
          const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
          const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
          
          if (!apiKey || !searchEngineId) {
            return {
              success: false,
              error: "Google Custom Search API credentials not configured"
            };
          }

          // Build search query
          const searchQuery = `${website_name} ${search_type} ${additional_terms || 'current 2025'}`.trim();
          
          // Make Google Custom Search API request
          const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=5`;
          
          const response = await fetch(searchUrl);
          const data = await response.json();
          
          if (!response.ok) {
            return {
              success: false,
              error: `Google Search API error: ${data.error?.message || 'Unknown error'}`
            };
          }

          if (!data.items || data.items.length === 0) {
            return {
              success: false,
              error: `No search results found for "${searchQuery}"`
            };
          }

          // Extract useful information from search results
          const results = data.items.slice(0, 3).map((item: any) => ({
            title: item.title,
            link: item.link,
            image: item.image?.thumbnailLink || item.link,
            snippet: item.snippet,
            contextLink: item.image?.contextLink,
          }));

          return {
            success: true,
            searchQuery,
            totalResults: data.searchInformation?.totalResults || 0,
            results,
            message: `Found ${results.length} design references for ${website_name}. Use these to recreate the current design.`,
            designInsights: `Based on search results for "${searchQuery}", I can see current 2025 ${website_name} design patterns. I'll now analyze these references and recreate the components with matching layouts, colors, and styling.`
          };

        } catch (error) {
          return {
            success: false,
            error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      },
    }),
    enforce_tool_usage: createTool({
      id: "enforce_tool_usage",
      description:
        "MANDATORY tool that must be called before making ANY file modifications on 2nd+ prompts. This prevents the AI from pretending to edit files. Call this to confirm you will actually use tools, not just describe changes.",
      inputSchema: z.object({
        action: z.enum(["confirm_will_read_file", "confirm_will_edit_file", "confirm_completed_changes"]),
        file_path: z.string(),
        commitment: z.string().describe("Your commitment to actually use the tools, not just describe changes"),
      }),
      execute: async ({ action, file_path, commitment }) => {
        const timestamp = new Date().toISOString();
        
        if (action === "confirm_will_read_file") {
          return {
            success: true,
            message: `✅ COMMITMENT LOGGED: You committed to read ${file_path} at ${timestamp}`,
            warning: "You MUST now actually use read_file tool - no pretending allowed!",
            next_step: "Now use read_file tool to actually read the file content."
          };
        } else if (action === "confirm_will_edit_file") {
          return {
            success: true,
            message: `✅ COMMITMENT LOGGED: You committed to edit ${file_path} at ${timestamp}`,
            warning: "You MUST now actually use edit_file tool - no pretending allowed!",
            next_step: "Now use edit_file tool to actually make the changes."
          };
        } else if (action === "confirm_completed_changes") {
          return {
            success: true,
            message: `✅ CHANGES LOGGED: You completed changes to ${file_path} at ${timestamp}`,
            reminder: "Good! You actually used the tools instead of pretending.",
            commitment_fulfilled: commitment
          };
        }
        
        return { success: false, message: "Unknown action" };
      },
    }),
  },
});
