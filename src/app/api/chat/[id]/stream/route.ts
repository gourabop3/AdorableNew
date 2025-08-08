import { getStream, stopStream } from "@/lib/streams";
import { NextRequest } from "next/server";
import { redisPublisher } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("GET stream for appId:", params.id);
  const currentStream = await getStream(params.id);

  if (!currentStream) {
    // If there's no existing stream, ensure the running flag is cleared so the UI won't keep attempting to resume
    await redisPublisher.del(`app:${params.id}:stream-state`);
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain",
      },
    });
  }

  return currentStream?.response();
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const appId = params.id;

  await stopStream(appId);

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/plain",
    },
  });
}
