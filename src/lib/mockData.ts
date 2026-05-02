import type { Listing } from "../types";

export const fallbackListings: Listing[] = [
  {
    id: "1",
    title: "Fresh Tomatoes Basket",
    description: "Same-morning tomatoes sourced from nearby farms and ready for pickup.",
    category: "GROCERIES",
    priceRwf: 3500,
    unitLabel: "basket",
    inventoryStatus: "IN_STOCK",
    isFeatured: true,
    freshnessNote: "Updated 18 minutes ago",
    imageUrl: null,
    tags: ["fresh", "market-day", "family-size"],
    distanceKm: 0.9,
    merchant: {
      id: "m1",
      businessName: "Kimironko Fresh Hub",
      ownerName: "Aline Uwimana",
      phone: "+250788000111",
      whatsapp: "+250788000111",
      neighborhood: "Kimironko",
      district: "Gasabo",
      latitude: -1.9499,
      longitude: 30.1256,
      verified: true
    }
  },
  {
    id: "2",
    title: "Bluetooth Speaker",
    description: "Portable speaker with strong battery life and clear sound.",
    category: "ELECTRONICS",
    priceRwf: 38000,
    unitLabel: "piece",
    inventoryStatus: "IN_STOCK",
    isFeatured: true,
    freshnessNote: "Pickup ready today",
    imageUrl: null,
    tags: ["audio", "portable"],
    distanceKm: 2.1,
    merchant: {
      id: "m2",
      businessName: "Kacyiru Tech Corner",
      ownerName: "Grace Mukamana",
      phone: "+250788000333",
      whatsapp: "+250788000333",
      neighborhood: "Kacyiru",
      district: "Gasabo",
      latitude: -1.9441,
      longitude: 30.0929,
      verified: false
    }
  },
  {
    id: "3",
    title: "Hair Braiding Appointment",
    description: "Fast neighborhood braiding service with WhatsApp booking.",
    category: "SERVICES",
    priceRwf: 12000,
    unitLabel: "session",
    inventoryStatus: "IN_STOCK",
    isFeatured: false,
    freshnessNote: "Next slot in 40 minutes",
    imageUrl: null,
    tags: ["beauty", "same-day"],
    distanceKm: 3.4,
    merchant: {
      id: "m3",
      businessName: "Nyamirambo Home Select",
      ownerName: "Eric Nshimiyimana",
      phone: "+250788000222",
      whatsapp: "+250788000222",
      neighborhood: "Nyamirambo",
      district: "Nyarugenge",
      latitude: -1.9706,
      longitude: 30.0396,
      verified: true
    }
  }
];
