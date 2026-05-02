import { fallbackListings } from "./mockData";
import type { AiResponse, ListingsQueryResult } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchListings(searchParams: URLSearchParams) {
  try {
    const response = await fetch(`${API_URL}/api/listings?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error("Unable to fetch listings");
    }

    const data = (await response.json()) as ListingsQueryResult;
    return {
      ...data,
      source: "live" as const
    };
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return {
      items: fallbackListings,
      total: fallbackListings.length,
      limit: 20,
      offset: 0,
      hasMore: false,
      source: "fallback" as const,
      errorMessage: "Live marketplace data is temporarily unavailable."
    };
  }
}

export async function askConcierge(message: string, lat?: number, lng?: number, conversationId?: string): Promise<AiResponse> {
  try {
    const response = await fetch(`${API_URL}/api/ai/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        lat: lat ?? -1.9441,
        lng: lng ?? 30.0619,
        conversationId
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    return {
      ...(await response.json() as AiResponse),
      live: true
    };
  } catch (error) {
    console.error("AI request failed:", error);
    return {
      reply: "I can help you compare nearby options, suggest alternatives, and guide you toward the fastest pickup in Kigali. Connect the backend with OpenRouter to enable live DeepSeek responses.",
      suggestions: [
        "Show me fresh vegetables nearby",
        "Find affordable restaurants in Kacyiru",
        "Compare the cheapest and closest options"
      ],
      relatedListings: [],
      conversationId: `conv_${Date.now()}`,
      live: false
    };
  }
}
