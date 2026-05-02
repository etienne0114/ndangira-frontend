export type ListingCategory =
  | "GROCERIES"
  | "RESTAURANTS"
  | "FASHION"
  | "ELECTRONICS"
  | "HOME"
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
  count: number;
  items: Listing[];
};
