import { NextApiRequest, NextApiResponse } from "next";
import { generateAndUpdateTitle } from "@/lib/chat/chat-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, currentInput } = req.body;

    if (!sessionId || !currentInput) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Convert NextApiRequest to Request for compatibility
    const request = new Request("http://localhost", {
      method: req.method,
      headers: new Headers(req.headers as HeadersInit),
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    const result = await generateAndUpdateTitle(sessionId, currentInput, request);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error generating title:", error);
    return res.status(500).json({ error: "Failed to generate title" });
  }
}
