import type { CategoriesResponse, ListingsResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Fetch all categories from the backend (dynamic — no static fallback). */
export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error(`Categories request failed: ${response.status}`);
  return response.json() as Promise<CategoriesResponse>;
}

/** Fetch listings. Throws on failure so callers can show proper error state. */
export async function fetchListings(searchParams: URLSearchParams): Promise<ListingsResponse> {
  const response = await fetch(`${API_URL}/api/listings?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`Listings request failed: ${response.status}`);
  return response.json() as Promise<ListingsResponse>;
}

/** Ask the AI concierge. Throws on failure so the caller can show an error. */
export async function askConcierge(message: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/ai/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, lat: -1.9441, lng: 30.0619 })
  });
  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = (await response.json()) as { reply: string };
  return data.reply;
}
