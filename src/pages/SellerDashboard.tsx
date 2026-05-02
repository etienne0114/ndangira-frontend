import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Skeleton,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Category, InventoryStatus } from "../types";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface SellerListing {
  id: string;
  title: string;
  description: string;
  priceRwf: number;
  unitLabel: string;
  inventoryStatus: InventoryStatus;
  freshnessNote?: string | null;
  category: { id: string; name: string; label: string };
}

interface MerchantProfile {
  id: string;
  businessName: string;
  phone: string;
  whatsapp?: string | null;
  neighborhood: string;
  district: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

const statusColor: Record<InventoryStatus, string> = {
  IN_STOCK: "green",
  LOW_STOCK: "yellow",
  MADE_TO_ORDER: "blue"
};

const emptyMerchantForm = {
  businessName: "",
  phone: "",
  whatsapp: "",
  neighborhood: "",
  district: "",
  latitude: "-1.9441",
  longitude: "30.0619"
};

export function SellerDashboard() {
  const { token, user } = useAuth();
  const listingModal = useDisclosure();

  const [listings, setListings] = useState<SellerListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [merchantForm, setMerchantForm] = useState(emptyMerchantForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryLabel, setCategoryLabel] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priceRwf: "",
    unitLabel: "",
    inventoryStatus: "IN_STOCK" as InventoryStatus,
    freshnessNote: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantError, setMerchantError] = useState<string | null>(null);

  const isApproved = user?.sellerStatus === "APPROVED";
  const isPending = user?.sellerStatus === "PENDING";
  const isRejected = user?.sellerStatus === "REJECTED";

  async function fetchListings() {
    const res = await fetch(`${API_URL}/api/seller/listings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load listings");
    const data = (await res.json()) as { items: SellerListing[] };
    setListings(data.items);
  }

  async function fetchCategories() {
    const res = await fetch(`${API_URL}/api/categories`);
    if (!res.ok) throw new Error("Failed to load categories");
    const data = (await res.json()) as { items: Category[] };
    setCategories(data.items);
  }

  async function fetchMerchant() {
    const res = await fetch(`${API_URL}/api/seller/merchant`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 404) {
      setMerchant(null);
      setMerchantForm(emptyMerchantForm);
      return;
    }
    if (!res.ok) throw new Error("Failed to load merchant profile");
    const data = (await res.json()) as MerchantProfile;
    setMerchant(data);
    setMerchantForm({
      businessName: data.businessName,
      phone: data.phone,
      whatsapp: data.whatsapp ?? "",
      neighborhood: data.neighborhood,
      district: data.district,
      latitude: String(data.latitude),
      longitude: String(data.longitude)
    });
  }

  async function refreshDashboard() {
    setLoading(true);
    setError(null);
    try {
      const tasks: Promise<void>[] = [fetchListings(), fetchCategories()];
      if (isApproved) tasks.push(fetchMerchant());
      await Promise.all(tasks);
    } catch {
      setError("Could not load seller dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sellerStatus]);

  async function saveMerchant(e: FormEvent) {
    e.preventDefault();
    setMerchantError(null);
    setMerchantLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/seller/merchant`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...merchantForm,
          whatsapp: merchantForm.whatsapp || undefined,
          latitude: Number(merchantForm.latitude),
          longitude: Number(merchantForm.longitude)
        })
      });
      const data = (await res.json()) as MerchantProfile | { message?: string };
      if (!res.ok) {
        setMerchantError("message" in data ? data.message ?? "Could not save merchant profile." : "Could not save merchant profile.");
        return;
      }
      setMerchant(data as MerchantProfile);
      await fetchListings();
    } catch {
      setMerchantError("Server error. Try again.");
    } finally {
      setMerchantLoading(false);
    }
  }

  async function createCategory(e: FormEvent) {
    e.preventDefault();
    setCategoryError(null);
    setCategoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ label: categoryLabel })
      });
      const data = (await res.json()) as Category | { message?: string };
      if (!res.ok) {
        setCategoryError("message" in data ? data.message ?? "Could not create category." : "Could not create category.");
        return;
      }
      setCategoryLabel("");
      await fetchCategories();
    } catch {
      setCategoryError("Server error. Try again.");
    } finally {
      setCategoryLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/seller/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          priceRwf: Number(form.priceRwf),
          freshnessNote: form.freshnessNote || undefined
        })
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setFormError(data.message ?? "Could not create listing.");
        return;
      }
      listingModal.onClose();
      setForm({ title: "", description: "", categoryId: "", priceRwf: "", unitLabel: "", inventoryStatus: "IN_STOCK", freshnessNote: "" });
      await Promise.all([fetchListings(), fetchCategories()]);
    } catch {
      setFormError("Server error. Try again.");
    } finally {
      setFormLoading(false);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing?")) return;
    await fetch(`${API_URL}/api/seller/listings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    await Promise.all([fetchListings(), fetchCategories()]);
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack align="stretch" spacing={8}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <Text fontSize="3xl" fontWeight="800">Seller Dashboard</Text>
            <Text color="ink.700" mt={1}>Manage your business profile, categories, listings, and inventory.</Text>
          </Box>
          {isApproved && merchant && (
            <Button bg="brand.500" color="white" _hover={{ bg: "brand.600" }} borderRadius="full" onClick={listingModal.onOpen}>
              + New listing
            </Button>
          )}
        </HStack>

        {isPending && (
          <Alert status="warning" borderRadius="20px">
            <AlertIcon />
            <AlertDescription>Your seller account is pending admin approval. You can manage listings once approved.</AlertDescription>
          </Alert>
        )}

        {isRejected && (
          <Alert status="error" borderRadius="20px">
            <AlertIcon />
            <AlertDescription>Your seller application was rejected. Please contact support.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert status="error" borderRadius="20px">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Total listings</StatLabel>
            <StatNumber>{loading ? "-" : listings.length}</StatNumber>
            <StatHelpText>Published by your shop</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>In stock</StatLabel>
            <StatNumber color="green.500">{loading ? "-" : listings.filter((l) => l.inventoryStatus === "IN_STOCK").length}</StatNumber>
            <StatHelpText>Available now</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Low stock</StatLabel>
            <StatNumber color="orange.500">{loading ? "-" : listings.filter((l) => l.inventoryStatus === "LOW_STOCK").length}</StatNumber>
            <StatHelpText>Needs attention</StatHelpText>
          </Stat>
        </SimpleGrid>

        {isApproved && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
              <Text fontSize="lg" fontWeight="800" mb={5}>{merchant ? "Business Profile" : "Set Up Business Profile"}</Text>
              <form onSubmit={saveMerchant}>
                <VStack spacing={4} align="stretch">
                  {merchantError && (
                    <Alert status="error" borderRadius="16px">
                      <AlertIcon />
                      <AlertDescription>{merchantError}</AlertDescription>
                    </Alert>
                  )}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Business name</FormLabel>
                      <Input value={merchantForm.businessName} onChange={(e) => setMerchantForm({ ...merchantForm, businessName: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Phone</FormLabel>
                      <Input value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>WhatsApp</FormLabel>
                      <Input value={merchantForm.whatsapp} onChange={(e) => setMerchantForm({ ...merchantForm, whatsapp: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Neighborhood</FormLabel>
                      <Input value={merchantForm.neighborhood} onChange={(e) => setMerchantForm({ ...merchantForm, neighborhood: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>District</FormLabel>
                      <Input value={merchantForm.district} onChange={(e) => setMerchantForm({ ...merchantForm, district: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Latitude</FormLabel>
                      <Input type="number" step="any" value={merchantForm.latitude} onChange={(e) => setMerchantForm({ ...merchantForm, latitude: e.target.value })} borderRadius="full" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Longitude</FormLabel>
                      <Input type="number" step="any" value={merchantForm.longitude} onChange={(e) => setMerchantForm({ ...merchantForm, longitude: e.target.value })} borderRadius="full" />
                    </FormControl>
                  </SimpleGrid>
                  <Button type="submit" bg="ink.900" color="white" _hover={{ bg: "ink.800" }} borderRadius="full" isLoading={merchantLoading}>
                    {merchant ? "Save profile" : "Create profile"}
                  </Button>
                </VStack>
              </form>
            </Box>

            <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
              <Text fontSize="lg" fontWeight="800" mb={5}>Categories</Text>
              <form onSubmit={createCategory}>
                <HStack align="start" gap={3}>
                  <FormControl isRequired>
                    <FormLabel>New category</FormLabel>
                    <Input value={categoryLabel} onChange={(e) => setCategoryLabel(e.target.value)} placeholder="e.g. Plumbing services" borderRadius="full" />
                    <FormHelperText>Create a category only when the existing list does not fit.</FormHelperText>
                  </FormControl>
                  <Button mt={8} type="submit" borderRadius="full" colorScheme="orange" isLoading={categoryLoading}>
                    Add
                  </Button>
                </HStack>
              </form>
              {categoryError && (
                <Alert status="error" borderRadius="16px" mt={4}>
                  <AlertIcon />
                  <AlertDescription>{categoryError}</AlertDescription>
                </Alert>
              )}
              <HStack mt={5} spacing={2} flexWrap="wrap">
                {categories.map((cat) => (
                  <Badge key={cat.id} colorScheme={cat.isSystem ? "gray" : "orange"} borderRadius="full" px={3} py={1}>
                    {cat.label}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </SimpleGrid>
        )}

        <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
          <Text fontSize="lg" fontWeight="800" mb={5}>My Listings</Text>
          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2].map((i) => <Skeleton key={i} h="80px" borderRadius="20px" />)}
            </VStack>
          ) : listings.length === 0 ? (
            <Text color="ink.700">
              {isApproved && !merchant ? "Create your business profile before adding listings." : "No listings yet."}
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {listings.map((listing) => (
                <Box key={listing.id} bg="sand.100" borderRadius="20px" p={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Box>
                      <HStack spacing={2} mb={1}>
                        <Text fontWeight="700">{listing.title}</Text>
                        <Badge colorScheme={statusColor[listing.inventoryStatus]} borderRadius="full" fontSize="xs">
                          {listing.inventoryStatus.replace("_", " ")}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="ink.700">
                        {listing.category.label} - {listing.priceRwf.toLocaleString()} RWF / {listing.unitLabel}
                      </Text>
                    </Box>
                    {isApproved && (
                      <Button size="sm" colorScheme="red" variant="outline" borderRadius="full" onClick={() => deleteListing(listing.id)}>
                        Delete
                      </Button>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      <Modal isOpen={listingModal.isOpen} onClose={listingModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="28px">
          <ModalHeader fontWeight="800">New listing</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreate}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {formError && (
                  <Alert status="error" borderRadius="16px">
                    <AlertIcon />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} borderRadius="full" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} borderRadius="20px" rows={3} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} borderRadius="full" placeholder="Select category">
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Inventory status</FormLabel>
                    <Select value={form.inventoryStatus} onChange={(e) => setForm({ ...form, inventoryStatus: e.target.value as InventoryStatus })} borderRadius="full">
                      <option value="IN_STOCK">In stock</option>
                      <option value="LOW_STOCK">Low stock</option>
                      <option value="MADE_TO_ORDER">Made to order</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Price (RWF)</FormLabel>
                    <Input type="number" value={form.priceRwf} onChange={(e) => setForm({ ...form, priceRwf: e.target.value })} borderRadius="full" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Unit label</FormLabel>
                    <Input value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} placeholder="kg, piece, session" borderRadius="full" />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Freshness note</FormLabel>
                  <Input value={form.freshnessNote} onChange={(e) => setForm({ ...form, freshnessNote: e.target.value })} placeholder="e.g. Updated 10 minutes ago" borderRadius="full" />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" borderRadius="full" onClick={listingModal.onClose}>Cancel</Button>
              <Button type="submit" bg="brand.500" color="white" _hover={{ bg: "brand.600" }} borderRadius="full" isLoading={formLoading}>
                Create listing
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
