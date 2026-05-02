import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Flex, Grid, HStack, Heading, Icon, Input, Spinner, Text, VStack,
} from "@chakra-ui/react";
import {
  LuCircleCheck, LuMapPin, LuNavigation, LuSearch, LuUser, LuX, LuWholeWord,
} from "react-icons/lu";
import { HiPhoto } from "react-icons/hi2";
import { AiConcierge } from "../components/AiConcierge";
import { fetchListings } from "../lib/api";
import { TT } from "../lib/tokens";
import type { Listing, ListingCategory, UserLocation } from "../types";

const KIGALI: UserLocation = { latitude: -1.9441, longitude: 30.0619 };

const CATEGORIES: Array<{ label: string; value: "" | ListingCategory }> = [
  { label: "All",         value: ""           },
  { label: "Groceries",   value: "GROCERIES"  },
  { label: "Supermarket", value: "SUPERMARKET"},
  { label: "Pharmacy",    value: "PHARMACY"   },
  { label: "Restaurants", value: "RESTAURANTS"},
  { label: "Electronics", value: "ELECTRONICS"},
  { label: "Fashion",     value: "FASHION"    },
  { label: "Services",    value: "SERVICES"   },
  { label: "Home",        value: "HOME"       },
  { label: "Housing",     value: "HOUSING"    },
  { label: "Health",      value: "HEALTH"     },
];

const DISTANCE_OPTS = [
  { label: "2 km",      value: 2  },
  { label: "5 km",      value: 5  },
  { label: "10 km",     value: 10 },
  { label: "Any",       value: 0  },
];

const STOCK_OPTS = [
  { label: "Any",      value: "" as const       },
  { label: "In Stock", value: "IN_STOCK" as const  },
  { label: "Low",      value: "LOW_STOCK" as const },
];

type FilterState = {
  category:       "" | ListingCategory;
  stock:          "" | "IN_STOCK" | "LOW_STOCK";
  verifiedOnly:   boolean;
  maxDistanceKm:  number;
};

const DEFAULT_FILTERS: FilterState = {
  category: "", stock: "", verifiedOnly: false, maxDistanceKm: 10,
};

function fmt(rwf: number) { return `${rwf.toLocaleString()} RWF`; }

/* ── Header ───────────────────────────────────────────────────────────────── */
function Header({
  onSellClick, onAdminClick, location, locationReady, search, onSearch,
}: {
  onSellClick: () => void; onAdminClick: () => void;
  location: UserLocation; locationReady: boolean;
  search: string; onSearch: (v: string) => void;
}) {
  const [activeNav, setActiveNav] = useState("home");
  return (
    <Box
      as="header"
      bg={TT.white}
      borderBottom={`1px solid ${TT.black}`}
      h={{ base: "60px", md: "72px" }}
      px={{ base: "16px", md: "32px" }}
      display="flex" alignItems="center" gap="20px"
      position="sticky" top={0} zIndex={20}
    >
      {/* Logo */}
      <HStack spacing="6px" flexShrink={0} cursor="pointer">
        <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize={{ base: "18px", md: "20px" }} color={TT.black} letterSpacing="-0.02em">
          ngangira
        </Text>
        <Box w="8px" h="8px" bg={TT.teal} borderRadius="2px" />
      </HStack>

      {/* Nav — desktop only */}
      <HStack spacing={0} ml="4px" display={{ base: "none", lg: "flex" }}>
        {["home","browse","sellers","messages"].map((link) => (
          <Box key={link} as="button" onClick={() => setActiveNav(link)}
            px="14px" py="4px" fontSize="14px" fontWeight="600" fontFamily="'Inter',sans-serif"
            color={activeNav===link ? TT.teal : TT.black}
            borderBottom={`2px solid ${activeNav===link ? TT.teal : "transparent"}`}
            bg="transparent" border="none" textTransform="capitalize" cursor="pointer"
            style={{outline:"none"}}
          >{link}</Box>
        ))}
      </HStack>

      {/* Search — connected to live API */}
      <Box flex={1} maxW={{ base: "100%", md: "480px" }} ml="auto" position="relative">
        <Box position="absolute" left="14px" top="50%" transform="translateY(-50%)" zIndex={1} pointerEvents="none">
          <Icon as={LuSearch} boxSize="18px" color={TT.teal} />
        </Box>
        <Input
          value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder="What are you looking for?"
          h="44px" pl="42px" pr={search ? "38px" : "14px"}
          bg={TT.white} color={TT.black}
          border={`1px solid ${TT.black}`} borderRadius="8px"
          fontFamily="'Inter',sans-serif" fontSize="15px"
          _placeholder={{ color: TT.muted }}
          _focus={{ borderWidth: "2px", boxShadow: "none", borderColor: TT.black }}
        />
        {search && (
          <Box position="absolute" right="10px" top="50%" transform="translateY(-50%)" cursor="pointer" onClick={() => onSearch("")}>
            <Icon as={LuX} boxSize="15px" color={TT.muted} />
          </Box>
        )}
      </Box>

      {/* Location pill */}
      <HStack spacing="5px" fontSize="13px" flexShrink={0} display={{ base: "none", md: "flex" }}
        color={locationReady ? TT.teal : TT.muted}
        title={locationReady
          ? `GPS (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
          : "Using Kigali center — allow GPS for closer results"}
      >
        <Icon as={locationReady ? LuNavigation : LuMapPin} boxSize="15px" />
        <Text fontWeight="600">{locationReady ? "Near you" : "Kigali"}</Text>
      </HStack>

      {/* Sell + Admin */}
      <HStack spacing="8px" flexShrink={0}>
        <Box as="button" w="38px" h="38px" borderRadius="999px" border={`1px solid ${TT.black}`}
          display="flex" alignItems="center" justifyContent="center" cursor="pointer" bg={TT.white}
          onClick={onSellClick} title="Seller login" style={{outline:"none"}}>
          <Icon as={LuUser} boxSize="18px" color={TT.black} />
        </Box>
        <Box as="button" px="10px" h="32px" borderRadius="6px" border={`1px solid ${TT.black}`}
          display={{ base: "none", md: "flex" }} alignItems="center" justifyContent="center"
          cursor="pointer" bg={TT.white} onClick={onAdminClick} fontSize="12px" fontWeight="600"
          color={TT.black} fontFamily="'Inter',sans-serif" style={{outline:"none"}}>
          Admin
        </Box>
      </HStack>
    </Box>
  );
}

/* ── Hero Band ────────────────────────────────────────────────────────────── */
function HeroBand({
  onBrowse, onSellClick, categoryCounts,
}: {
  onBrowse: () => void; onSellClick: () => void;
  categoryCounts: Record<string, number>;
}) {
  const chips = [
    { label: "Groceries",   key: "GROCERIES"   },
    { label: "Pharmacy",    key: "PHARMACY"     },
    { label: "Restaurants", key: "RESTAURANTS"  },
    { label: "Electronics", key: "ELECTRONICS"  },
    { label: "Services",    key: "SERVICES"     },
    { label: "Fashion",     key: "FASHION"      },
  ];
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <Box as="section" bg={TT.black} color={TT.white}
      px={{ base: "24px", md: "56px" }} py={{ base: "40px", md: "48px" }}>
      <Box maxW="720px">
        <Text fontSize="13px" fontWeight="600" letterSpacing="0.08em" textTransform="uppercase" color={TT.teal}>
          ngangira · kigali
        </Text>
        <Heading
          fontFamily="'Poppins',sans-serif" fontWeight="700"
          fontSize={{ base: "32px", md: "56px" }} lineHeight="1.05"
          letterSpacing="-0.02em" mt="14px" color={TT.white}
        >
          Find what you need<br/>from people nearby.
        </Heading>
        <Text fontSize={{ base: "15px", md: "17px" }} color="rgba(255,255,255,0.75)" maxW="560px" mt="18px" lineHeight="1.55">
          Browse listings from verified sellers within walking distance. Message them, get directions, pick it up today.
        </Text>
        <HStack spacing="12px" mt="26px" flexWrap="wrap">
          <Box as="button" h="44px" px="20px" borderRadius="8px" bg={TT.teal} color={TT.white}
            fontFamily="'Inter',sans-serif" fontWeight="600" fontSize="15px" cursor="pointer" border="none"
            onClick={onBrowse} style={{outline:"none"}}>
            Start browsing
          </Box>
          <Box as="button" h="44px" px="20px" borderRadius="8px" bg="transparent" color={TT.white}
            border={`1px solid ${TT.white}`} fontFamily="'Inter',sans-serif" fontWeight="600" fontSize="15px"
            cursor="pointer" onClick={onSellClick} style={{outline:"none"}}>
            Sell with us
          </Box>
        </HStack>
      </Box>

      {/* Category chips with live counts */}
      <HStack spacing="10px" mt="36px" flexWrap="wrap">
        {chips.map((c) => (
          <Box key={c.key} as="button" px="16px" py="10px" border="1px solid rgba(255,255,255,0.25)"
            borderRadius="999px" display="flex" alignItems="baseline" gap="10px" fontSize="14px"
            cursor="pointer" bg="transparent" color={TT.white} style={{outline:"none"}}
            _hover={{ borderColor: "rgba(255,255,255,0.6)" }}>
            <Text as="span" fontWeight="600">{c.label}</Text>
            <Text as="span" color={TT.teal} fontWeight="700" fontSize="13px">
              {categoryCounts[c.key] ?? 0}
            </Text>
          </Box>
        ))}
        {total > 0 && (
          <Box px="16px" py="10px" border="1px solid rgba(255,255,255,0.25)" borderRadius="999px"
            display="flex" alignItems="baseline" gap="10px" fontSize="14px" color="rgba(255,255,255,0.55)">
            <Text as="span" fontWeight="500">All listings</Text>
            <Text as="span" color={TT.teal} fontWeight="700" fontSize="13px">{total}</Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
}

/* ── Filter Sidebar ───────────────────────────────────────────────────────── */
function FilterSidebar({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  return (
    <Box as="aside" w="280px" flexShrink={0} px="24px" py="28px"
      borderRight={`2px solid ${TT.black}`} display="flex" flexDirection="column"
      gap="28px" overflowY="auto" bg="white">

      {/* Distance */}
      <Box>
        <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
          color={TT.black} mb="14px" fontFamily="'Inter',sans-serif">📍 Distance</Text>
        <HStack border={`2px solid ${TT.black}`} borderRadius="8px" overflow="hidden" spacing={0}>
          {DISTANCE_OPTS.map((o, i) => (
            <Box key={o.value} as="button" flex={1} py="10px" textAlign="center" cursor="pointer"
              fontSize="12px" fontFamily="'Inter',sans-serif" fontWeight="600"
              bg={filters.maxDistanceKm===o.value ? TT.teal : TT.white}
              color={filters.maxDistanceKm===o.value ? TT.white : TT.black}
              borderLeft={i===0 ? "none" : `2px solid ${TT.black}`} border="none"
              onClick={() => onChange({ ...filters, maxDistanceKm: o.value })}
              transition="all 0.2s"
              _hover={{ opacity: 0.8 }}
              style={{outline:"none"}}>{o.label}</Box>
          ))}
        </HStack>
      </Box>

      {/* Category */}
      <Box>
        <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
          color={TT.black} mb="14px" fontFamily="'Inter',sans-serif">🏪 Category</Text>
        <VStack align="stretch" spacing="2px">
          {CATEGORIES.map((c) => (
            <Box key={c.value} as="button" px="12px" py="10px" borderRadius="8px" fontSize="14px"
              fontFamily="'Inter',sans-serif" textAlign="left" cursor="pointer" 
              bg={filters.category===c.value ? "#E0F2F1" : "transparent"} 
              border={`2px solid ${filters.category===c.value ? TT.teal : "transparent"}`}
              fontWeight={filters.category===c.value ? "700" : "500"}
              color={filters.category===c.value ? TT.teal : TT.black}
              onClick={() => onChange({ ...filters, category: c.value })}
              transition="all 0.2s"
              _hover={{ bg: "#F3F4F6", borderColor: TT.teal }}
              style={{outline:"none"}}>{c.label}</Box>
          ))}
        </VStack>
      </Box>

      {/* Availability */}
      <Box>
        <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
          color={TT.black} mb="14px" fontFamily="'Inter',sans-serif">📦 Availability</Text>
        <HStack border={`2px solid ${TT.black}`} borderRadius="8px" overflow="hidden" spacing={0}>
          {STOCK_OPTS.map((o, i) => (
            <Box key={o.value} as="button" flex={1} py="10px" textAlign="center" cursor="pointer"
              fontSize="12px" fontFamily="'Inter',sans-serif" fontWeight="600"
              bg={filters.stock===o.value ? TT.teal : TT.white}
              color={filters.stock===o.value ? TT.white : TT.black}
              borderLeft={i===0 ? "none" : `2px solid ${TT.black}`} border="none"
              onClick={() => onChange({ ...filters, stock: o.value })}
              transition="all 0.2s"
              _hover={{ opacity: 0.8 }}
              style={{outline:"none"}}>{o.label}</Box>
          ))}
        </HStack>
      </Box>

      {/* Verified Only toggle */}
      <Box>
        <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
          color={TT.black} mb="14px" fontFamily="'Inter',sans-serif">✓ Verified Sellers</Text>
        <HStack spacing="12px" cursor="pointer" p="12px" borderRadius="8px" 
          bg={filters.verifiedOnly ? "#E0F2F1" : "#F3F4F6"}
          border={`2px solid ${filters.verifiedOnly ? TT.teal : "#E5E7EB"}`}
          transition="all 0.2s"
          _hover={{ borderColor: TT.teal }}
          onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}>
          <Box w="40px" h="24px" bg={filters.verifiedOnly ? TT.teal : "#D1D5DB"} borderRadius="999px"
            position="relative" flexShrink={0} transition="background 0.2s">
            <Box position="absolute" right={filters.verifiedOnly ? "3px" : "auto"}
              left={filters.verifiedOnly ? "auto" : "3px"} top="3px" w="18px" h="18px"
              bg={TT.white} borderRadius="999px" transition="all 0.2s" boxShadow="0 2px 4px rgba(0,0,0,0.1)" />
          </Box>
          <Text fontSize="13px" fontFamily="'Inter',sans-serif" color={TT.black} fontWeight="600">
            {filters.verifiedOnly ? "Verified only" : "Show all"}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}

/* ── Product Card ─────────────────────────────────────────────────────────── */
function ProductCard({ listing, onClick }: { listing: Listing; onClick?: () => void }) {
  const isInStock = listing.inventoryStatus === "IN_STOCK";
  const waNum = (listing.merchant.whatsapp || listing.merchant.phone).replace(/\D/g, "");
  return (
    <Box border={`2px solid ${TT.black}`} borderRadius="12px" overflow="hidden" bg={TT.white}
      display="flex" flexDirection="column" cursor="pointer" transition="all 0.2s"
      _hover={{ borderColor: TT.teal, boxShadow: "0 8px 24px rgba(15,113,115,0.15)", transform: "translateY(-4px)" }} 
      onClick={onClick}>
      {/* Image */}
      <Box h="200px" bg={TT.black} position="relative" display="flex" alignItems="center"
        justifyContent="center" overflow="hidden" flexShrink={0}>
        {listing.imageUrl
          ? <Box as="img" src={listing.imageUrl} alt={listing.title} w="full" h="full" style={{objectFit:"cover"}} />
          : <Icon as={HiPhoto} boxSize="40px" color="rgba(255,255,255,0.2)" />
        }
        {/* Stock badge */}
        <Box position="absolute" top="12px" left="12px"
          display="inline-flex" alignItems="center" h="24px" px="10px"
          fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase"
          borderRadius="6px" bg={isInStock ? "#10B981" : isInStock === false && listing.inventoryStatus === "LOW_STOCK" ? "#D97706" : "#3B82F6"} color={TT.white}
          boxShadow="0 2px 8px rgba(0,0,0,0.2)">
          {isInStock ? "In Stock" : listing.inventoryStatus === "LOW_STOCK" ? "Low Stock" : "Made to Order"}
        </Box>
      </Box>
      {/* Details */}
      <Box p="16px" display="flex" flexDirection="column" gap="6px" flex={1}>
        <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="16px"
          color={TT.black} lineHeight="1.3" noOfLines={2}>{listing.title}</Text>
        <Text color={TT.muted} fontSize="13px" noOfLines={1} fontWeight="500">
          {listing.merchant.businessName} · {listing.merchant.neighborhood}
        </Text>
        {listing.merchant.verified && (
          <HStack spacing="4px" mt="2px">
            <Icon as={LuCircleCheck} boxSize="13px" color={TT.teal} />
            <Text fontSize="11px" color={TT.teal} fontWeight="700">Verified Seller</Text>
          </HStack>
        )}
        {listing.freshnessNote && (
          <Text fontSize="11px" color={TT.teal} noOfLines={1} fontWeight="500">🕐 {listing.freshnessNote}</Text>
        )}
        <HStack mt="auto" justify="space-between" alignItems="baseline" pt="12px" borderTop={`1px solid #E5E7EB`}>
          <HStack spacing="2px">
            <Icon as={LuMapPin} boxSize="14px" color={TT.teal} />
            <Text color={TT.teal} fontWeight="700" fontSize="13px">
              {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km` : "Nearby"}
            </Text>
          </HStack>
          <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="18px" color={TT.black}>
            {fmt(listing.priceRwf)}
          </Text>
        </HStack>
        {/* WhatsApp CTA - clickable but doesn't close card */}
        <Box
          as="a" href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
          mt="12px" h="40px" w="full" borderRadius="8px" bg={TT.teal} color={TT.white}
          display="flex" alignItems="center" justifyContent="center"
          fontSize="13px" fontWeight="700" fontFamily="'Inter',sans-serif"
          textDecoration="none" onClick={(e: React.MouseEvent) => e.stopPropagation()}
          _hover={{ bg: "#0D5A5C", transform: "scale(1.02)" }}
          transition="all 0.2s"
        >
          💬 Message Seller
        </Box>
      </Box>
    </Box>
  );
}

/* ── Product Detail Sheet ─────────────────────────────────────────────────── */
function DetailSheet({ listing, onClose, userLocation }: { listing: Listing; onClose: () => void; userLocation: UserLocation }) {
  const waNum = (listing.merchant.whatsapp || listing.merchant.phone).replace(/\D/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${listing.merchant.latitude},${listing.merchant.longitude}`;
  
  return (
    <Box
      position="fixed" inset={0} zIndex={50} display="flex" alignItems="flex-end"
      bg="rgba(26,26,46,0.6)" onClick={onClose}
    >
      <Box
        bg={TT.white} w="full" maxH="90vh" borderRadius="20px 20px 0 0"
        overflow="auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Teal header */}
        <Box bg={TT.teal} color={TT.white} px="24px" py="20px" position="sticky" top={0} borderBottom={`2px solid ${TT.black}`}>
          <HStack justify="space-between" align="center">
            <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="20px">
              📦 {listing.title}
            </Text>
            <Box as="button" bg="white" border="none" cursor="pointer" color={TT.teal}
              onClick={onClose} style={{outline:"none"}} w="36px" h="36px" borderRadius="999px"
              display="flex" alignItems="center" justifyContent="center" fontWeight="700">
              ✕
            </Box>
          </HStack>
        </Box>
        <Box px="24px" py="24px" display="flex" flexDirection="column" gap="20px">
          {/* Image */}
          <Box h="240px" bg={TT.black} borderRadius="12px" overflow="hidden" display="flex" alignItems="center" justifyContent="center" border={`2px solid ${TT.black}`}>
            {listing.imageUrl
              ? <Box as="img" src={listing.imageUrl} alt={listing.title} w="full" h="full" style={{objectFit:"cover"}} />
              : <Icon as={HiPhoto} boxSize="48px" color="rgba(255,255,255,0.2)" />
            }
          </Box>
          
          {/* Price & Category */}
          <Box>
            <HStack justify="space-between" alignItems="baseline" mb={3}>
              <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="32px" color={TT.teal}>
                {fmt(listing.priceRwf)}
              </Text>
              <Text fontSize="15px" color={TT.muted} fontWeight="600">per {listing.unitLabel}</Text>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              <Box bg={TT.teal} color="white" px={3} py={1} borderRadius="full" fontSize="12px" fontWeight="700">
                {listing.categoryLabel}
              </Box>
              <Box bg={listing.inventoryStatus === "IN_STOCK" ? "#E0F2F1" : "#FEF3C7"} 
                color={listing.inventoryStatus === "IN_STOCK" ? TT.teal : "#92400E"} 
                px={3} py={1} borderRadius="full" fontSize="12px" fontWeight="700">
                {listing.inventoryStatus.replace(/_/g, " ")}
              </Box>
            </HStack>
          </Box>

          {/* Description */}
          <Box>
            <Text fontSize="13px" fontWeight="700" color={TT.black} mb={2} letterSpacing="0.05em" textTransform="uppercase">Description</Text>
            <Text fontSize="15px" color={TT.black} lineHeight="1.7">{listing.description}</Text>
          </Box>

          {/* Merchant info with location */}
          <Box border={`2px solid ${TT.black}`} borderRadius="12px" p="16px" bg="#F3F4F6">
            <HStack justify="space-between" align="start" mb={3}>
              <Box>
                <HStack spacing="6px" mb={1}>
                  <Text fontWeight="700" fontSize="16px" color={TT.black}>{listing.merchant.businessName}</Text>
                  {listing.merchant.verified && <Icon as={LuCircleCheck} boxSize="16px" color={TT.teal} />}
                </HStack>
                <Text fontSize="13px" color={TT.muted} fontWeight="500">
                  📍 {listing.merchant.neighborhood}, {listing.merchant.district}
                </Text>
              </Box>
            </HStack>
            
            {/* Location Details */}
            <Box bg="white" borderRadius="8px" p={3} border={`1px solid ${TT.black}`} mb={3}>
              <Text fontSize="11px" fontWeight="700" color={TT.black} mb={2} letterSpacing="0.05em" textTransform="uppercase">📍 Live Location</Text>
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <Text fontSize="12px" fontWeight="600" color={TT.black}>Merchant:</Text>
                  <Text fontSize="12px" color={TT.muted} fontFamily="'Courier New',monospace">
                    {listing.merchant.latitude.toFixed(4)}, {listing.merchant.longitude.toFixed(4)}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Text fontSize="12px" fontWeight="600" color={TT.black}>Your Location:</Text>
                  <Text fontSize="12px" color={TT.muted} fontFamily="'Courier New',monospace">
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </Text>
                </HStack>
                <HStack spacing={2} pt={1} borderTop={`1px solid #E5E7EB`}>
                  <Icon as={LuMapPin} boxSize={4} color={TT.teal} />
                  <Text fontSize="13px" fontWeight="700" color={TT.teal}>
                    {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km away` : "Nearby"}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Contact Info */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color={TT.black} mb={2} letterSpacing="0.05em" textTransform="uppercase">Contact</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="13px" color={TT.black}>📱 {listing.merchant.phone}</Text>
                {listing.merchant.whatsapp && <Text fontSize="13px" color={TT.black}>💬 {listing.merchant.whatsapp}</Text>}
              </VStack>
            </Box>
          </Box>

          {/* Freshness Note */}
          {listing.freshnessNote && (
            <Box bg="#FEF3C7" borderRadius="8px" p={3} border={`1px solid #F59E0B`}>
              <Text fontSize="13px" color="#92400E" fontWeight="600">
                🕐 {listing.freshnessNote}
              </Text>
            </Box>
          )}

          {/* CTAs */}
          <HStack spacing="12px" pb={4}>
            <Box as="a" href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
              flex={1} h="52px" borderRadius="10px" bg={TT.teal} color={TT.white}
              display="flex" alignItems="center" justifyContent="center"
              fontSize="15px" fontWeight="700" fontFamily="'Inter',sans-serif" textDecoration="none"
              _hover={{ bg: "#0D5A5C", transform: "scale(1.02)" }}
              transition="all 0.2s"
              border={`2px solid ${TT.teal}`}>
              💬 Message Seller
            </Box>
            <Box as="a" href={mapsUrl} target="_blank" rel="noopener noreferrer"
              flex={1} h="52px" borderRadius="10px" bg={TT.black} color={TT.white}
              display="flex" alignItems="center" justifyContent="center"
              fontSize="15px" fontWeight="700" fontFamily="'Inter',sans-serif" textDecoration="none"
              _hover={{ bg: "#1A1A2E", transform: "scale(1.02)" }}
              transition="all 0.2s"
              border={`2px solid ${TT.black}`}>
              🗺️ Get Directions
            </Box>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Browse Grid ──────────────────────────────────────────────────────────── */
function BrowseGrid({
  listings, loading, search, locationReady, onSelect,
}: {
  listings: Listing[]; loading: boolean; search: string; locationReady: boolean;
  onSelect: (l: Listing) => void;
}) {
  return (
    <Box flex={1} px={{ base: "16px", md: "28px" }} py="24px" minW={0}>
      <HStack justify="space-between" align="baseline" mb="6px" flexWrap="wrap">
        <Heading fontFamily="'Poppins',sans-serif" fontWeight="700"
          fontSize={{ base: "24px", md: "32px" }} letterSpacing="-0.01em">
          What&apos;s nearby
        </Heading>
        <HStack spacing="10px">
          <Text fontSize="13px" color={TT.muted}>Sort by</Text>
          <Box as="select" h="36px" px="12px" border={`1px solid ${TT.black}`} borderRadius="6px"
            bg={TT.white} fontSize="13px" fontFamily="'Inter',sans-serif" color={TT.black}
            cursor="pointer" style={{outline:"none"}}>
            <option>Closest first</option>
            <option>Lowest price</option>
            <option>Newest</option>
          </Box>
        </HStack>
      </HStack>

      {/* Status line */}
      {search ? (
        <HStack mb="16px" spacing="8px">
          <Box h="26px" px="12px" bg={TT.teal} color={TT.white} borderRadius="999px"
            display="inline-flex" alignItems="center" fontSize="13px" fontWeight="600">
            &ldquo;{search}&rdquo;
          </Box>
          <Text fontSize="13px" color={TT.muted}>
            {loading ? "Searching…" : `${listings.length} result${listings.length !== 1 ? "s" : ""}`}
          </Text>
        </HStack>
      ) : (
        <Text color={TT.teal} fontSize="14px" fontWeight="600" mb="20px">
          {loading
            ? "Scanning nearby listings…"
            : listings.length > 0
              ? `Showing ${listings.length} listing${listings.length !== 1 ? "s" : ""} ${locationReady ? "near your location" : "near Kigali"}.`
              : "No listings found — try a wider radius."}
        </Text>
      )}

      {loading ? (
        <Flex justify="center" py="48px"><Spinner color={TT.teal} size="lg" /></Flex>
      ) : listings.length === 0 ? (
        <Flex direction="column" align="center" py="48px" gap="12px">
          <Icon as={LuMapPin} boxSize="32px" color={TT.teal} />
          <Text fontSize="15px" color={TT.muted}>Expanding search radius…</Text>
        </Flex>
      ) : (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap="16px">
          {listings.map((l) => <ProductCard key={l.id} listing={l} onClick={() => onSelect(l)} />)}
        </Grid>
      )}
    </Box>
  );
}

/* ── Map Panel ────────────────────────────────────────────────────────────── */
function MapPanel({ listings, userLocation }: { listings: Listing[]; userLocation: UserLocation }) {
  const MAP_W = 272, MAP_H = 280;

  const { pins, closest } = useMemo(() => {
    const seen = new Set<string>();
    const merchants = listings
      .filter((l) => { if (seen.has(l.merchant.id)) return false; seen.add(l.merchant.id); return true; })
      .map((l) => ({
        id: l.merchant.id, name: l.merchant.businessName, verified: l.merchant.verified,
        lat: l.merchant.latitude, lng: l.merchant.longitude, distanceKm: l.distanceKm,
      }));
    if (merchants.length === 0) return { pins: [], closest: [] };

    const lats = [userLocation.latitude, ...merchants.map(m => m.lat)];
    const lngs = [userLocation.longitude, ...merchants.map(m => m.lng)];
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padLat = (maxLat - minLat || 0.01) * 0.18;
    const padLng = (maxLng - minLng || 0.01) * 0.18;
    const dLat = maxLat - minLat + padLat * 2;
    const dLng = maxLng - minLng + padLng * 2;
    const toX = (lng: number) => ((lng - minLng + padLng) / dLng) * MAP_W;
    const toY = (lat: number) => (1 - (lat - minLat + padLat) / dLat) * MAP_H;

    return {
      pins: merchants.map(m => ({ ...m, x: toX(m.lng), y: toY(m.lat), isUser: false })),
      closest: [...merchants].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 3),
      _user: { x: toX(userLocation.longitude), y: toY(userLocation.latitude) },
    };
  }, [listings, userLocation]);

  const userX = useMemo(() => {
    if (!listings.length) return MAP_W / 2;
    const lngs = [userLocation.longitude, ...listings.map(l => l.merchant.longitude)];
    const lats = [userLocation.latitude, ...listings.map(l => l.merchant.latitude)];
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const padLng = (maxLng - minLng || 0.01) * 0.18;
    const padLat = (maxLat - minLat || 0.01) * 0.18;
    return ((userLocation.longitude - minLng + padLng) / (maxLng - minLng + padLng * 2)) * MAP_W;
  }, [listings, userLocation]);

  const userY = useMemo(() => {
    if (!listings.length) return MAP_H / 2;
    const lats = [userLocation.latitude, ...listings.map(l => l.merchant.latitude)];
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const padLat = (maxLat - minLat || 0.01) * 0.18;
    return (1 - (userLocation.latitude - minLat + padLat) / (maxLat - minLat + padLat * 2)) * MAP_H;
  }, [listings, userLocation]);

  return (
    <Box as="aside" w="320px" flexShrink={0} p="24px"
      borderLeft={`1px solid ${TT.black}`} flexDirection="column"
      gap="18px" display={{ base: "none", xl: "flex" }}>
      <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="16px">Map</Text>

      <Box h={`${MAP_H}px`} border={`1px solid ${TT.black}`} borderRadius="8px"
        position="relative" overflow="hidden" bg="#f4f3ef" flexShrink={0}>
        {[0.25, 0.5, 0.75].map(f => (
          <Box key={`h${f}`} position="absolute" top={`${f*MAP_H}px`} left={0} right={0} h="1px" bg={TT.black} opacity={0.07} />
        ))}
        {[0.33, 0.66].map(f => (
          <Box key={`v${f}`} position="absolute" top={0} bottom={0} left={`${f*MAP_W}px`} w="1px" bg={TT.black} opacity={0.07} />
        ))}
        {pins.map((pin) => (
          <Box key={pin.id} position="absolute" left={`${pin.x}px`} top={`${pin.y}px`} transform="translate(-50%,-100%)">
            <Icon as={LuMapPin} boxSize="22px" color={TT.teal} />
          </Box>
        ))}
        {/* You are here */}
        <Box position="absolute" left={`${userX}px`} top={`${userY}px`} transform="translate(-50%,-50%)"
          w="14px" h="14px" bg={TT.black} borderRadius="999px" border={`3px solid ${TT.white}`} zIndex={2} />
      </Box>

      <Text fontSize="13px" color={TT.muted}>
        {pins.length} seller{pins.length !== 1 ? "s" : ""} visible · click a card to contact.
      </Text>

      {closest.length > 0 && (
        <Box borderTop={`1px solid ${TT.black}`} pt="16px" display="flex" flexDirection="column" gap="12px">
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color={TT.muted}>
            Closest Sellers
          </Text>
          {closest.map((s) => (
            <HStack key={s.id} spacing="10px">
              <Box w="36px" h="36px" borderRadius="999px" bg={TT.black} flexShrink={0}
                display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="13px" fontWeight="700" color={TT.white}>{s.name.charAt(0)}</Text>
              </Box>
              <Box flex={1} minW={0}>
                <HStack spacing="5px">
                  <Text fontWeight="700" fontSize="13px" noOfLines={1}>{s.name}</Text>
                  {s.verified && <Icon as={LuCircleCheck} boxSize="12px" color={TT.teal} flexShrink={0} />}
                </HStack>
                <Text fontSize="12px" color={TT.teal} fontWeight="700">
                  {s.distanceKm != null ? `${s.distanceKm.toFixed(1)} km away` : "Nearby"}
                </Text>
              </Box>
            </HStack>
          ))}
        </Box>
      )}
    </Box>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
function Footer({ onSellClick, onAdminClick }: { onSellClick: () => void; onAdminClick: () => void }) {
  const cols = [
    { h: "Buyers",  links: [["Browse","#"],["Verified Sellers","#"],["Help Center","#"]] },
    { h: "Sellers", links: [["Start Selling","sell"],["Pricing","#"],["Seller Guide","#"]] },
    { h: "About",   links: [["Story","#"],["Neighborhoods","#"],["Press","#"]] },
    { h: "Legal",   links: [["Terms","#"],["Privacy","#"],["Admin","admin"]] },
  ];
  return (
    <Box as="footer" bg={TT.black} color={TT.white} px={{ base: "24px", md: "56px" }} pt="40px" pb="28px">
      <Grid templateColumns={{ base: "1fr 1fr", md: "2fr repeat(4, 1fr)" }} gap={{ base: "24px", md: "32px" }}>
        <Box gridColumn={{ base: "1 / -1", md: "1" }}>
          <HStack spacing="6px">
            <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="20px" letterSpacing="-0.02em">ngangira</Text>
            <Box w="8px" h="8px" bg={TT.teal} borderRadius="2px" />
          </HStack>
          <Text mt="12px" fontSize="13px" color="rgba(255,255,255,0.65)" lineHeight="1.5" maxW="260px">
            A hyperlocal marketplace for verified sellers and buyers within walking distance.
          </Text>
        </Box>
        {cols.map((c) => (
          <Box key={c.h}>
            <Text fontSize="11px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase"
              color={TT.teal} mb="12px">{c.h}</Text>
            <VStack align="start" spacing="8px">
              {c.links.map(([label, href]) => (
                <Box key={label} as="a" href={href === "#" ? "#" : "#"} fontSize="13px" color={TT.white}
                  textDecoration="none" cursor="pointer" _hover={{ textDecoration: "underline" }}
                  onClick={
                    href === "sell" ? (e: React.MouseEvent) => { e.preventDefault(); onSellClick(); } :
                    href === "admin" ? (e: React.MouseEvent) => { e.preventDefault(); onAdminClick(); } :
                    undefined
                  }>{label}</Box>
              ))}
            </VStack>
          </Box>
        ))}
      </Grid>
      <HStack mt="32px" pt="18px" borderTop="1px solid rgba(255,255,255,0.15)"
        justify="space-between" fontSize="12px" color="rgba(255,255,255,0.5)">
        <Text>© ngangira 2026</Text>
        <Text>Made for Kigali.</Text>
      </HStack>
    </Box>
  );
}

/* ── BuyerHome ────────────────────────────────────────────────────────────── */
type BuyerHomeProps = { onSellClick: () => void; onAdminClick: () => void };

export function BuyerHome({ onSellClick, onAdminClick }: BuyerHomeProps) {
  const browseRef = useRef<HTMLDivElement>(null);

  const [search, setSearch]           = useState("");
  const [debSearch, setDebSearch]     = useState("");
  const [filters, setFilters]         = useState<FilterState>(DEFAULT_FILTERS);
  const [listings, setListings]       = useState<Listing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [location, setLocation]       = useState<UserLocation>(KIGALI);
  const [locationReady, setLocReady]  = useState(false);
  const [catCounts, setCatCounts]     = useState<Record<string, number>>({});
  const [selected, setSelected]       = useState<Listing | null>(null);

  // Debounce search 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Geolocation — instant Kigali fallback, GPS updates silently
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }); setLocReady(true); },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Fetch listings (re-runs on location, filters, search)
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({
      limit: "24", offset: "0",
      lat: String(location.latitude), lng: String(location.longitude), sort: "distance",
    });
    if (debSearch)           p.set("q", debSearch);
    if (filters.category)    p.set("category", filters.category);
    if (filters.stock)       p.set("inventoryStatus", filters.stock);
    if (filters.verifiedOnly) p.set("verifiedOnly", "true");
    if (filters.maxDistanceKm > 0) p.set("maxDistanceKm", String(filters.maxDistanceKm));
    fetchListings(p).then((r) => {
      setListings(r.items);
      // Build category count map from fetched results
      const counts: Record<string, number> = {};
      r.items.forEach((l) => { counts[l.category] = (counts[l.category] ?? 0) + 1; });
      setCatCounts(counts);
    }).finally(() => setLoading(false));
  }, [debSearch, filters, location]);

  return (
    <Box minH="100vh" bg={TT.white}>
      <Header
        onSellClick={onSellClick} onAdminClick={onAdminClick}
        location={location} locationReady={locationReady}
        search={search} onSearch={setSearch}
      />
      <HeroBand
        onBrowse={() => browseRef.current?.scrollIntoView({ behavior: "smooth" })}
        onSellClick={onSellClick}
        categoryCounts={catCounts}
      />

      {/* Location status strip */}
      <Box
        bg={locationReady ? "rgba(15,113,115,0.05)" : "rgba(26,26,46,0.03)"}
        borderBottom={`1px solid ${locationReady ? "rgba(15,113,115,0.12)" : "rgba(26,26,46,0.08)"}`}
        px={{ base: "16px", md: "24px" }} py="8px"
      >
        <HStack spacing="8px">
          <Icon as={locationReady ? LuNavigation : LuMapPin} boxSize="14px"
            color={locationReady ? TT.teal : TT.muted} />
          <Text fontSize="13px" color={locationReady ? TT.teal : TT.muted} fontWeight="600">
            {locationReady
              ? `Scanning within ${filters.maxDistanceKm > 0 ? `${filters.maxDistanceKm} km` : "all distances"} of your GPS location`
              : "Using Kigali center — allow location access for precise nearby results"}
          </Text>
        </HStack>
      </Box>

      {/* 3-column browse layout */}
      <Box ref={browseRef}>
        <Flex minH="600px" align="stretch">
          <Box display={{ base: "none", md: "block" }}>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </Box>
          <BrowseGrid listings={listings} loading={loading} search={debSearch}
            locationReady={locationReady} onSelect={setSelected} />
          <MapPanel listings={listings} userLocation={location} />
        </Flex>
      </Box>

      {/* Mobile filter strip */}
      <Box display={{ base: "flex", md: "none" }} px="16px" py="12px" gap="8px"
        borderTop={`1px solid ${TT.black}`} overflowX="auto">
        {CATEGORIES.slice(0, 6).map((c) => (
          <Box key={c.value} as="button" flexShrink={0} h="32px" px="12px" borderRadius="999px"
            fontSize="13px" fontWeight="600" cursor="pointer" border="none"
            bg={filters.category === c.value ? TT.teal : TT.black}
            color={TT.white}
            onClick={() => setFilters(f => ({ ...f, category: f.category === c.value ? "" : c.value }))}
            style={{outline:"none"}}>{c.label}</Box>
        ))}
      </Box>

      {/* AI Concierge */}
      <Box px={{ base: "16px", md: "56px" }} py="40px" borderTop={`1px solid ${TT.black}`}>
        <Text fontFamily="'Poppins',sans-serif" fontWeight="700" fontSize="20px" mb="4px" color={TT.black}>
          AI Concierge
        </Text>
        <Text fontSize="14px" color={TT.muted} mb="16px">
          Ask about nearby prices, availability, or directions to a seller.
        </Text>
        <Box maxW="640px">
          <AiConcierge location={location} locationReady={locationReady} />
        </Box>
      </Box>

      <Footer onSellClick={onSellClick} onAdminClick={onAdminClick} />

      {/* Product detail sheet (slide-up) */}
      {selected && <DetailSheet listing={selected} onClose={() => setSelected(null)} userLocation={location} />}
    </Box>
  );
}
