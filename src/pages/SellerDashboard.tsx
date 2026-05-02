import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
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
  Text,
  Textarea,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Category, InventoryStatus } from "../types";
import { useAuth } from "../context/AuthContext";

const TT = {
  white: "#FFFFFF",
  black: "#1A1A2E",
  teal: "#0F7173",
  gray: "#6B6B7A",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB"
};

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const navigate = useNavigate();
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

  const inStock = listings.filter((l) => l.inventoryStatus === "IN_STOCK").length;
  const lowStock = listings.filter((l) => l.inventoryStatus === "LOW_STOCK").length;

  return (
    <Flex minH="100vh" bg={TT.white}>
      {/* Sidebar */}
      <Box as="aside" w="280px" flexShrink={0} px="24px" py="28px"
        borderRight={`2px solid ${TT.black}`} display="flex" flexDirection="column"
        gap="28px" overflowY="auto" bg={TT.white}>

        {/* Header */}
        <Box>
          <Text fontSize="16px" fontWeight="800" color={TT.black} mb="4px">
            🏪 Seller Panel
          </Text>
          <Text fontSize="12px" color={TT.gray}>
            Manage your products
          </Text>
        </Box>

        {/* Status Alert */}
        {isPending && (
          <Box bg="#FEF3C7" borderRadius="12px" p={3} border="2px solid #F59E0B">
            <Text fontSize="12px" fontWeight="700" color="#92400E" mb={1}>⏳ Pending Approval</Text>
            <Text fontSize="11px" color="#92400E">Your account is awaiting admin approval</Text>
          </Box>
        )}

        {isRejected && (
          <Box bg="#FEE2E2" borderRadius="12px" p={3} border="2px solid #DC2626">
            <Text fontSize="12px" fontWeight="700" color="#991B1B" mb={1}>❌ Rejected</Text>
            <Text fontSize="11px" color="#991B1B">Contact support for details</Text>
          </Box>
        )}

        {isApproved && (
          <Box bg="#ECFDF5" borderRadius="12px" p={3} border="2px solid #10B981">
            <Text fontSize="12px" fontWeight="700" color="#065F46" mb={1}>✅ Approved</Text>
            <Text fontSize="11px" color="#065F46">You can manage products</Text>
          </Box>
        )}

        {/* Quick Actions */}
        {isApproved && (
          <VStack align="stretch" spacing={2}>
            <Button
              w="full"
              bg={TT.teal}
              color={TT.white}
              _hover={{ bg: "#0D5A5C" }}
              borderRadius="full"
              fontWeight="700"
              onClick={listingModal.onOpen}
              fontSize="13px"
            >
              ➕ Add Product
            </Button>
            <Button
              w="full"
              bg={TT.teal}
              color={TT.white}
              _hover={{ bg: "#0D5A5C" }}
              borderRadius="full"
              fontWeight="700"
              onClick={() => navigate("/seller/market-analysis")}
              fontSize="13px"
            >
              📊 Market Analysis
            </Button>
          </VStack>
        )}

        {/* Stats */}
        <Box borderTop={`2px solid ${TT.borderGray}`} pt="20px">
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
            color={TT.black} mb="12px" fontFamily="'Inter',sans-serif">📈 Stats</Text>
          <VStack align="stretch" spacing="8px" fontSize="13px" fontFamily="'Inter',sans-serif">
            <HStack justify="space-between">
              <Text color={TT.gray}>Total:</Text>
              <Text fontWeight="700" color={TT.black}>{listings.length}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color={TT.gray}>In Stock:</Text>
              <Text fontWeight="700" color="#10B981">{inStock}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color={TT.gray}>Low Stock:</Text>
              <Text fontWeight="700" color="#D97706">{lowStock}</Text>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column" overflowY="auto">
        {/* Header */}
        <Box px="32px" py="28px" borderBottom={`2px solid ${TT.borderGray}`} bg={TT.white}>
          <Text fontSize="28px" fontWeight="800" color={TT.black} mb="4px">
            Seller Dashboard
          </Text>
          <Text color={TT.gray} fontSize="14px">
            Manage your business profile and product listings
          </Text>
        </Box>

        {/* Content */}
        <Box flex={1} px="32px" py="28px" overflowY="auto">
          {error && (
            <Alert status="error" borderRadius="16px" mb={6} bg="#FEE2E2" borderLeft="4px solid #DC2626">
              <AlertIcon color="#DC2626" />
              <AlertDescription color="#991B1B">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h="80px" borderRadius="20px" />
              ))}
            </VStack>
          ) : (
            <VStack align="stretch" spacing={6}>
              {/* Business Profile Section */}
              {isApproved && (
                <Box bg={TT.white} borderRadius="28px" p={6} border={`2px solid ${TT.black}`} boxShadow="0 4px 12px rgba(26,26,46,0.08)">
                  <Text fontSize="lg" fontWeight="800" mb={5} color={TT.black}>
                    🏢 Business Profile
                  </Text>
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
                          <FormLabel fontWeight="600" color={TT.black}>Business name</FormLabel>
                          <Input value={merchantForm.businessName} onChange={(e) => setMerchantForm({ ...merchantForm, businessName: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color={TT.black}>Phone</FormLabel>
                          <Input value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="600" color={TT.black}>WhatsApp</FormLabel>
                          <Input value={merchantForm.whatsapp} onChange={(e) => setMerchantForm({ ...merchantForm, whatsapp: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color={TT.black}>Neighborhood</FormLabel>
                          <Input value={merchantForm.neighborhood} onChange={(e) => setMerchantForm({ ...merchantForm, neighborhood: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color={TT.black}>District</FormLabel>
                          <Input value={merchantForm.district} onChange={(e) => setMerchantForm({ ...merchantForm, district: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color={TT.black}>Latitude</FormLabel>
                          <Input type="number" step="any" value={merchantForm.latitude} onChange={(e) => setMerchantForm({ ...merchantForm, latitude: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} placeholder="-1.9441" />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color={TT.black}>Longitude</FormLabel>
                          <Input type="number" step="any" value={merchantForm.longitude} onChange={(e) => setMerchantForm({ ...merchantForm, longitude: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} placeholder="30.0619" />
                        </FormControl>
                      </SimpleGrid>
                      <Button type="submit" bg={TT.teal} color={TT.white} _hover={{ bg: "#0D5A5C" }} borderRadius="full" isLoading={merchantLoading} fontWeight="700" h="48px">
                        {merchant ? "💾 Save Profile" : "✅ Create Profile"}
                      </Button>
                    </VStack>
                  </form>
                </Box>
              )}

              {/* Categories Section */}
              {isApproved && (
                <Box bg={TT.white} borderRadius="28px" p={6} border={`2px solid ${TT.black}`} boxShadow="0 4px 12px rgba(26,26,46,0.08)">
                  <Text fontSize="lg" fontWeight="800" mb={5} color={TT.black}>📂 Categories</Text>
                  <form onSubmit={createCategory}>
                    <HStack align="start" gap={3}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="600" color={TT.black}>New category</FormLabel>
                        <Input value={categoryLabel} onChange={(e) => setCategoryLabel(e.target.value)} placeholder="e.g. Plumbing services" borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                        <FormHelperText color={TT.gray}>Create a category only when the existing list does not fit.</FormHelperText>
                      </FormControl>
                      <Button mt={8} type="submit" borderRadius="full" bg={TT.teal} color={TT.white} _hover={{ bg: "#0D5A5C" }} isLoading={categoryLoading} fontWeight="700">
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
                      <Badge key={cat.id} bg={cat.isSystem ? TT.lightGray : TT.teal} color={cat.isSystem ? TT.black : TT.white} borderRadius="full" px={3} py={1} fontWeight="600">
                        {cat.label}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Listings Section */}
              <Box bg={TT.white} borderRadius="28px" p={6} border={`2px solid ${TT.black}`} boxShadow="0 4px 12px rgba(26,26,46,0.08)">
                <Text fontSize="lg" fontWeight="800" mb={5} color={TT.black}>📦 My Products</Text>
                {loading ? (
                  <VStack spacing={3} align="stretch">
                    {[1, 2].map((i) => <Skeleton key={i} h="80px" borderRadius="20px" />)}
                  </VStack>
                ) : listings.length === 0 ? (
                  <Text color={TT.gray}>
                    {isApproved && !merchant ? "Create your business profile before adding products." : "No products yet."}
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {listings.map((listing) => (
                      <Box key={listing.id} bg={TT.lightGray} borderRadius="20px" p={4} border={`2px solid ${TT.borderGray}`} _hover={{ borderColor: TT.teal, boxShadow: "0 2px 8px rgba(15,113,115,0.1)" }} transition="all 0.2s">
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <Box>
                            <HStack spacing={2} mb={1}>
                              <Text fontWeight="700" color={TT.black}>{listing.title}</Text>
                              <Badge bg={listing.inventoryStatus === "IN_STOCK" ? "#10B981" : listing.inventoryStatus === "LOW_STOCK" ? "#D97706" : "#3B82F6"} color="white" borderRadius="full" fontSize="xs" fontWeight="600">
                                {listing.inventoryStatus.replace("_", " ")}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color={TT.gray}>
                              {listing.category.label} - {listing.priceRwf.toLocaleString()} RWF / {listing.unitLabel}
                            </Text>
                          </Box>
                          {isApproved && (
                            <Button size="sm" bg="#DC2626" color="white" _hover={{ bg: "#991B1B" }} borderRadius="full" fontWeight="600" onClick={() => deleteListing(listing.id)}>
                              🗑️ Delete
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          )}
        </Box>
      </Box>

      {/* Add Product Modal */}
      <Modal isOpen={listingModal.isOpen} onClose={listingModal.onClose} size="lg">
        <ModalOverlay bg="rgba(26,26,46,0.6)" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="28px" bg={TT.white} border={`2px solid ${TT.teal}`}>
          <ModalHeader fontWeight="800" color={TT.black} borderBottom={`2px solid ${TT.borderGray}`}>
            ➕ Add New Product
          </ModalHeader>
          <ModalCloseButton color={TT.black} />
          <form onSubmit={handleCreate}>
            <ModalBody py={6}>
              <VStack spacing={4} align="stretch">
                {formError && (
                  <Alert status="error" borderRadius="16px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
                    <AlertIcon color="#DC2626" />
                    <AlertDescription color="#991B1B">{formError}</AlertDescription>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel fontWeight="600" color={TT.black}>Product Title</FormLabel>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="600" color={TT.black}>Description</FormLabel>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} borderRadius="20px" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} rows={3} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color={TT.black}>Category</FormLabel>
                    <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} placeholder="Select category">
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color={TT.black}>Inventory Status</FormLabel>
                    <Select value={form.inventoryStatus} onChange={(e) => setForm({ ...form, inventoryStatus: e.target.value as InventoryStatus })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }}>
                      <option value="IN_STOCK">In Stock</option>
                      <option value="LOW_STOCK">Low Stock</option>
                      <option value="MADE_TO_ORDER">Made to Order</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color={TT.black}>Price (RWF)</FormLabel>
                    <Input type="number" value={form.priceRwf} onChange={(e) => setForm({ ...form, priceRwf: e.target.value })} borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" color={TT.black}>Unit Label</FormLabel>
                    <Input value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} placeholder="kg, piece, session" borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel fontWeight="600" color={TT.black}>Freshness Note</FormLabel>
                  <Input value={form.freshnessNote} onChange={(e) => setForm({ ...form, freshnessNote: e.target.value })} placeholder="e.g. Updated 10 minutes ago" borderRadius="full" border={`2px solid ${TT.black}`} _focus={{ borderColor: TT.teal, borderWidth: "2px" }} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3} borderTop={`2px solid ${TT.borderGray}`} pt={4}>
              <Button variant="outline" borderRadius="full" borderColor={TT.teal} color={TT.teal} fontWeight="700" onClick={listingModal.onClose}>
                Cancel
              </Button>
              <Button type="submit" bg={TT.teal} color={TT.white} _hover={{ bg: "#0D5A5C" }} borderRadius="full" isLoading={formLoading} fontWeight="700">
                ✅ Add Product
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
