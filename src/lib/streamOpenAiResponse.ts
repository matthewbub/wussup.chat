import { ApiChunk, ApiChunkSequence } from "@/app/types";

export const streamOpenAiResponse = async (
  controller: ReadableStreamDefaultController<string>,
  response: AsyncIterable<ApiChunk>
) => {
  const sequences: ApiChunkSequence[] = [];
  let currentType: string | null = null;
  let currentContent = "";

  const updateSequence = (type: string) => {
    // if the type has changed, push what we had collected into the sequences array
    // and prepare to collect the next type
    if (currentType) {
      sequences.push({
        type: currentType,
        content: currentContent,
      });
    }
    if (currentType !== type) {
      currentType = type;
      currentContent = "";
    }
  };

  for await (const chunk of response as unknown as AsyncIterable<ApiChunk>) {
    updateSequence(chunk.type);

    const delta = chunk?.delta ?? "";
    if (delta) {
      // continuously add to the current content until the type changes
      // this means we don't have to be additive on the client side
      // we can just replace the content with the new chunk
      currentContent += delta;
    }

    controller.enqueue(
      `data: ${JSON.stringify({
        type: chunk.type,
        sequences: [
          ...sequences,
          {
            type: currentType,
            content: currentContent,
            part: chunk?.part ?? null,
          },
        ],
      })}\n\n`
    );
  }
  controller.close();
};
