export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER";

export type Category = {
  id: string;
  name: string;
  label: string;
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
  category: string;
  categoryId: string;
  categoryLabel: string;
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
    category: string;
    categoryLabel?: string;
    unitLabel: string;
    inventoryStatus: InventoryStatus;
    freshnessNote: string | null;
    verified: boolean;
  }>;
  conversationId: string;
};
