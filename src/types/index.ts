export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER";

export type Category = {
  id: string;
  name: string;          // normalised UPPER_SNAKE_CASE, e.g. "GROCERIES"
  label: string;         // display text, e.g. "Groceries"
  isSystem: boolean;
  listingCount: number;
  createdAt: string;
};

export type CategoriesResponse = {
  items: Category[];
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;      // name for backward compat: "GROCERIES"
  categoryId: string;
  categoryLabel: string; // human label: "Groceries"
  priceRwf: number;
  unitLabel: string;
  inventoryStatus: InventoryStatus;
  isFeatured: boolean;
  freshnessNote?: string | null;
  imageUrl?: string | null;
  tags: string[];
  distanceKm: number | null;
  merchant: {
    id: string;
    businessName: string;
    ownerName: string;
    phone: string;
    whatsapp?: string | null;
    neighborhood: string;
    district: string;
    verified: boolean;
  };
};

export type ListingsResponse = {
  items: Listing[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ListingsQueryResult = ListingsResponse & {
  source: "live" | "fallback";
  errorMessage?: string;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type AiResponse = {
  reply: string;
  suggestions: string[];
  relatedListings: Array<{
    id: string;
    title: string;
    priceRwf: number;
    merchant: string;
    neighborhood: string;
    distance: number | null;
    category: ListingCategory;
    unitLabel: string;
    inventoryStatus: InventoryStatus;
    freshnessNote: string | null;
    verified: boolean;
  }>;
  conversationId: string;
  live?: boolean;
};
