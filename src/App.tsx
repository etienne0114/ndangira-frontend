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

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    const params = new URLSearchParams();
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
                  Ndangira helps Kigali shoppers discover real nearby products and services, while local businesses
                  turn current location into a live digital storefront.
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

          <VStack align="stretch" spacing={6}>
            <SectionHeading
              eyebrow="Discovery Engine"
              title="Neighborhood-first search"
              description="Search starts from the shopper’s current position automatically, then ranks the closest relevant results first."
            />
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
                >
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

            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
              <GridItem>
                <VStack align="stretch" spacing={5}>
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
                  <AiConcierge location={location} locationReady={locationReady} />
                  <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23, 23, 23, 0.06)">
                    <Text fontSize="lg" fontWeight="800" mb={4}>
                      Featured today
                    </Text>
                    <VStack align="stretch" spacing={4}>
                      {featured.slice(0, 3).map((item) => (
                        <Box key={item.id} bg="sand.100" borderRadius="22px" p={4}>
                          <Text fontWeight="700">{item.title}</Text>
                          <Text fontSize="sm" color="ink.700">
                            {item.merchant.neighborhood} • {item.priceRwf.toLocaleString()} RWF
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>

          <Box bg="white" borderRadius="34px" p={{ base: 6, md: 8 }} border="1px solid rgba(23, 23, 23, 0.06)">
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
