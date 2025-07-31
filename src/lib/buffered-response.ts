export function bufferedResponse(originalStream: ReadableStream<Uint8Array>) {
  const textDecoder = new TextDecoder();
  const chunkBuffer: Uint8Array[] = [];
  let processingBuffer = false;
  let totalAvailableLines = 0;
  let lastTextChunk = ""; // for duplicate detection

  // Count real newlines in the decoded text
  function countNewlines(text: string): number {
    return (text.match(/\n/g) || []).length;
  }

  // Deduplicate logic
  function isDuplicate(text: string): boolean {
    return text.trim() === lastTextChunk.trim();
  }

  // Adaptive delay processor
  async function processBuffer(controller: ReadableStreamDefaultController<Uint8Array>) {
    if (processingBuffer || chunkBuffer.length === 0) return;

    processingBuffer = true;

    while (chunkBuffer.length > 0) {
      const chunk = chunkBuffer.shift()!;
      const text = textDecoder.decode(chunk, { stream: true });

      // Skip duplicate content
      if (isDuplicate(text)) continue;
      lastTextChunk = text;

      // Only delay on chunks that contain newlines
      if (text.includes("\n")) {
        const chunkLines = countNewlines(text);
        totalAvailableLines = Math.max(0, totalAvailableLines - chunkLines);

        const MIN_DELAY = 100;  // ms
        const MAX_DELAY = 1500; // ms
        const CURVE = 0.15;

        const adjustedLines = Math.max(totalAvailableLines - 1, 0);

        let delay =
          MIN_DELAY +
          (MAX_DELAY - MIN_DELAY) * Math.exp(-CURVE * adjustedLines);

        // Add randomness (±10%)
        const variation = 0.9 + Math.random() * 0.2;
        delay = Math.round(delay * variation);

        await new Promise((r) => setTimeout(r, delay));
      }

      controller.enqueue(chunk);
    }

    processingBuffer = false;
  }

  // Stream wrapper
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = originalStream.getReader();

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Drain buffer before closing
              while (chunkBuffer.length > 0 || processingBuffer) {
                await new Promise((r) => setTimeout(r, 10));
              }
              controller.close();
              break;
            }

            // Count newlines to track pacing
            const text = textDecoder.decode(value, { stream: true });
            if (text.includes("\n")) {
              totalAvailableLines += countNewlines(text);
            }

            chunkBuffer.push(value);

            // Only one processor at a time
            if (!processingBuffer) {
              processBuffer(controller);
            }
          }
        } catch (err) {
          controller.error(err);
        }
      })();
    },

    cancel() {
      chunkBuffer.length = 0;
    },
  });

  return stream;
}