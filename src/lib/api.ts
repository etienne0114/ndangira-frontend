import { fallbackListings } from "./mockData";
import type { ListingsResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchListings(searchParams: URLSearchParams) {
  try {
    const response = await fetch(`${API_URL}/api/listings?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error("Unable to fetch listings");
    }

    return (await response.json()) as ListingsResponse;
  } catch {
    return {
      count: fallbackListings.length,
      items: fallbackListings
    };
  }
}

export async function askConcierge(message: string) {
  try {
    const response = await fetch(`${API_URL}/api/ai/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        lat: -1.9441,
        lng: 30.0619
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = (await response.json()) as { reply: string };
    return data.reply;
  } catch {
    return "I can help you compare nearby options, suggest alternatives, and guide you toward the fastest pickup in Kigali. Connect the backend with OpenRouter to enable live DeepSeek responses.";
  }
}
