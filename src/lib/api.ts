import { fallbackListings } from "./mockData";
import type {
  AiResponse,
  AuthResponse,
  ListingsQueryResult,
  MerchantDashboardResponse
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type RegisterMerchantInput = {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
  businessType: string;
  neighborhood: string;
  district: string;
  addressLine?: string;
  description?: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
};

type LoginInput = {
  email: string;
  password: string;
};

type UpdateLocationInput = {
  latitude: number;
  longitude: number;
  neighborhood: string;
  district: string;
  addressLine?: string;
  serviceRadiusKm?: number;
};

type CreateListingInput = {
  title: string;
  description: string;
  category: string;
  priceRwf: number;
  unitLabel: string;
  inventoryStatus: string;
  freshnessNote?: string;
  imageUrl?: string;
  tags: string[];
  isFeatured?: boolean;
};

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }
  return payload as T;
}

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

export async function registerMerchant(input: RegisterMerchantInput) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  return parseJson<AuthResponse>(response);
}

export async function loginMerchant(input: LoginInput) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  return parseJson<AuthResponse>(response);
}

export async function fetchMerchantDashboard(token: string) {
  const response = await fetch(`${API_URL}/api/merchant/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseJson<MerchantDashboardResponse>(response);
}

export async function updateMerchantLocation(token: string, input: UpdateLocationInput) {
  const response = await fetch(`${API_URL}/api/merchant/location`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });

  return parseJson<{ merchant: AuthResponse["merchant"] }>(response);
}

export async function createMerchantListing(token: string, input: CreateListingInput) {
  const response = await fetch(`${API_URL}/api/merchant/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });

  return parseJson<{ listing: MerchantDashboardResponse["listings"][number] }>(response);
}
