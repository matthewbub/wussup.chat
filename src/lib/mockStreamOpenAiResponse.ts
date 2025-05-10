import { ApiChunk, OpenAiImageResponse } from "@/app/types";

// simulate a stream for th eimage response
// this is so we can dynamiclly choose the thinking|websearch|image models

//  from the server side
export const mockStreamOpenAiResponse = async (
  controller: ReadableStreamDefaultController<string>,
  response: AsyncIterable<ApiChunk> & OpenAiImageResponse
) => {
  // First, send a "created" event
  controller.enqueue(
    `data: ${JSON.stringify({
      type: "response.created",
      sequences: [],
    })}\n\n`
  );

  // Send an "in_progress" event
  controller.enqueue(
    `data: ${JSON.stringify({
      type: "response.in_progress",
      sequences: [],
    })}\n\n`
  );

  // Send the image URL as a delta
  controller.enqueue(
    `data: ${JSON.stringify({
      type: "app.image.delta",
      sequences: [
        {
          type: "app.image.delta",
          content: {
            contentType: response.contentType,
            image_url: response.url,
            downloadUrl: response.downloadUrl,
            pathname: response.pathname,
          },
        },
      ],
    })}\n\n`
  );

  // Send completion event
  controller.enqueue(
    `data: ${JSON.stringify({
      type: "response.completed",
      sequences: [],
    })}\n\n`
  );

  controller.close();
};
