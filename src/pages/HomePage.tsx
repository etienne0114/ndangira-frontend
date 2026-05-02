import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  Icon
} from "@chakra-ui/react";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { HiMapPin, HiCheckCircle } from "react-icons/hi2";
import { SectionHeading } from "../components/SectionHeading";
import { ListingCard } from "../components/ListingCard";
import { AiConcierge } from "../components/AiConcierge";
import { fetchCategories, fetchListings } from "../lib/api";
import type { Category, Listing } from "../types";

const featureBlocks = [
  {
    title: "Hyperlocal speed",
    body: "Rank by proximity first so shoppers stop crossing the city for simple needs.",
    icon: "⚡"
  },
  {
    title: "Seller trust signals",
    body: "Show verified businesses, freshness updates, and low-stock urgency to improve decisions.",
    icon: "✓"
  },
  {
    title: "AI shopping concierge",
    body: "Use DeepSeek through OpenRouter to turn natural language into practical buying suggestions.",
    icon: "🤖"
  }
];

export function HomePage() {
  // Search bar controlled value (not yet submitted)
  const [inputValue, setInputValue] = useState("fresh");
  // What was last submitted to the API
  const [submittedQuery, setSubmittedQuery] = useState("fresh");

  const [category, setCategory] = useState("");

  // Location state
  const [location, setLocation] = useState({ lat: "-1.9441", lng: "30.0619", isDefault: true });
  const [locationLoading, setLocationLoading] = useState(false);

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Listings from API
  const [items, setItems] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  // Request GPS location
  function requestLocation() {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: String(position.coords.latitude),
            lng: String(position.coords.longitude),
            isDefault: false
          });
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        }
      );
    }
  }

  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.items))
      .catch(() => setCategoriesError(true))
      .finally(() => setCategoriesLoading(false));
    
    // Request GPS on mount
    requestLocation();
  }, []);

  // Reload listings whenever submitted query or category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (submittedQuery) params.set("q", submittedQuery);
    if (category) params.set("category", category);
    params.set("lat", location.lat);
    params.set("lng", location.lng);
    params.set("sort", "distance");

    setListingsLoading(true);
    setListingsError(null);

    fetchListings(params)
      .then((data) => setItems(data.items))
      .catch(() => {
        setListingsError("Could not reach the server. Make sure the backend is running on port 4000.");
        setItems([]);
      })
      .finally(() => setListingsLoading(false));
  }, [submittedQuery, category, location]);

  function handleSearch() {
    setSubmittedQuery(inputValue.trim());
  }

  const featured = useMemo(() => items.filter((item) => item.isFeatured), [items]);

  return (
    <Box minH="100vh" bg="#FFFFFF">
      <Container maxW="7xl" py={{ base: 6, md: 10 }}>
        <VStack align="stretch" spacing={{ base: 10, md: 16 }}>

          {/* ── Location Banner ──────────────────────────────────── */}
          <Box
            bg="linear-gradient(135deg, #0F7173 0%, #0D5A5C 100%)"
            borderRadius="20px"
            p={4}
            border="2px solid #0F7173"
            boxShadow="0 4px 12px rgba(15,113,115,0.2)"
          >
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <HStack spacing={3} flex={1}>
                <Icon as={HiMapPin} boxSize={6} color="white" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="700" color="white" letterSpacing="0.05em">
                    {location.isDefault ? "📍 DEFAULT LOCATION" : "📍 LIVE GPS LOCATION"}
                  </Text>
                  <Text fontSize="xs" color="rgba(255,255,255,0.9)">
                    {location.isDefault 
                      ? "Kigali Center • Enable GPS for accurate results" 
                      : `Lat: ${parseFloat(location.lat).toFixed(4)}, Lng: ${parseFloat(location.lng).toFixed(4)}`}
                  </Text>
                </VStack>
              </HStack>
              <Button
                onClick={requestLocation}
                isLoading={locationLoading}
                bg="white"
                color="#0F7173"
                _hover={{ bg: "#F0F9F9" }}
                borderRadius="full"
                fontWeight="700"
                size="sm"
                px={6}
              >
                {location.isDefault ? "Enable GPS" : "Refresh"}
              </Button>
            </HStack>
          </Box>

          {/* ── Hero ──────────────────────────────────────────────── */}
          <Box
            borderRadius="36px"
            bgGradient="linear(to-br, #0F7173, #1A1A2E)"
            color="white"
            overflow="hidden"
            position="relative"
            p={{ base: 7, md: 12 }}
            boxShadow="0 20px 60px rgba(15,113,115,0.3)"
          >
            <Stack spacing={10} direction={{ base: "column", lg: "row" }} align="stretch">
              <VStack align="start" spacing={6} flex="1">
                <Badge bg="rgba(255,255,255,0.2)" color="white" px={4} py={2} borderRadius="full" fontWeight="600">
                  🏪 Kigali neighborhood commerce, redesigned
                </Badge>
                <Text fontSize={{ base: "4xl", md: "6xl" }} lineHeight="0.95" fontWeight="800" letterSpacing="-0.02em">
                  Find what you need near you, not across the city.
                </Text>
                <Text color="rgba(255,255,255,0.95)" maxW="2xl" fontSize={{ base: "md", md: "lg" }} lineHeight="1.6">
                  Ndangira helps Kigali shoppers discover real nearby products and services, while
                  local businesses turn current location into a live digital storefront.
                </Text>
                <HStack spacing={4} flexWrap="wrap" pt={2}>
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    size="lg"
                    bg="white"
                    color="#0F7173"
                    borderRadius="full"
                    fontWeight="700"
                    _hover={{ bg: "#F0F9F9", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Explore nearby listings
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    borderRadius="full"
                    borderColor="white"
                    borderWidth="2px"
                    color="white"
                    fontWeight="700"
                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    as={RouterLink}
                    to="/register"
                  >
                    Start selling locally
                  </Button>
                </HStack>
              </VStack>

              <Box
                flex="1"
                bg="rgba(255,255,255,0.1)"
                backdropFilter="blur(12px)"
                borderRadius="28px"
                p={{ base: 5, md: 7 }}
                border="1px solid rgba(255,255,255,0.2)"
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Stat bg="rgba(255,255,255,0.08)" borderRadius="24px" p={4} border="1px solid rgba(255,255,255,0.1)">
                    <StatLabel color="rgba(255,255,255,0.8)" fontSize="xs" fontWeight="600">Search lift</StatLabel>
                    <StatNumber color="white" fontSize="32px" fontWeight="800">3x</StatNumber>
                    <StatHelpText color="rgba(255,255,255,0.7)" fontSize="xs">
                      "Near me" intent is growing
                    </StatHelpText>
                  </Stat>
                  <Stat bg="rgba(255,255,255,0.08)" borderRadius="24px" p={4} border="1px solid rgba(255,255,255,0.1)">
                    <StatLabel color="rgba(255,255,255,0.8)" fontSize="xs" fontWeight="600">Buyer confidence</StatLabel>
                    <StatNumber color="white" fontSize="32px" fontWeight="800">Live</StatNumber>
                    <StatHelpText color="rgba(255,255,255,0.7)" fontSize="xs">
                      Freshness & signals
                    </StatHelpText>
                  </Stat>
                  <Stat bg="rgba(255,255,255,0.08)" borderRadius="24px" p={4} border="1px solid rgba(255,255,255,0.1)">
                    <StatLabel color="rgba(255,255,255,0.8)" fontSize="xs" fontWeight="600">Business impact</StatLabel>
                    <StatNumber color="white" fontSize="32px" fontWeight="800">Local</StatNumber>
                    <StatHelpText color="rgba(255,255,255,0.7)" fontSize="xs">
                      First discovery
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Box>
            </Stack>
          </Box>

          {/* ── Feature highlights ────────────────────────────────── */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {featureBlocks.map((block) => (
              <Box
                key={block.title}
                bg="white"
                borderRadius="28px"
                p={6}
                border="2px solid #E5E7EB"
                boxShadow="0 4px 12px rgba(26,26,46,0.08)"
                _hover={{ borderColor: "#0F7173", boxShadow: "0 8px 24px rgba(15,113,115,0.12)", transform: "translateY(-4px)" }}
                transition="all 0.3s"
              >
                <Text fontSize="32px" mb={3}>{block.icon}</Text>
                <Text fontWeight="800" fontSize="xl" mb={2} color="#1A1A2E">
                  {block.title}
                </Text>
                <Text color="#6B6B7A" lineHeight="1.6">{block.body}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* ── Discovery section ─────────────────────────────────── */}
          <VStack align="stretch" spacing={6}>
            <SectionHeading
              eyebrow="Discovery Engine"
              title="Neighborhood-first search"
              description="A stronger, more competitive discovery experience with location-aware filters, urgency cues, and quick seller contact."
            />

            {/* Search bar */}
            <Box
              bg="white"
              borderRadius="30px"
              p={{ base: 5, md: 6 }}
              border="2px solid #E5E7EB"
              boxShadow="0 4px 12px rgba(26,26,46,0.08)"
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {/* Text search with icon */}
                <InputGroup h="56px">
                  <InputLeftElement h="56px" pointerEvents="none">
                    <SearchIcon color="#0F7173" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search tomatoes, tailoring, speaker…"
                    borderRadius="full"
                    h="56px"
                    pl="44px"
                    border="2px solid #1A1A2E"
                    _focus={{ borderColor: "#0F7173", borderWidth: "2px" }}
                    fontWeight="500"
                  />
                </InputGroup>

                {/* Category select — live from API */}
                {categoriesLoading ? (
                  <Skeleton h="56px" borderRadius="full" />
                ) : (
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    borderRadius="full"
                    h="56px"
                    border="2px solid #1A1A2E"
                    _focus={{ borderColor: "#0F7173", borderWidth: "2px" }}
                    isDisabled={categoriesError}
                    placeholder={categoriesError ? "Categories unavailable" : undefined}
                    fontWeight="500"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.label}
                        {cat.listingCount > 0 ? ` (${cat.listingCount})` : ""}
                      </option>
                    ))}
                  </Select>
                )}

                {/* Search button */}
                <Button
                  onClick={handleSearch}
                  leftIcon={<SearchIcon />}
                  borderRadius="full"
                  h="56px"
                  bg="#0F7173"
                  color="white"
                  _hover={{ bg: "#0D5A5C", transform: "translateY(-2px)" }}
                  isLoading={listingsLoading}
                  loadingText="Searching…"
                  fontWeight="700"
                  transition="all 0.2s"
                >
                  Search nearby
                </Button>
              </SimpleGrid>
            </Box>

            {/* Listings grid + sidebar */}
            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
              <GridItem>
                <VStack align="stretch" spacing={5}>
                  {/* Error state */}
                  {listingsError && (
                    <Alert status="error" borderRadius="28px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
                      <AlertIcon color="#DC2626" />
                      <AlertDescription color="#991B1B">{listingsError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Loading skeletons */}
                  {listingsLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} h="220px" borderRadius="28px" />
                    ))}

                  {/* Empty state */}
                  {!listingsLoading && !listingsError && items.length === 0 && (
                    <Box
                      bg="white"
                      borderRadius="28px"
                      p={10}
                      textAlign="center"
                      border="2px solid #E5E7EB"
                      boxShadow="0 4px 12px rgba(26,26,46,0.08)"
                    >
                      <Text fontSize="xl" fontWeight="800" mb={2} color="#1A1A2E">
                        No listings found
                      </Text>
                      <Text color="#6B6B7A">
                        Try a different search term or select another category.
                      </Text>
                    </Box>
                  )}

                  {/* Results */}
                  {!listingsLoading &&
                    items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="stretch" spacing={6}>
                  <AiConcierge location={{ latitude: parseFloat(location.lat), longitude: parseFloat(location.lng) }} locationReady={!location.isDefault} />

                  {/* Featured today sidebar */}
                  <Box
                    bg="white"
                    borderRadius="28px"
                    p={6}
                    border="2px solid #E5E7EB"
                    boxShadow="0 4px 12px rgba(26,26,46,0.08)"
                  >
                    <Text fontSize="lg" fontWeight="800" mb={4} color="#1A1A2E">
                      ⭐ Featured today
                    </Text>
                    {featured.length === 0 ? (
                      <Text color="#6B6B7A" fontSize="sm">
                        No featured listings right now.
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={4}>
                        {featured.slice(0, 3).map((item) => (
                          <Box key={item.id} bg="#F3F4F6" borderRadius="22px" p={4} border="1px solid #E5E7EB" _hover={{ borderColor: "#0F7173" }} transition="all 0.2s">
                            <HStack justify="space-between" align="start" mb={2}>
                              <Text fontWeight="700" color="#1A1A2E">{item.title}</Text>
                              {item.merchant.verified && <Icon as={HiCheckCircle} boxSize={4} color="#0F7173" />}
                            </HStack>
                            <Text fontSize="sm" color="#6B6B7A">
                              {item.merchant.neighborhood} • {item.priceRwf.toLocaleString()} RWF
                            </Text>
                            <Badge
                              mt={2}
                              bg="#0F7173"
                              color="white"
                              borderRadius="full"
                              fontSize="xs"
                              px={2}
                              fontWeight="600"
                            >
                              {item.categoryLabel}
                            </Badge>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>

          {/* ── Innovation layer ──────────────────────────────────── */}
          <Box
            bg="white"
            borderRadius="34px"
            p={{ base: 6, md: 8 }}
            border="2px solid #E5E7EB"
            boxShadow="0 4px 12px rgba(26,26,46,0.08)"
          >
            <SectionHeading
              eyebrow="Innovation Layer"
              title="What makes Ndangira more professional and competitive"
              description="These are the product moves that turn a simple listings app into a stronger hyperlocal platform."
            />
            <SimpleGrid mt={8} columns={{ base: 1, md: 2, xl: 4 }} spacing={5}>
              {[
                { icon: "🤖", text: "AI concierge for natural-language shopping and nearby alternatives." },
                { icon: "🕐", text: "Freshness notes and stock urgency to reduce wasted city trips." },
                { icon: "💬", text: "Direct WhatsApp conversion path for Kigali's real selling behavior." },
                { icon: "✓", text: "Neighborhood trust signals that reward reliable local merchants." }
              ].map((point) => (
                <Box key={point.text} bg="#F3F4F6" borderRadius="24px" p={5} border="1px solid #E5E7EB" _hover={{ borderColor: "#0F7173", boxShadow: "0 4px 12px rgba(15,113,115,0.1)" }} transition="all 0.2s">
                  <Text fontSize="24px" mb={2}>{point.icon}</Text>
                  <Text fontWeight="700" color="#1A1A2E" lineHeight="1.6">{point.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
}
