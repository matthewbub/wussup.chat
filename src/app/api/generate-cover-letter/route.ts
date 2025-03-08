import { NextResponse } from "next/server";

import { streamText } from "ai";
import clsx from "clsx";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

// This is how we need to structure the messages
// messages [
//   {
//     role: 'user',
//     content: 'wht is this in one sentence',
//     experimental_attachments: [ {
//        {
//           name: 'my resume.pdf',
//           contentType: 'application/pdf',
//           url: 'data:application/pdf;base64,JVB...'
//        }
//     ],
//     parts: [ { type: 'text', text: 'wht is this in one sentence' } ]
//   }
// ]
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jobDescription = formData.get("jobDescription");
    const resume = formData.get("resume") as File | null;
    const jobDescriptionFile = formData.get("job-description") as File | null;

    let jobDescriptionContent = "";
    if (jobDescriptionFile) {
      // read file content using arrayBuffer and text decoder
      const buffer = await jobDescriptionFile.arrayBuffer();
      jobDescriptionContent = new TextDecoder().decode(buffer);
    }

    let resumeContent = "";
    if (resume) {
      // read file content using arrayBuffer and text decoder
      const buffer = await resume.arrayBuffer();
      resumeContent = Buffer.from(buffer).toString("base64");
    }

    let experimental_attachments: {
      name: string;
      contentType: string;
      url: string;
    }[] = [];
    if (resume && resume.type === "application/pdf") {
      experimental_attachments = [
        {
          name: resume.name,
          contentType: resume.type,
          url: `data:${resume.type};base64,${resumeContent}`,
        },
      ];
    }

    const result = await streamText({
      model: anthropic("claude-3-7-sonnet-20250219"),
      // model: google("gemini-2.0-pro-exp-02-05"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional cover letter writer." +
            "Generate a short 3-paragraph cover letter in HTML format (use <br /> for line breaks)" +
            "based on the provided job description and resume." +
            "Include a formal greeting and closing. No title needed." +
            "If a PDF is attached, assume it is a Resume" +
            "Do not lie or make up information. Do not list skills that were not listed in the resume." +
            "If I do not possess the skills, mention that I am willing to learn." +
            "Do not use any emojis or special characters.",
        },
        {
          role: "user",
          content: clsx(
            "this is the Job Description: ",
            jobDescriptionContent ? jobDescriptionContent : jobDescription
          ),
          experimental_attachments,
        },
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
