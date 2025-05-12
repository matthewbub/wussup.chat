export const MESSAGE_TYPES = [
  "user",
  "user.with_attachments",
  "app.image.delta",
  "response.content_part.done",
  "response.output_text.delta",
] as const;

// we need to filter these out from the messages array on page load only
export const STATUS_TYPES = [
  "response.in_progress",
  "response.output_item.added",
  "response.content_part.added",
  "response.completed",
];
