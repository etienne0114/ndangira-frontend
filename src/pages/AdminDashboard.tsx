import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const TT = {
  white: "#FFFFFF",
  black: "#1A1A2E",
  teal: "#0F7173",
  gray: "#6B6B7A",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB"
};

type FilterState = {
  status: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  userType: "ALL" | "SELLERS" | "CUSTOMERS" | "ADMINS";
  searchQuery: string;
};

interface SellerUser {
  id: string;
  email: string;
  name: string;
  sellerStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  createdAt: string;
  merchant: { id: string; businessName: string; neighborhood: string; district: string; verified: boolean } | null;
}

interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  sellerStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function AdminDashboard() {
  const { token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sellers, setSellers] = useState<SellerUser[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ sellerId: string; action: "approve" | "reject" } | null>(null);
  const [filters, setFilters] = useState<FilterState>({ status: "ALL", userType: "ALL", searchQuery: "" });

  async function fetchSellers() {
    const res = await fetch(`${API_URL}/api/admin/sellers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load sellers");
    const data = (await res.json()) as { items: SellerUser[] };
    setSellers(data.items);
  }

  async function fetchUsers() {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load users");
    const data = (await res.json()) as { items: PlatformUser[] };
    setUsers(data.items);
  }

  async function refreshDashboard() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSellers(), fetchUsers()]);
    } catch {
      setError("Could not load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateSellerStatus(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    setError(null);
    try {
      const endpoint = action === "approve" ? "approve" : "reject";
      const res = await fetch(`${API_URL}/api/admin/sellers/${id}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Status update failed");
      setConfirmAction(null);
      await Promise.all([fetchSellers(), fetchUsers()]);
    } catch {
      setError("Could not update seller status.");
    } finally {
      setActionLoading(null);
    }
  }

  // Filter data based on filters
  const filteredSellers = sellers.filter((s) => {
    if (filters.status !== "ALL" && s.sellerStatus !== filters.status) return false;
    if (filters.searchQuery && !s.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) && !s.email.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (filters.userType !== "ALL") {
      if (filters.userType === "SELLERS" && u.role !== "SELLER") return false;
      if (filters.userType === "CUSTOMERS" && u.role !== "CUSTOMER") return false;
      if (filters.userType === "ADMINS" && u.role !== "ADMIN") return false;
    }
    if (filters.searchQuery && !u.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  const pending = sellers.filter((s) => s.sellerStatus === "PENDING");
  const approved = sellers.filter((s) => s.sellerStatus === "APPROVED");
  const rejected = sellers.filter((s) => s.sellerStatus === "REJECTED");

  return (
    <Flex minH="100vh" bg={TT.white}>
      {/* Sidebar */}
      <Box as="aside" w="280px" flexShrink={0} px="24px" py="28px"
        borderRight={`2px solid ${TT.black}`} display="flex" flexDirection="column"
        gap="28px" overflowY="auto" bg={TT.white}>

        {/* Header */}
        <Box>
          <Text fontSize="16px" fontWeight="800" color={TT.black} mb="4px">
            👨‍💼 Admin Panel
          </Text>
          <Text fontSize="12px" color={TT.gray}>
            Manage sellers & users
          </Text>
        </Box>

        {/* Search */}
        <Box>
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
            color={TT.black} mb="12px" fontFamily="'Inter',sans-serif">🔍 Search</Text>
          <Input
            placeholder="Name or email..."
            fontSize="13px"
            fontFamily="'Inter',sans-serif"
            border={`2px solid ${TT.black}`}
            borderRadius="8px"
            px="12px"
            py="10px"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            _focus={{ borderColor: TT.teal, outline: "none" }}
            _placeholder={{ color: TT.gray }}
          />
        </Box>

        {/* Seller Status Filter */}
        <Box>
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
            color={TT.black} mb="12px" fontFamily="'Inter',sans-serif">📊 Seller Status</Text>
          <VStack align="stretch" spacing="2px">
            {[
              { label: "All Sellers", value: "ALL" as const },
              { label: "⏳ Pending", value: "PENDING" as const },
              { label: "✅ Approved", value: "APPROVED" as const },
              { label: "❌ Rejected", value: "REJECTED" as const }
            ].map((opt) => (
              <Box key={opt.value} as="button" px="12px" py="10px" borderRadius="8px" fontSize="13px"
                fontFamily="'Inter',sans-serif" textAlign="left" cursor="pointer"
                bg={filters.status === opt.value ? "#E0F2F1" : "transparent"}
                border={`2px solid ${filters.status === opt.value ? TT.teal : "transparent"}`}
                fontWeight={filters.status === opt.value ? "700" : "500"}
                color={filters.status === opt.value ? TT.teal : TT.black}
                onClick={() => setFilters({ ...filters, status: opt.value })}
                transition="all 0.2s"
                _hover={{ bg: TT.lightGray, borderColor: TT.teal }}
                style={{ outline: "none" }}>
                {opt.label}
              </Box>
            ))}
          </VStack>
        </Box>

        {/* User Type Filter */}
        <Box>
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
            color={TT.black} mb="12px" fontFamily="'Inter',sans-serif">👥 User Type</Text>
          <VStack align="stretch" spacing="2px">
            {[
              { label: "All Users", value: "ALL" as const },
              { label: "🏪 Sellers", value: "SELLERS" as const },
              { label: "🛍️ Customers", value: "CUSTOMERS" as const },
              { label: "🔐 Admins", value: "ADMINS" as const }
            ].map((opt) => (
              <Box key={opt.value} as="button" px="12px" py="10px" borderRadius="8px" fontSize="13px"
                fontFamily="'Inter',sans-serif" textAlign="left" cursor="pointer"
                bg={filters.userType === opt.value ? "#E0F2F1" : "transparent"}
                border={`2px solid ${filters.userType === opt.value ? TT.teal : "transparent"}`}
                fontWeight={filters.userType === opt.value ? "700" : "500"}
                color={filters.userType === opt.value ? TT.teal : TT.black}
                onClick={() => setFilters({ ...filters, userType: opt.value })}
                transition="all 0.2s"
                _hover={{ bg: TT.lightGray, borderColor: TT.teal }}
                style={{ outline: "none" }}>
                {opt.label}
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Stats */}
        <Box borderTop={`2px solid ${TT.borderGray}`} pt="20px">
          <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase"
            color={TT.black} mb="12px" fontFamily="'Inter',sans-serif">📈 Stats</Text>
          <VStack align="stretch" spacing="8px" fontSize="13px" fontFamily="'Inter',sans-serif">
            <HStack justify="space-between">
              <Text color={TT.gray}>Pending:</Text>
              <Text fontWeight="700" color="#F59E0B">{pending.length}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color={TT.gray}>Approved:</Text>
              <Text fontWeight="700" color="#10B981">{approved.length}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color={TT.gray}>Rejected:</Text>
              <Text fontWeight="700" color="#DC2626">{rejected.length}</Text>
            </HStack>
            <HStack justify="space-between" borderTop={`2px solid ${TT.borderGray}`} pt="8px">
              <Text color={TT.gray}>Total Users:</Text>
              <Text fontWeight="700" color={TT.teal}>{users.length}</Text>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column" overflowY="auto">
        {/* Header */}
        <Box px="32px" py="28px" borderBottom={`2px solid ${TT.borderGray}`} bg={TT.white}>
          <Text fontSize="28px" fontWeight="800" color={TT.black} mb="4px">
            Admin Dashboard
          </Text>
          <Text color={TT.gray} fontSize="14px">
            Manage sellers and monitor platform accounts
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
              {/* Sellers Section */}
              <Box>
                <Text fontSize="18px" fontWeight="800" color={TT.black} mb={4}>
                  📋 Seller Applications ({filteredSellers.length})
                </Text>
                {filteredSellers.length === 0 ? (
                  <Box bg={TT.lightGray} borderRadius="16px" p={6} textAlign="center">
                    <Text color={TT.gray}>No sellers match your filters</Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {filteredSellers.map((seller) => {
                      const statusColor = seller.sellerStatus === "PENDING" ? "#F59E0B" : seller.sellerStatus === "APPROVED" ? "#10B981" : "#DC2626";
                      const statusBg = seller.sellerStatus === "PENDING" ? "#FEF3C7" : seller.sellerStatus === "APPROVED" ? "#ECFDF5" : "#FEE2E2";
                      return (
                        <Box
                          key={seller.id}
                          bg={statusBg}
                          borderRadius="16px"
                          p={4}
                          border={`2px solid ${statusColor}`}
                          _hover={{ boxShadow: "0 4px 12px rgba(15,113,115,0.15)" }}
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" flexWrap="wrap" gap={3}>
                            <Box flex={1}>
                              <HStack spacing={2} mb={2}>
                                <Text fontWeight="800" fontSize="15px" color={TT.black}>
                                  {seller.name}
                                </Text>
                                <Badge
                                  bg={statusColor}
                                  color="white"
                                  borderRadius="full"
                                  fontSize="11px"
                                  fontWeight="700"
                                  px={3}
                                >
                                  {seller.sellerStatus ?? "PENDING"}
                                </Badge>
                              </HStack>
                              <Text fontSize="13px" color={TT.gray} mb={1}>
                                📧 {seller.email}
                              </Text>
                              {seller.merchant && (
                                <Text fontSize="13px" color={TT.gray}>
                                  🏪 {seller.merchant.businessName} • {seller.merchant.neighborhood}, {seller.merchant.district}
                                </Text>
                              )}
                            </Box>

                            {seller.sellerStatus === "PENDING" && (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  bg="#10B981"
                                  color="white"
                                  _hover={{ bg: "#059669" }}
                                  borderRadius="full"
                                  fontWeight="700"
                                  isLoading={actionLoading === seller.id + "approve"}
                                  onClick={() => {
                                    setSelectedSeller(seller);
                                    setConfirmAction({ sellerId: seller.id, action: "approve" });
                                    onOpen();
                                  }}
                                >
                                  ✅ Approve
                                </Button>
                                <Button
                                  size="sm"
                                  bg="#DC2626"
                                  color="white"
                                  _hover={{ bg: "#991B1B" }}
                                  borderRadius="full"
                                  fontWeight="700"
                                  isLoading={actionLoading === seller.id + "reject"}
                                  onClick={() => {
                                    setSelectedSeller(seller);
                                    setConfirmAction({ sellerId: seller.id, action: "reject" });
                                    onOpen();
                                  }}
                                >
                                  ❌ Reject
                                </Button>
                              </HStack>
                            )}
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>

              {/* Users Section */}
              <Box>
                <Text fontSize="18px" fontWeight="800" color={TT.black} mb={4}>
                  👥 All Users ({filteredUsers.length})
                </Text>
                {filteredUsers.length === 0 ? (
                  <Box bg={TT.lightGray} borderRadius="16px" p={6} textAlign="center">
                    <Text color={TT.gray}>No users match your filters</Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {filteredUsers.map((platformUser) => {
                      const roleColor = platformUser.role === "ADMIN" ? "#DC2626" : platformUser.role === "SELLER" ? "#D97706" : "#10B981";
                      return (
                        <Box
                          key={platformUser.id}
                          bg={TT.white}
                          borderRadius="16px"
                          p={4}
                          border={`2px solid ${TT.borderGray}`}
                          _hover={{ borderColor: TT.teal, boxShadow: "0 2px 8px rgba(15,113,115,0.1)" }}
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" flexWrap="wrap" gap={3}>
                            <Box>
                              <Text fontWeight="800" fontSize="15px" color={TT.black} mb={1}>
                                {platformUser.name}
                              </Text>
                              <Text fontSize="13px" color={TT.gray}>
                                {platformUser.email}
                              </Text>
                            </Box>
                            <HStack spacing={2}>
                              <Badge
                                bg={roleColor}
                                color="white"
                                borderRadius="full"
                                fontSize="11px"
                                fontWeight="700"
                                px={3}
                              >
                                {platformUser.role.toLowerCase()}
                              </Badge>
                              {platformUser.role === "SELLER" && (
                                <Badge
                                  bg={platformUser.sellerStatus === "PENDING" ? "#F59E0B" : platformUser.sellerStatus === "APPROVED" ? "#10B981" : "#DC2626"}
                                  color="white"
                                  borderRadius="full"
                                  fontSize="11px"
                                  fontWeight="700"
                                  px={3}
                                >
                                  {platformUser.sellerStatus ?? "PENDING"}
                                </Badge>
                              )}
                            </HStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </VStack>
          )}
        </Box>
      </Box>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(26,26,46,0.6)" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" bg={TT.white} border={`2px solid ${TT.teal}`}>
          <ModalHeader
            bg={confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}
            color={TT.white}
            borderRadius="18px 18px 0 0"
            fontWeight="800"
            fontSize="18px"
          >
            {confirmAction?.action === "approve" ? "✅ Approve Seller?" : "❌ Reject Seller?"}
            <ModalCloseButton color={TT.white} />
          </ModalHeader>

          <ModalBody py={6}>
            {selectedSeller && (
              <VStack align="stretch" spacing={4}>
                <Box bg={TT.lightGray} borderRadius="12px" p={4}>
                  <Text fontSize="14px" fontWeight="700" color={TT.black} mb={2}>
                    {selectedSeller.name}
                  </Text>
                  <Text fontSize="13px" color={TT.gray} mb={3}>
                    {selectedSeller.email}
                  </Text>
                  {selectedSeller.merchant && (
                    <Box>
                      <Text fontSize="13px" fontWeight="600" color={TT.black} mb={1}>
                        🏪 Business: {selectedSeller.merchant.businessName}
                      </Text>
                      <Text fontSize="13px" color={TT.gray}>
                        📍 {selectedSeller.merchant.neighborhood}, {selectedSeller.merchant.district}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box
                  bg={confirmAction?.action === "approve" ? "#ECFDF5" : "#FEE2E2"}
                  borderRadius="12px"
                  p={4}
                  border={`2px solid ${confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}`}
                >
                  <Text fontSize="13px" color={confirmAction?.action === "approve" ? "#065F46" : "#991B1B"} lineHeight="1.6">
                    {confirmAction?.action === "approve"
                      ? "✅ This seller will be approved and can start creating listings immediately. They will receive a notification about their approval."
                      : "❌ This seller will be rejected and cannot access the seller dashboard. They will receive a notification about the rejection."}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter gap={3} borderTop={`2px solid ${TT.borderGray}`} pt={4}>
            <Button
              variant="outline"
              borderRadius="full"
              borderColor={TT.teal}
              color={TT.teal}
              fontWeight="700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg={confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}
              color={TT.white}
              _hover={{ bg: confirmAction?.action === "approve" ? "#059669" : "#991B1B" }}
              borderRadius="full"
              fontWeight="700"
              isLoading={actionLoading !== null}
              onClick={() => {
                if (confirmAction) {
                  updateSellerStatus(confirmAction.sellerId, confirmAction.action);
                }
              }}
            >
              {confirmAction?.action === "approve" ? "✅ Approve" : "❌ Reject"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
