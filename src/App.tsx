import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { SectionHeading } from "./components/SectionHeading";
import { ListingCard } from "./components/ListingCard";
import { AiConcierge } from "./components/AiConcierge";
import { fetchListings } from "./lib/api";
import type { Listing } from "./types";

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
  const [query, setQuery] = useState("fresh");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (category) {
      params.set("category", category);
    }
    params.set("lat", "-1.9441");
    params.set("lng", "30.0619");
    params.set("sort", "distance");

    setLoading(true);
    fetchListings(params)
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, [query, category]);

  const featured = useMemo(() => items.filter((item) => item.isFeatured), [items]);

  return (
    <Box minH="100vh" bgGradient="linear(to-b, #f8f3ea 0%, #fffdf9 45%, #f2ebde 100%)">
      <Container maxW="7xl" py={{ base: 6, md: 10 }}>
        <VStack align="stretch" spacing={{ base: 10, md: 16 }}>
          <Box
            borderRadius="36px"
            bg="linear-gradient(135deg, rgba(249,115,22,0.98), rgba(23,23,23,0.92))"
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
                  >
                    Start selling locally
                  </Button>
                </HStack>
              </VStack>

              <Box
                flex="1"
                bg="rgba(255,255,255,0.08)"
                backdropFilter="blur(12px)"
                borderRadius="28px"
                p={{ base: 5, md: 7 }}
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Search lift</StatLabel>
                    <StatNumber>3x</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      “Near me” intent is growing and Ndangira is built directly for it.
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
              description="A stronger, more competitive discovery experience with location-aware filters, urgency cues, and quick seller contact."
            />
            <Box
              bg="white"
              borderRadius="30px"
              p={{ base: 5, md: 6 }}
              border="1px solid rgba(23, 23, 23, 0.06)"
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
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
                <Button borderRadius="full" h="56px" bg="brand.500" color="white" _hover={{ bg: "brand.600" }}>
                  Refresh nearby results
                </Button>
              </SimpleGrid>
            </Box>

            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
              <GridItem>
                <VStack align="stretch" spacing={5}>
                  {loading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <Box
                          key={index}
                          h="220px"
                          borderRadius="28px"
                          bg="white"
                          border="1px solid rgba(23, 23, 23, 0.06)"
                        />
                      ))
                    : items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="stretch" spacing={6}>
                  <AiConcierge />
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
