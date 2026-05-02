import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  useToast
} from "@chakra-ui/react";
import { ArrowForwardIcon, RepeatIcon } from "@chakra-ui/icons";
import { SectionHeading } from "./components/SectionHeading";
import { ListingCard } from "./components/ListingCard";
import { AiConcierge } from "./components/AiConcierge";
import {
  createMerchantListing,
  fetchListings,
  fetchMerchantDashboard,
  loginMerchant,
  registerMerchant,
  updateMerchantLocation
} from "./lib/api";
import type { Listing, ListingCategory, Merchant, MerchantDashboardResponse, UserLocation } from "./types";

const categories: Array<{ label: string; value: ListingCategory | "" }> = [
  { label: "All categories", value: "" },
  { label: "Groceries", value: "GROCERIES" },
  { label: "Supermarket", value: "SUPERMARKET" },
  { label: "Pharmacy", value: "PHARMACY" },
  { label: "Restaurants", value: "RESTAURANTS" },
  { label: "Housing", value: "HOUSING" },
  { label: "Home", value: "HOME" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Health", value: "HEALTH" },
  { label: "Services", value: "SERVICES" },
  { label: "Fashion", value: "FASHION" }
];

const quickNeeds = [
  { label: "Pharmacy near me", category: "PHARMACY", query: "pain relief" },
  { label: "Supermarket basket", category: "SUPERMARKET", query: "basket" },
  { label: "House to rent", category: "HOUSING", query: "apartment" },
  { label: "Fresh groceries", category: "GROCERIES", query: "fresh" }
] as const;

const defaultCoordinates = { latitude: -1.9441, longitude: 30.0619 };

const emptyRegisterForm = {
  businessName: "",
  ownerName: "",
  email: "",
  password: "",
  phone: "",
  whatsapp: "",
  businessType: "PHARMACY" as ListingCategory,
  neighborhood: "",
  district: "",
  addressLine: "",
  description: "",
  serviceRadiusKm: "5"
};

const emptyListingForm = {
  title: "",
  description: "",
  category: "PHARMACY" as ListingCategory,
  priceRwf: "",
  unitLabel: "",
  inventoryStatus: "IN_STOCK",
  freshnessNote: "",
  tags: "",
  isFeatured: false
};

function App() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ListingCategory | "">("");
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

  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [listingForm, setListingForm] = useState(emptyListingForm);
  const [merchantToken, setMerchantToken] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [dashboard, setDashboard] = useState<MerchantDashboardResponse | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [postingListing, setPostingListing] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationReady(false);
      setLocationLabel("Browser location is unavailable. Using Kigali center.");
      setLocation(defaultCoordinates);
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
        setLocation(defaultCoordinates);
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

  async function loadDashboard(token: string) {
    setMerchantLoading(true);
    try {
      const result = await fetchMerchantDashboard(token);
      setDashboard(result);
      setMerchant(result.merchant);
      setRegisterForm((current) => ({
        ...current,
        businessName: result.merchant.businessName,
        ownerName: result.merchant.ownerName,
        email: result.merchant.email,
        phone: result.merchant.phone,
        whatsapp: result.merchant.whatsapp || "",
        businessType: result.merchant.businessType,
        neighborhood: result.merchant.neighborhood,
        district: result.merchant.district,
        addressLine: result.merchant.addressLine || "",
        description: result.merchant.description || "",
        serviceRadiusKm: String(result.merchant.serviceRadiusKm)
      }));
    } catch (error) {
      setMerchantToken(null);
      setMerchant(null);
      setDashboard(null);
      localStorage.removeItem("ndangiraMerchantToken");
      toast({
        title: "Merchant session expired",
        description: error instanceof Error ? error.message : "Please sign in again.",
        status: "warning"
      });
    } finally {
      setMerchantLoading(false);
    }
  }

  useEffect(() => {
    requestLocation();
    const savedToken = window.localStorage.getItem("ndangiraMerchantToken");
    if (savedToken) {
      setMerchantToken(savedToken);
      void loadDashboard(savedToken);
    }
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

  async function handleRegister() {
    const activeLocation = location ?? defaultCoordinates;
    setMerchantLoading(true);
    try {
      const result = await registerMerchant({
        ...registerForm,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        serviceRadiusKm: Number(registerForm.serviceRadiusKm)
      });
      setMerchantToken(result.token);
      localStorage.setItem("ndangiraMerchantToken", result.token);
      setMerchant(result.merchant);
      toast({
        title: "Business account created",
        description: "Your merchant profile is ready for live nearby selling.",
        status: "success"
      });
      await loadDashboard(result.token);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        status: "error"
      });
    } finally {
      setMerchantLoading(false);
    }
  }

  async function handleLogin() {
    setMerchantLoading(true);
    try {
      const result = await loginMerchant(loginForm);
      setMerchantToken(result.token);
      localStorage.setItem("ndangiraMerchantToken", result.token);
      setMerchant(result.merchant);
      toast({
        title: "Welcome back",
        description: "Your business dashboard is ready.",
        status: "success"
      });
      await loadDashboard(result.token);
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Check your credentials.",
        status: "error"
      });
    } finally {
      setMerchantLoading(false);
    }
  }

  async function handleUpdateBusinessLocation() {
    if (!merchantToken || !location) {
      return;
    }

    setUpdatingLocation(true);
    try {
      const result = await updateMerchantLocation(merchantToken, {
        latitude: location.latitude,
        longitude: location.longitude,
        neighborhood: registerForm.neighborhood,
        district: registerForm.district,
        addressLine: registerForm.addressLine,
        serviceRadiusKm: Number(registerForm.serviceRadiusKm)
      });
      setMerchant(result.merchant);
      toast({
        title: "Business location updated",
        description: "Your nearby shoppers will now see the latest storefront position.",
        status: "success"
      });
      await loadDashboard(merchantToken);
    } catch (error) {
      toast({
        title: "Location update failed",
        description: error instanceof Error ? error.message : "Try again.",
        status: "error"
      });
    } finally {
      setUpdatingLocation(false);
    }
  }

  async function handleCreateListing() {
    if (!merchantToken) {
      return;
    }

    setPostingListing(true);
    try {
      await createMerchantListing(merchantToken, {
        title: listingForm.title,
        description: listingForm.description,
        category: listingForm.category,
        priceRwf: Number(listingForm.priceRwf),
        unitLabel: listingForm.unitLabel,
        inventoryStatus: listingForm.inventoryStatus,
        freshnessNote: listingForm.freshnessNote,
        tags: listingForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isFeatured: listingForm.isFeatured
      });
      setListingForm(emptyListingForm);
      toast({
        title: "Listing published",
        description: "Your nearby product is now available in shopper discovery.",
        status: "success"
      });
      await loadDashboard(merchantToken);
    } catch (error) {
      toast({
        title: "Listing creation failed",
        description: error instanceof Error ? error.message : "Please review the form.",
        status: "error"
      });
    } finally {
      setPostingListing(false);
    }
  }

  function handleQuickNeed(need: typeof quickNeeds[number]) {
    setCategory(need.category);
    setQuery(need.query);
  }

  function logoutMerchant() {
    setMerchantToken(null);
    setMerchant(null);
    setDashboard(null);
    localStorage.removeItem("ndangiraMerchantToken");
  }

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
                  Live commerce for Kigali neighborhoods
                </Badge>
                <Text fontSize={{ base: "4xl", md: "6xl" }} lineHeight="0.95" fontWeight="800">
                  Search nearby products instantly. Sell from where your business is right now.
                </Text>
                <Text color="whiteAlpha.900" maxW="2xl" fontSize={{ base: "md", md: "lg" }}>
                  Ndangira combines automatic shopper location, business-side live storefront coordinates, and AI-guided
                  recommendations for pharmacy, supermarket, housing, and everyday needs.
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
                  <Button rightIcon={<ArrowForwardIcon />} size="lg" bg="white" color="ink.900" borderRadius="full">
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
                    Refresh my location
                  </Button>
                </HStack>
              </VStack>

              <Box flex="1" bg="whiteAlpha.100" backdropFilter="blur(12px)" borderRadius="28px" p={{ base: 5, md: 7 }}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Nearest now</StatLabel>
                    <StatNumber>{nearestListing?.distanceKm?.toFixed(1) ?? "0.0"} km</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      {nearestListing ? `${nearestListing.title} in ${nearestListing.merchant.neighborhood}` : "Waiting for nearby results"}
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Business mode</StatLabel>
                    <StatNumber>{merchant ? "Active" : "Ready"}</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      {merchant ? `${merchant.businessName} can post live listings.` : "Create an account to start selling nearby."}
                    </StatHelpText>
                  </Stat>
                  <Stat bg="whiteAlpha.100" borderRadius="24px" p={4}>
                    <StatLabel color="whiteAlpha.700">Nearby results</StatLabel>
                    <StatNumber>{items.length}</StatNumber>
                    <StatHelpText color="whiteAlpha.700">
                      Filtered by what the shopper wants right now.
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Box>
            </Stack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            {quickNeeds.map((need) => (
              <Button
                key={need.label}
                onClick={() => handleQuickNeed(need)}
                bg="white"
                borderRadius="24px"
                h="84px"
                boxShadow="0 16px 40px rgba(23, 23, 23, 0.06)"
                border="1px solid rgba(23, 23, 23, 0.06)"
                _hover={{ transform: "translateY(-2px)", bg: "sand.100" }}
              >
                {need.label}
              </Button>
            ))}
          </SimpleGrid>

          <Tabs variant="unstyled" colorScheme="orange">
            <TabList bg="white" p={2} borderRadius="24px" border="1px solid rgba(23,23,23,0.06)">
              <Tab _selected={{ bg: "brand.500", color: "white" }} borderRadius="18px" fontWeight="700">
                Shopper discovery
              </Tab>
              <Tab _selected={{ bg: "brand.500", color: "white" }} borderRadius="18px" fontWeight="700">
                Business workspace
              </Tab>
            </TabList>

            <TabPanels px={0}>
              <TabPanel px={0} pt={8}>
                <VStack align="stretch" spacing={6}>
                  <SectionHeading
                    eyebrow="Discovery Engine"
                    title="Track products around the shopper automatically"
                    description="Nearby pharmacy, supermarket, housing, and service listings update from the user’s location and rank by what matters most."
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
                  <Box bg="white" borderRadius="30px" p={{ base: 5, md: 6 }} border="1px solid rgba(23,23,23,0.06)">
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={4}>
                      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pharmacy, apartment, tomatoes..." borderRadius="full" h="56px" />
                      <Select value={category} onChange={(event) => setCategory(event.target.value as ListingCategory | "")} borderRadius="full" h="56px">
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
                        <Select value={maxDistanceKm} onChange={(event) => setMaxDistanceKm(event.target.value)} h="56px" borderLeftRadius="0" borderRightRadius="full">
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
                          Prioritize trusted nearby sellers.
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>

                  <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
                    <GridItem>
                      <VStack align="stretch" spacing={5}>
                        {loading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <Box key={index} h="220px" borderRadius="28px" bg="white" border="1px solid rgba(23,23,23,0.06)" />
                          ))
                        ) : items.length > 0 ? (
                          items.map((listing) => <ListingCard key={listing.id} listing={listing} />)
                        ) : (
                          <Box bg="white" borderRadius="28px" p={8} border="1px solid rgba(23,23,23,0.06)">
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
                        <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
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
              </TabPanel>

              <TabPanel px={0} pt={8}>
                <VStack align="stretch" spacing={6}>
                  <SectionHeading
                    eyebrow="Merchant Tools"
                    title="Create a business account and post from your live location"
                    description="Register once, update where your storefront is today, and publish products or services so nearby customers can find you."
                  />

                  <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr" }} gap={8}>
                    <GridItem>
                      <Box bg="white" borderRadius="32px" p={{ base: 6, md: 8 }} border="1px solid rgba(23,23,23,0.06)">
                        {!merchant ? (
                          <VStack align="stretch" spacing={5}>
                            <HStack spacing={3}>
                              <Button
                                variant={authMode === "register" ? "solid" : "outline"}
                                onClick={() => setAuthMode("register")}
                                borderRadius="full"
                                bg={authMode === "register" ? "brand.500" : "transparent"}
                                color={authMode === "register" ? "white" : "ink.900"}
                              >
                                Register business
                              </Button>
                              <Button
                                variant={authMode === "login" ? "solid" : "outline"}
                                onClick={() => setAuthMode("login")}
                                borderRadius="full"
                                bg={authMode === "login" ? "brand.500" : "transparent"}
                                color={authMode === "login" ? "white" : "ink.900"}
                              >
                                Sign in
                              </Button>
                            </HStack>

                            {authMode === "register" ? (
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl>
                                  <FormLabel>Business name</FormLabel>
                                  <Input value={registerForm.businessName} onChange={(event) => setRegisterForm((current) => ({ ...current, businessName: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Owner name</FormLabel>
                                  <Input value={registerForm.ownerName} onChange={(event) => setRegisterForm((current) => ({ ...current, ownerName: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Email</FormLabel>
                                  <Input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Password</FormLabel>
                                  <Input type="password" value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Phone</FormLabel>
                                  <Input value={registerForm.phone} onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>WhatsApp</FormLabel>
                                  <Input value={registerForm.whatsapp} onChange={(event) => setRegisterForm((current) => ({ ...current, whatsapp: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Business type</FormLabel>
                                  <Select value={registerForm.businessType} onChange={(event) => setRegisterForm((current) => ({ ...current, businessType: event.target.value as ListingCategory }))}>
                                    {categories.filter((item) => item.value).map((option) => (
                                      <option key={option.value} value={option.value!}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </Select>
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Service radius</FormLabel>
                                  <Select value={registerForm.serviceRadiusKm} onChange={(event) => setRegisterForm((current) => ({ ...current, serviceRadiusKm: event.target.value }))}>
                                    <option value="3">3 km</option>
                                    <option value="5">5 km</option>
                                    <option value="10">10 km</option>
                                    <option value="15">15 km</option>
                                  </Select>
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Neighborhood</FormLabel>
                                  <Input value={registerForm.neighborhood} onChange={(event) => setRegisterForm((current) => ({ ...current, neighborhood: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>District</FormLabel>
                                  <Input value={registerForm.district} onChange={(event) => setRegisterForm((current) => ({ ...current, district: event.target.value }))} />
                                </FormControl>
                                <FormControl gridColumn={{ md: "1 / span 2" }}>
                                  <FormLabel>Address line</FormLabel>
                                  <Input value={registerForm.addressLine} onChange={(event) => setRegisterForm((current) => ({ ...current, addressLine: event.target.value }))} />
                                </FormControl>
                                <FormControl gridColumn={{ md: "1 / span 2" }}>
                                  <FormLabel>Business description</FormLabel>
                                  <Textarea value={registerForm.description} onChange={(event) => setRegisterForm((current) => ({ ...current, description: event.target.value }))} />
                                </FormControl>
                              </SimpleGrid>
                            ) : (
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl>
                                  <FormLabel>Email</FormLabel>
                                  <Input type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Password</FormLabel>
                                  <Input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} />
                                </FormControl>
                              </SimpleGrid>
                            )}

                            <Button
                              onClick={authMode === "register" ? handleRegister : handleLogin}
                              isLoading={merchantLoading}
                              bg="ink.900"
                              color="white"
                              borderRadius="full"
                              alignSelf="start"
                            >
                              {authMode === "register" ? "Create business account" : "Sign in to dashboard"}
                            </Button>
                          </VStack>
                        ) : (
                          <VStack align="stretch" spacing={6}>
                            <HStack justify="space-between" flexWrap="wrap">
                              <Box>
                                <Text fontSize="2xl" fontWeight="800">
                                  {merchant.businessName}
                                </Text>
                                <Text color="ink.700">
                                  {merchant.businessType.replace(/_/g, " ")} • {merchant.neighborhood}, {merchant.district}
                                </Text>
                              </Box>
                              <Button onClick={logoutMerchant} borderRadius="full" variant="outline">
                                Log out
                              </Button>
                            </HStack>
                            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                              <Stat bg="sand.100" borderRadius="24px" p={4}>
                                <StatLabel>Total listings</StatLabel>
                                <StatNumber>{dashboard?.metrics.totalListings ?? 0}</StatNumber>
                              </Stat>
                              <Stat bg="sand.100" borderRadius="24px" p={4}>
                                <StatLabel>In stock</StatLabel>
                                <StatNumber>{dashboard?.metrics.inStock ?? 0}</StatNumber>
                              </Stat>
                              <Stat bg="sand.100" borderRadius="24px" p={4}>
                                <StatLabel>Low stock</StatLabel>
                                <StatNumber>{dashboard?.metrics.lowStock ?? 0}</StatNumber>
                              </Stat>
                              <Stat bg="sand.100" borderRadius="24px" p={4}>
                                <StatLabel>Featured</StatLabel>
                                <StatNumber>{dashboard?.metrics.featured ?? 0}</StatNumber>
                              </Stat>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel>Neighborhood</FormLabel>
                                <Input value={registerForm.neighborhood} onChange={(event) => setRegisterForm((current) => ({ ...current, neighborhood: event.target.value }))} />
                              </FormControl>
                              <FormControl>
                                <FormLabel>District</FormLabel>
                                <Input value={registerForm.district} onChange={(event) => setRegisterForm((current) => ({ ...current, district: event.target.value }))} />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Address line</FormLabel>
                                <Input value={registerForm.addressLine} onChange={(event) => setRegisterForm((current) => ({ ...current, addressLine: event.target.value }))} />
                              </FormControl>
                              <FormControl>
                                <FormLabel>Service radius</FormLabel>
                                <Select value={registerForm.serviceRadiusKm} onChange={(event) => setRegisterForm((current) => ({ ...current, serviceRadiusKm: event.target.value }))}>
                                  <option value="3">3 km</option>
                                  <option value="5">5 km</option>
                                  <option value="10">10 km</option>
                                  <option value="15">15 km</option>
                                </Select>
                              </FormControl>
                            </SimpleGrid>

                            <Alert status="info" borderRadius="20px">
                              <AlertIcon />
                              <AlertDescription>
                                Use your browser location, then update your business position so nearby shoppers see where you are operating today.
                              </AlertDescription>
                            </Alert>

                            <Button
                              onClick={handleUpdateBusinessLocation}
                              isLoading={updatingLocation}
                              leftIcon={<RepeatIcon />}
                              bg="brand.500"
                              color="white"
                              borderRadius="full"
                              alignSelf="start"
                            >
                              Update live business location
                            </Button>
                          </VStack>
                        )}
                      </Box>
                    </GridItem>

                    <GridItem>
                      <VStack align="stretch" spacing={6}>
                        <Box bg="white" borderRadius="32px" p={{ base: 6, md: 8 }} border="1px solid rgba(23,23,23,0.06)">
                          <Text fontSize="2xl" fontWeight="800" mb={2}>
                            Publish a nearby product
                          </Text>
                          <Text color="ink.700" mb={6}>
                            Ideal for medicine, supermarket bundles, rooms to rent, food, and neighborhood services.
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Product title</FormLabel>
                              <Input value={listingForm.title} onChange={(event) => setListingForm((current) => ({ ...current, title: event.target.value }))} />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Category</FormLabel>
                              <Select value={listingForm.category} onChange={(event) => setListingForm((current) => ({ ...current, category: event.target.value as ListingCategory }))}>
                                {categories.filter((item) => item.value).map((option) => (
                                  <option key={option.value} value={option.value!}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl gridColumn={{ md: "1 / span 2" }}>
                              <FormLabel>Description</FormLabel>
                              <Textarea value={listingForm.description} onChange={(event) => setListingForm((current) => ({ ...current, description: event.target.value }))} />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Price in RWF</FormLabel>
                              <Input type="number" value={listingForm.priceRwf} onChange={(event) => setListingForm((current) => ({ ...current, priceRwf: event.target.value }))} />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Unit label</FormLabel>
                              <Input value={listingForm.unitLabel} onChange={(event) => setListingForm((current) => ({ ...current, unitLabel: event.target.value }))} placeholder="box, basket, month" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Stock status</FormLabel>
                              <Select value={listingForm.inventoryStatus} onChange={(event) => setListingForm((current) => ({ ...current, inventoryStatus: event.target.value }))}>
                                <option value="IN_STOCK">In stock</option>
                                <option value="LOW_STOCK">Low stock</option>
                                <option value="MADE_TO_ORDER">Made to order</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Freshness note</FormLabel>
                              <Input value={listingForm.freshnessNote} onChange={(event) => setListingForm((current) => ({ ...current, freshnessNote: event.target.value }))} placeholder="Ready now, 2 packs left..." />
                            </FormControl>
                            <FormControl gridColumn={{ md: "1 / span 2" }}>
                              <FormLabel>Tags</FormLabel>
                              <Input value={listingForm.tags} onChange={(event) => setListingForm((current) => ({ ...current, tags: event.target.value }))} placeholder="urgent, pharmacy, family" />
                            </FormControl>
                          </SimpleGrid>
                          <Checkbox mt={4} isChecked={listingForm.isFeatured} onChange={(event) => setListingForm((current) => ({ ...current, isFeatured: event.target.checked }))} colorScheme="orange">
                            Feature this listing for extra visibility
                          </Checkbox>
                          <Button
                            mt={6}
                            onClick={handleCreateListing}
                            isLoading={postingListing}
                            isDisabled={!merchantToken}
                            bg="ink.900"
                            color="white"
                            borderRadius="full"
                          >
                            Publish listing
                          </Button>
                        </Box>

                        {dashboard?.listings?.length ? (
                          <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
                            <Text fontSize="lg" fontWeight="800" mb={4}>
                              Your active listings
                            </Text>
                            <VStack align="stretch" spacing={3}>
                              {dashboard.listings.slice(0, 4).map((listing) => (
                                <Box key={listing.id} bg="sand.100" borderRadius="22px" p={4}>
                                  <Text fontWeight="700">{listing.title}</Text>
                                  <Text fontSize="sm" color="ink.700">
                                    {listing.category.replace(/_/g, " ")} • {listing.priceRwf.toLocaleString()} RWF / {listing.unitLabel}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ) : null}
                      </VStack>
                    </GridItem>
                  </Grid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
