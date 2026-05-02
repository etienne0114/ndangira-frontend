import type { AiResponse, CategoriesResponse, ListingsResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallbackMessage;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch(`${API_URL}/api/categories`);
  return parseJson<CategoriesResponse>(response, `Categories request failed: ${response.status}`);
}

export async function fetchListings(searchParams: URLSearchParams): Promise<ListingsResponse> {
  const response = await fetch(`${API_URL}/api/listings?${searchParams.toString()}`);
  return parseJson<ListingsResponse>(response, `Listings request failed: ${response.status}`);
}

export async function askConcierge(
  message: string,
  lat = -1.9441,
  lng = 30.0619,
  conversationId?: string
): Promise<AiResponse> {
  const response = await fetch(`${API_URL}/api/ai/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, lat, lng, conversationId })
  });

  return parseJson<AiResponse>(response, `AI request failed: ${response.status}`);
}
