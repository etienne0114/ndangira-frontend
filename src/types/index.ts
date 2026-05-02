export type ListingCategory =
  | "GROCERIES"
  | "SUPERMARKET"
  | "PHARMACY"
  | "RESTAURANTS"
  | "FASHION"
  | "ELECTRONICS"
  | "HOME"
  | "HOUSING"
  | "HEALTH"
  | "SERVICES";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER";

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
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

export type Merchant = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  businessType: ListingCategory;
  neighborhood: string;
  district: string;
  addressLine?: string | null;
  description?: string | null;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  verified: boolean;
  aiEnabled: boolean;
};

export type AuthResponse = {
  token: string;
  merchant: Merchant;
};

export type MerchantDashboardResponse = {
  merchant: Merchant;
  listings: Array<{
    id: string;
    title: string;
    description: string;
    category: ListingCategory;
    priceRwf: number;
    unitLabel: string;
    inventoryStatus: InventoryStatus;
    isFeatured: boolean;
    freshnessNote?: string | null;
    tags: string[];
    createdAt: string;
  }>;
  metrics: {
    totalListings: number;
    inStock: number;
    lowStock: number;
    featured: number;
  };
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
