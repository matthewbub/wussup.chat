import { version } from "@/constants/version";

export async function GET() {
  // return plain text response
  return new Response(version, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
