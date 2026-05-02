import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Checkbox,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputLeftAddon,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from "@chakra-ui/react";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { SectionHeading } from "./components/SectionHeading";
import { ListingCard } from "./components/ListingCard";
import { AiConcierge } from "./components/AiConcierge";
import { fetchCategories, fetchListings } from "./lib/api";
import type { Category, Listing } from "./types";
import { ArrowForwardIcon, RepeatIcon } from "@chakra-ui/icons";
import { SectionHeading } from "./components/SectionHeading";
import { ListingCard } from "./components/ListingCard";
import { AiConcierge } from "./components/AiConcierge";
import { fetchListings } from "./lib/api";
import type { Listing, UserLocation } from "./types";

const categories = [
  { label: "All categories", value: "" },
  { label: "Groceries", value: "GROCERIES" },
  { label: "Restaurants", value: "RESTAURANTS" },
  { label: "Fashion", value: "FASHION" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Home", value: "HOME" },
  { label: "Health", value: "HEALTH" },
  { label: "Services", value: "SERVICES" }
];

const featureBlocks = [
  {
    title: "Hyperlocal speed",
    body: "Rank by proximity first so shoppers stop crossing the city for simple needs."
  },
  {
    title: "Seller trust signals",
    body: "Show verified businesses, freshness updates, and low-stock urgency to improve decisions."
  },
  {
    title: "AI shopping concierge",
    body: "Use DeepSeek through OpenRouter to turn natural language into practical buying suggestions."
  }
];

function App() {
  // Search bar controlled value (not yet submitted)
  const [inputValue, setInputValue] = useState("fresh");
  // What was last submitted to the API
  const [submittedQuery, setSubmittedQuery] = useState("fresh");

  const [category, setCategory] = useState("");

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Listings from API
  const [items, setItems] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.items))
      .catch(() => setCategoriesError(true))
      .finally(() => setCategoriesLoading(false));
  }, []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [maxDistanceKm, setMaxDistanceKm] = useState("5");
  const [sort, setSort] = useState("distance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState("Requesting your location...");
  const [locationReady, setLocationReady] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationReady(false);
      setLocationLabel("Browser location is unavailable. Using Kigali center.");
      setLocation({ latitude: -1.9441, longitude: 30.0619 });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationReady(true);
        setLocationLoading(false);
        setLocationLabel(`Live location enabled (${Math.round(position.coords.accuracy)}m accuracy).`);
      },
      () => {
        setLocation({ latitude: -1.9441, longitude: 30.0619 });
        setLocationReady(false);
        setLocationLoading(false);
        setLocationLabel("Location permission was not granted. Showing Kigali-center results instead.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Reload listings whenever submitted query or category changes
  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    const params = new URLSearchParams();
    if (submittedQuery) params.set("q", submittedQuery);
    if (category) params.set("category", category);
    params.set("lat", "-1.9441");
    params.set("lng", "30.0619");
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
  }, [submittedQuery, category]);

  function handleSearch() {
    setSubmittedQuery(inputValue.trim());
  }
    if (query) {
      params.set("q", query);
    }
    if (category) {
      params.set("category", category);
    }
    params.set("lat", String(location.latitude));
    params.set("lng", String(location.longitude));
    params.set("sort", sort);
    params.set("limit", "20");
    params.set("maxDistanceKm", maxDistanceKm);
    if (verifiedOnly) {
      params.set("verifiedOnly", "true");
    }

    setLoading(true);
    setErrorMessage(undefined);
    fetchListings(params)
      .then((data) => {
        setItems(data.items);
        setLiveData(data.source === "live");
        setErrorMessage(data.errorMessage);
      })
      .finally(() => setLoading(false));
  }, [query, category, maxDistanceKm, sort, verifiedOnly, location]);

  const featured = useMemo(() => items.filter((item) => item.isFeatured), [items]);
  const nearestListing = items[0];

  return (
    <Box minH="100vh" bgGradient="linear(to-b, #f8f3ea 0%, #fffdf9 45%, #f2ebde 100%)">
      <Container maxW="7xl" py={{ base: 6, md: 10 }}>
        <VStack align="stretch" spacing={{ base: 10, md: 16 }}>

          {/* ── Hero ──────────────────────────────────────────────── */}
          <Box
            borderRadius="36px"
            bgGradient="linear(to-br, brand.500, ink.900)"
            color="white"
            overflow="hidden"
            position="relative"
            p={{ base: 7, md: 12 }}
          >
            <Stack spacing={10} direction={{ base: "column", lg: "row" }} align="stretch">
              <VStack align="start" spacing={6} flex="1">
                <Badge bg="whiteAlpha.200" color="white" px={4} py={2} borderRadius="full">
                  Kigali neighborhood commerce, redesigned
                </Badge>
                <Text fontSize={{ base: "4xl", md: "6xl" }} lineHeight="0.95" fontWeight="800">
                  Find what you need near you, not across the city.
                </Text>
                <Text color="whiteAlpha.900" maxW="2xl" fontSize={{ base: "md", md: "lg" }}>
                  Ndangira helps Kigali shoppers discover real nearby products and services, while
                  local businesses turn current location into a live digital storefront.
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Badge bg={locationReady ? "green.500" : "orange.500"} color="white" px={4} py={2} borderRadius="full">
                    {locationLoading ? "Detecting your location..." : locationLabel}
                  </Badge>
                  <Badge bg={liveData ? "whiteAlpha.200" : "red.500"} color="white" px={4} py={2} borderRadius="full">
                    {liveData ? "Live marketplace feed" : "Fallback demo data"}
                  </Badge>
                </HStack>
                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    size="lg"
                    bg="white"
                    color="ink.900"
                    borderRadius="full"
                    _hover={{ bg: "orange.50" }}
                  >
                    Explore nearby listings
                  </Button>
                  <Button
                    leftIcon={<RepeatIcon />}
                    onClick={requestLocation}
                    isLoading={locationLoading}
                    variant="outline"
                    size="lg"
                    borderRadius="full"
                    borderColor="whiteAlpha.500"
                    color="white"
                    _hover={{ bg: "whiteAlpha.100" }}
                  >
                    Start selling locally
                  </Button>
                </HStack>
              </VStack>

              <Box
                flex="1"
                bg="whiteAlpha.100"
                backdropFilter="blur(12px)"
                borderRadius="28px"
                p={{ base: 5, md: 7 }}
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Nearest now</StatLabel>
                    <StatNumber>{nearestListing?.distanceKm?.toFixed(1) ?? "0.0"} km</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      "Near me" intent is growing and Ndangira is built directly for it.
                      {nearestListing
                        ? `${nearestListing.title} in ${nearestListing.merchant.neighborhood}`
                        : "Waiting for nearby results"}
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Location mode</StatLabel>
                    <StatNumber>{locationReady ? "Auto" : "Fallback"}</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      Search follows the user’s position when permission is granted.
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Listings nearby</StatLabel>
                    <StatNumber>{items.length}</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      Filtered by what the shopper wants right now.
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
                border="1px solid rgba(23, 23, 23, 0.06)"
                boxShadow="0 16px 50px rgba(23, 23, 23, 0.06)"
              >
                <Text fontWeight="800" fontSize="xl" mb={2}>
                  {block.title}
                </Text>
                <Text color="ink.700">{block.body}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* ── Discovery section ─────────────────────────────────── */}
          <VStack align="stretch" spacing={6}>
            <SectionHeading
              eyebrow="Discovery Engine"
              title="Neighborhood-first search"
              description="Search starts from the shopper’s current position automatically, then ranks the closest relevant results first."
            />

            {/* Search bar */}
            {errorMessage ? (
              <Alert status={liveData ? "info" : "warning"} borderRadius="24px" bg={liveData ? "blue.50" : "orange.50"}>
                <AlertIcon />
                <Box>
                  <AlertTitle>{liveData ? "Marketplace update" : "Live data unavailable"}</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Box>
              </Alert>
            ) : null}
            <Box
              bg="white"
              borderRadius="30px"
              p={{ base: 5, md: 6 }}
              border="1px solid rgba(23, 23, 23, 0.06)"
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {/* Text search with icon */}
                <InputGroup h="56px">
                  <InputLeftElement h="56px" pointerEvents="none">
                    <SearchIcon color="ink.700" />
                  </InputLeftElement>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search tomatoes, tailoring, speaker…"
                    borderRadius="full"
                    h="56px"
                    pl="44px"
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
                    isDisabled={categoriesError}
                    placeholder={categoriesError ? "Categories unavailable" : undefined}
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
              <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={4}>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tomatoes, tailoring, speaker, salon..."
                  borderRadius="full"
                  h="56px"
                />
                <Select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  borderRadius="full"
                  h="56px"
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: "brand.600" }}
                  isLoading={listingsLoading}
                  loadingText="Searching…"
                >
                  Search nearby
                </Button>
                  {categories.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <InputGroup h="56px">
                  <InputLeftAddon h="56px" borderRadius="full" borderRight="0">
                    Radius
                  </InputLeftAddon>
                  <Select
                    value={maxDistanceKm}
                    onChange={(event) => setMaxDistanceKm(event.target.value)}
                    h="56px"
                    borderLeftRadius="0"
                    borderRightRadius="full"
                  >
                    <option value="1">1 km</option>
                    <option value="3">3 km</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                  </Select>
                </InputGroup>
                <Select value={sort} onChange={(event) => setSort(event.target.value)} borderRadius="full" h="56px">
                  <option value="distance">Closest first</option>
                  <option value="price-asc">Lowest price</option>
                  <option value="price-desc">Highest price</option>
                  <option value="fresh">Freshest</option>
                  <option value="newest">Newest</option>
                </Select>
                <VStack align="start" justify="center" bg="sand.100" borderRadius="24px" px={5} py={3}>
                  <Checkbox isChecked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} colorScheme="orange">
                    Verified merchants only
                  </Checkbox>
                  <Text fontSize="sm" color="ink.700">
                    Focus on trusted sellers near the shopper.
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Listings grid + sidebar */}
            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
              <GridItem>
                <VStack align="stretch" spacing={5}>
                  {/* Error state */}
                  {listingsError && (
                    <Alert status="error" borderRadius="28px" border="1px solid" borderColor="red.200">
                      <AlertIcon />
                      <AlertDescription>{listingsError}</AlertDescription>
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
                      border="1px solid rgba(23, 23, 23, 0.06)"
                    >
                      <Text fontSize="xl" fontWeight="800" mb={2}>
                        No listings found
                      </Text>
                      <Text color="ink.700">
                        Try a different search term or select another category.
                      </Text>
                    </Box>
                  )}

                  {/* Results */}
                  {!listingsLoading &&
                    items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                  {loading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} h="220px" borderRadius="28px" />
                      ))
                    : items.length > 0
                      ? items.map((listing) => <ListingCard key={listing.id} listing={listing} />)
                      : (
                        <Box bg="white" borderRadius="28px" p={8} border="1px solid rgba(23, 23, 23, 0.06)">
                          <Text fontSize="xl" fontWeight="800" mb={2}>
                            No nearby matches yet
                          </Text>
                          <Text color="ink.700">
                            Try a broader search, a larger radius, or switch off the verified-only filter.
                          </Text>
                        </Box>
                      )}
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="stretch" spacing={6}>
                  <AiConcierge />

                  {/* Featured today sidebar */}
                  <Box
                    bg="white"
                    borderRadius="28px"
                    p={6}
                    border="1px solid rgba(23, 23, 23, 0.06)"
                  >
                  <AiConcierge location={location} locationReady={locationReady} />
                  <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23, 23, 23, 0.06)">
                    <Text fontSize="lg" fontWeight="800" mb={4}>
                      Featured today
                    </Text>
                    {featured.length === 0 ? (
                      <Text color="ink.700" fontSize="sm">
                        No featured listings right now.
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={4}>
                        {featured.slice(0, 3).map((item) => (
                          <Box key={item.id} bg="sand.100" borderRadius="22px" p={4}>
                            <Text fontWeight="700">{item.title}</Text>
                            <Text fontSize="sm" color="ink.700">
                              {item.merchant.neighborhood} • {item.priceRwf.toLocaleString()} RWF
                            </Text>
                            <Badge
                              mt={1}
                              colorScheme="orange"
                              borderRadius="full"
                              fontSize="xs"
                              px={2}
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
            border="1px solid rgba(23, 23, 23, 0.06)"
          >
            <SectionHeading
              eyebrow="Innovation Layer"
              title="What makes Ndangira more professional and competitive"
              description="These are the product moves that turn a simple listings app into a stronger hyperlocal platform."
            />
            <SimpleGrid mt={8} columns={{ base: 1, md: 2, xl: 4 }} spacing={5}>
              {[
                "AI concierge for natural-language shopping and nearby alternatives.",
                "Freshness notes and stock urgency to reduce wasted city trips.",
                "Direct WhatsApp conversion path for Kigali's real selling behavior.",
                "Neighborhood trust signals that reward reliable local merchants."
              ].map((point) => (
                <Box key={point} bg="sand.100" borderRadius="24px" p={5}>
                  <Text fontWeight="700">{point}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
}

export default App;
