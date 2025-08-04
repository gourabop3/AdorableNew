import { NextRequest } from "next/server";
import { debugUserApps } from "@/actions/debug-apps";
import { getRedisClient } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const debugInfo = await debugUserApps();
    
    return new Response(JSON.stringify(debugInfo, null, 2), {
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}