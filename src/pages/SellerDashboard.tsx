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
            <Text fontSize="3xl" fontWeight="800" color="#1A1A2E">Seller Dashboard</Text>
            <Text color="#6B6B7A" mt={1}>Manage your business profile, categories, listings, and inventory.</Text>
          </Box>
          {isApproved && merchant && (
            <Button bg="#0F7173" color="white" _hover={{ bg: "#0D5A5C" }} borderRadius="full" onClick={listingModal.onOpen} fontWeight="700" h="48px" px={6}>
              + New listing
            </Button>
          )}
        </HStack>

        {isPending && (
          <Alert status="warning" borderRadius="20px" bg="#FEF3C7" borderLeft="4px solid #F59E0B">
            <AlertIcon color="#F59E0B" />
            <AlertDescription color="#92400E">Your seller account is pending admin approval. You can manage listings once approved.</AlertDescription>
          </Alert>
        )}

        {isRejected && (
          <Alert status="error" borderRadius="20px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
            <AlertIcon color="#DC2626" />
            <AlertDescription color="#991B1B">Your seller application was rejected. Please contact support.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert status="error" borderRadius="20px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
            <AlertIcon color="#DC2626" />
            <AlertDescription color="#991B1B">{error}</AlertDescription>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #1A1A2E" boxShadow="0 2px 8px rgba(15,113,115,0.1)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">Total listings</StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#1A1A2E">{loading ? "-" : listings.length}</StatNumber>
            <StatHelpText color="#6B6B7A">Published by your shop</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #0F7173" boxShadow="0 2px 8px rgba(15,113,115,0.15)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">In stock</StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#0F7173">{loading ? "-" : listings.filter((l) => l.inventoryStatus === "IN_STOCK").length}</StatNumber>
            <StatHelpText color="#6B6B7A">Available now</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #D97706" boxShadow="0 2px 8px rgba(217,119,6,0.15)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">Low stock</StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#D97706">{loading ? "-" : listings.filter((l) => l.inventoryStatus === "LOW_STOCK").length}</StatNumber>
            <StatHelpText color="#6B6B7A">Needs attention</StatHelpText>
          </Stat>
        </SimpleGrid>

        {isApproved && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box bg="white" borderRadius="28px" p={6} border="2px solid #1A1A2E" boxShadow="0 4px 12px rgba(26,26,46,0.08)">
              <Text fontSize="lg" fontWeight="800" mb={5} color="#1A1A2E">{merchant ? "Business Profile" : "Set Up Business Profile"}</Text>
              <form onSubmit={saveMerchant}>
                <VStack spacing={4} align="stretch">
                  {merchantError && (
                    <Alert status="error" borderRadius="16px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
                      <AlertIcon color="#DC2626" />
                      <AlertDescription color="#991B1B">{merchantError}</AlertDescription>
                    </Alert>
                  )}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">Business name</FormLabel>
                      <Input value={merchantForm.businessName} onChange={(e) => setMerchantForm({ ...merchantForm, businessName: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">Phone</FormLabel>
                      <Input value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontWeight="600" color="#1A1A2E">WhatsApp</FormLabel>
                      <Input value={merchantForm.whatsapp} onChange={(e) => setMerchantForm({ ...merchantForm, whatsapp: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">Neighborhood</FormLabel>
                      <Input value={merchantForm.neighborhood} onChange={(e) => setMerchantForm({ ...merchantForm, neighborhood: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">District</FormLabel>
                      <Input value={merchantForm.district} onChange={(e) => setMerchantForm({ ...merchantForm, district: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">Latitude</FormLabel>
                      <Input type="number" step="any" value={merchantForm.latitude} onChange={(e) => setMerchantForm({ ...merchantForm, latitude: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} placeholder="-1.9441" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" color="#1A1A2E">Longitude</FormLabel>
                      <Input type="number" step="any" value={merchantForm.longitude} onChange={(e) => setMerchantForm({ ...merchantForm, longitude: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} placeholder="30.0619" />
                    </FormControl>
                  </SimpleGrid>
                  <Button type="submit" bg="#0F7173" color="white" _hover={{ bg: "#0D5A5C" }} borderRadius="full" isLoading={merchantLoading} fontWeight="700" h="48px">
                    {merchant ? "Save profile" : "Create profile"}
                  </Button>
                </VStack>
              </form>
            </Box>

            <Box bg="white" borderRadius="28px" p={6} border="2px solid #1A1A2E" boxShadow="0 4px 12px rgba(26,26,46,0.08)">
              <Text fontSize="lg" fontWeight="800" mb={5} color="#1A1A2E">Categories</Text>
              <form onSubmit={createCategory}>
                <HStack align="start" gap={3}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color="#1A1A2E">New category</FormLabel>
                    <Input value={categoryLabel} onChange={(e) => setCategoryLabel(e.target.value)} placeholder="e.g. Plumbing services" borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                    <FormHelperText color="#6B6B7A">Create a category only when the existing list does not fit.</FormHelperText>
                  </FormControl>
                  <Button mt={8} type="submit" borderRadius="full" bg="#0F7173" color="white" _hover={{ bg: "#0D5A5C" }} isLoading={categoryLoading} fontWeight="700">
                    Add
                  </Button>
                </HStack>
              </form>
              {categoryError && (
                <Alert status="error" borderRadius="16px" mt={4} bg="#FEE2E2" borderLeft="4px solid #DC2626">
                  <AlertIcon color="#DC2626" />
                  <AlertDescription color="#991B1B">{categoryError}</AlertDescription>
                </Alert>
              )}
              <HStack mt={5} spacing={2} flexWrap="wrap">
                {categories.map((cat) => (
                  <Badge key={cat.id} bg={cat.isSystem ? "#E5E7EB" : "#0F7173"} color={cat.isSystem ? "#1A1A2E" : "white"} borderRadius="full" px={3} py={1} fontWeight="600">
                    {cat.label}
                  </Badge>
                ))}
              </HStack>
            </Box>
          </SimpleGrid>
        )}

        <Box bg="white" borderRadius="28px" p={6} border="2px solid #1A1A2E" boxShadow="0 4px 12px rgba(26,26,46,0.08)">
          <Text fontSize="lg" fontWeight="800" mb={5} color="#1A1A2E">My Listings</Text>
          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2].map((i) => <Skeleton key={i} h="80px" borderRadius="20px" />)}
            </VStack>
          ) : listings.length === 0 ? (
            <Text color="#6B6B7A">
              {isApproved && !merchant ? "Create your business profile before adding listings." : "No listings yet."}
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {listings.map((listing) => (
                <Box key={listing.id} bg="#F3F4F6" borderRadius="20px" p={4} border="1px solid #E5E7EB" _hover={{ borderColor: "#0F7173", boxShadow: "0 2px 8px rgba(15,113,115,0.1)" }} transition="all 0.2s">
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Box>
                      <HStack spacing={2} mb={1}>
                        <Text fontWeight="700" color="#1A1A2E">{listing.title}</Text>
                        <Badge bg={listing.inventoryStatus === "IN_STOCK" ? "#10B981" : listing.inventoryStatus === "LOW_STOCK" ? "#D97706" : "#3B82F6"} color="white" borderRadius="full" fontSize="xs" fontWeight="600">
                          {listing.inventoryStatus.replace("_", " ")}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="#6B6B7A">
                        {listing.category.label} - {listing.priceRwf.toLocaleString()} RWF / {listing.unitLabel}
                      </Text>
                    </Box>
                    {isApproved && (
                      <Button size="sm" bg="#DC2626" color="white" _hover={{ bg: "#991B1B" }} borderRadius="full" fontWeight="600" onClick={() => deleteListing(listing.id)}>
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
        <ModalContent borderRadius="28px" bg="white">
          <ModalHeader fontWeight="800" color="#1A1A2E" borderBottom="2px solid #E5E7EB">New listing</ModalHeader>
          <ModalCloseButton color="#1A1A2E" />
          <form onSubmit={handleCreate}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {formError && (
                  <Alert status="error" borderRadius="16px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
                    <AlertIcon color="#DC2626" />
                    <AlertDescription color="#991B1B">{formError}</AlertDescription>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel fontWeight="600" color="#1A1A2E">Title</FormLabel>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="600" color="#1A1A2E">Description</FormLabel>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} borderRadius="20px" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} rows={3} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color="#1A1A2E">Category</FormLabel>
                    <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} placeholder="Select category">
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color="#1A1A2E">Inventory status</FormLabel>
                    <Select value={form.inventoryStatus} onChange={(e) => setForm({ ...form, inventoryStatus: e.target.value as InventoryStatus })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }}>
                      <option value="IN_STOCK">In stock</option>
                      <option value="LOW_STOCK">Low stock</option>
                      <option value="MADE_TO_ORDER">Made to order</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color="#1A1A2E">Price (RWF)</FormLabel>
                    <Input type="number" value={form.priceRwf} onChange={(e) => setForm({ ...form, priceRwf: e.target.value })} borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color="#1A1A2E">Unit label</FormLabel>
                    <Input value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} placeholder="kg, piece, session" borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel fontWeight="600" color="#1A1A2E">Freshness note</FormLabel>
                  <Input value={form.freshnessNote} onChange={(e) => setForm({ ...form, freshnessNote: e.target.value })} placeholder="e.g. Updated 10 minutes ago" borderRadius="full" border="2px solid #1A1A2E" _focus={{ borderColor: "#0F7173", borderWidth: "2px" }} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3} borderTop="2px solid #E5E7EB" pt={4}>
              <Button variant="ghost" borderRadius="full" onClick={listingModal.onClose} fontWeight="600" color="#1A1A2E">Cancel</Button>
              <Button type="submit" bg="#0F7173" color="white" _hover={{ bg: "#0D5A5C" }} borderRadius="full" isLoading={formLoading} fontWeight="700">
                Create listing
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
