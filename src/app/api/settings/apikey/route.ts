import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { apiKey, provider } = await request.json();

    if (!apiKey || !provider) {
      return NextResponse.json(
        { error: "API key and provider are required" },
        { status: 400 }
      );
    }

    // Validate the API key by making a simple request to OpenAI
    if (provider === "openai") {
      try {
        const openai = new OpenAI({
          apiKey,
        });

        // Make a simple request to verify the API key
        await openai.models.list();
      } catch (error) {
        console.error("Invalid OpenAI API key:", error);
        return NextResponse.json(
          { error: "Invalid OpenAI API key" },
          { status: 400 }
        );
      }
    }

    // Check if an API key already exists for this user and provider
    const existingKey = await prisma.apiKeys.findFirst({
      where: {
        userId,
        provider,
      },
    });

    let result;

    if (existingKey) {
      // Update existing API key
      result = await prisma.apiKeys.update({
        where: {
          id: existingKey.id,
        },
        data: {
          apiKey,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new API key
      result = await prisma.apiKeys.create({
        data: {
          userId,
          apiKey,
          provider,
        },
      });
    }

    // Don't return the actual API key in the response
    return NextResponse.json({
      id: result.id,
      provider: result.provider,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if an API key exists for this user and provider
    const existingKey = await prisma.apiKeys.findMany({
      where: {
        userId,
      },
    });

    if (!existingKey) {
      return NextResponse.json({ exists: false });
    }

    // Return information about the API key without the actual key
    return NextResponse.json({
      exists: true,
      apiKeys: existingKey,
    });
  } catch (error) {
    console.error("Error checking API key:", error);
    return NextResponse.json(
      { error: "Failed to check API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the provider from the URL query params
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    // Delete the API key for this user and provider
    await prisma.apiKeys.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
