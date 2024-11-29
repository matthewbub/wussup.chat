export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomStr = Math.random().toString(36).substring(2, 8); // Get 6 random chars
  return `${prefix}${timestamp}${randomStr}`;
}
