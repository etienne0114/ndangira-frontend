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
  VStack
} from "@chakra-ui/react";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { ListingCard } from "../components/ListingCard";
import { AiConcierge } from "../components/AiConcierge";
import { fetchCategories, fetchListings } from "../lib/api";
import type { Category, Listing } from "../types";

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

export function HomePage() {
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

  // Reload listings whenever submitted query or category changes
  useEffect(() => {
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

  const featured = useMemo(() => items.filter((item) => item.isFeatured), [items]);

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
                    variant="outline"
                    size="lg"
                    borderRadius="full"
                    borderColor="whiteAlpha.500"
                    color="white"
                    _hover={{ bg: "whiteAlpha.100" }}
                    as={RouterLink}
                    to="/register"
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
                    <StatLabel color="whiteAlpha.700">Search lift</StatLabel>
                    <StatNumber>3x</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      "Near me" intent is growing and Ndangira is built directly for it.
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Buyer confidence</StatLabel>
                    <StatNumber>Live</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      Freshness notes and seller signals reduce wasted trips.
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Business impact</StatLabel>
                    <StatNumber>Local-first</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      Small businesses get discovered by people already nearby.
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
              description="A stronger, more competitive discovery experience with location-aware filters, urgency cues, and quick seller contact."
            />

            {/* Search bar */}
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
