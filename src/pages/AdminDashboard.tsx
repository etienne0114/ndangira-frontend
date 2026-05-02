import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
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
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

const statusColor: Record<string, string> = {
  PENDING: "#F59E0B",
  APPROVED: "#10B981",
  REJECTED: "#DC2626"
};

const statusBg: Record<string, string> = {
  PENDING: "#FEF3C7",
  APPROVED: "#ECFDF5",
  REJECTED: "#FEE2E2"
};

const roleColor: Record<PlatformUser["role"], string> = {
  ADMIN: "#DC2626",
  SELLER: "#D97706",
  CUSTOMER: "#10B981"
};

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

  const pending = sellers.filter((s) => s.sellerStatus === "PENDING");
  const approved = sellers.filter((s) => s.sellerStatus === "APPROVED");
  const rejected = sellers.filter((s) => s.sellerStatus === "REJECTED");
  const customers = users.filter((u) => u.role === "CUSTOMER");

  return (
    <Container maxW="7xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="800" color="#1A1A2E">
            👨‍💼 Admin Dashboard
          </Text>
          <Text color="#6B6B7A" mt={1}>
            Approve sellers and monitor every platform account.
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #F59E0B" boxShadow="0 2px 8px rgba(245,158,11,0.1)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">
              ⏳ Pending Approval
            </StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#F59E0B">
              {loading ? "-" : pending.length}
            </StatNumber>
            <StatHelpText color="#6B6B7A">Sellers awaiting review</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #10B981" boxShadow="0 2px 8px rgba(16,185,129,0.1)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">
              ✅ Approved Sellers
            </StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#10B981">
              {loading ? "-" : approved.length}
            </StatNumber>
            <StatHelpText color="#6B6B7A">Active on platform</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #DC2626" boxShadow="0 2px 8px rgba(220,38,38,0.1)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">
              ❌ Rejected
            </StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#DC2626">
              {loading ? "-" : rejected.length}
            </StatNumber>
            <StatHelpText color="#6B6B7A">Declined applications</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="2px solid #0F7173" boxShadow="0 2px 8px rgba(15,113,115,0.1)">
            <StatLabel fontSize="sm" fontWeight="600" color="#6B6B7A">
              👥 Total Users
            </StatLabel>
            <StatNumber fontSize="32px" fontWeight="800" color="#0F7173">
              {loading ? "-" : users.length}
            </StatNumber>
            <StatHelpText color="#6B6B7A">{customers.length} customers</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Main Content */}
        <Box bg="white" borderRadius="28px" p={6} border="2px solid #1A1A2E" boxShadow="0 4px 12px rgba(26,26,46,0.08)">
          {error && (
            <Alert status="error" borderRadius="16px" mb={4} bg="#FEE2E2" borderLeft="4px solid #DC2626">
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
            <Tabs colorScheme="orange">
              <TabList borderBottomColor="#E5E7EB" borderBottomWidth="2px">
                <Tab fontWeight="700" color="#6B6B7A" _selected={{ color: "#0F7173", borderBottomColor: "#0F7173" }}>
                  📋 Seller Applications ({pending.length})
                </Tab>
                <Tab fontWeight="700" color="#6B6B7A" _selected={{ color: "#0F7173", borderBottomColor: "#0F7173" }}>
                  👥 All Users ({users.length})
                </Tab>
              </TabList>
              <TabPanels>
                {/* Seller Applications Tab */}
                <TabPanel px={0} pt={6}>
                  {sellers.length === 0 ? (
                    <Text color="#6B6B7A">No seller applications yet.</Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {sellers.map((seller) => (
                        <Box
                          key={seller.id}
                          bg={statusBg[seller.sellerStatus ?? "PENDING"]}
                          borderRadius="20px"
                          p={4}
                          border={`2px solid ${statusColor[seller.sellerStatus ?? "PENDING"]}`}
                          _hover={{ boxShadow: "0 4px 12px rgba(15,113,115,0.15)" }}
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" flexWrap="wrap" gap={3}>
                            <Box flex={1}>
                              <HStack spacing={2} mb={2}>
                                <Text fontWeight="800" fontSize="16px" color="#1A1A2E">
                                  {seller.name}
                                </Text>
                                <Badge
                                  bg={statusColor[seller.sellerStatus ?? "PENDING"]}
                                  color="white"
                                  borderRadius="full"
                                  fontSize="11px"
                                  fontWeight="700"
                                  px={3}
                                >
                                  {seller.sellerStatus ?? "PENDING"}
                                </Badge>
                              </HStack>
                              <Text fontSize="13px" color="#6B6B7A" mb={1}>
                                📧 {seller.email}
                              </Text>
                              {seller.merchant && (
                                <Text fontSize="13px" color="#6B6B7A">
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
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                {/* All Users Tab */}
                <TabPanel px={0} pt={6}>
                  <VStack spacing={3} align="stretch">
                    {users.map((platformUser) => (
                      <Box
                        key={platformUser.id}
                        bg="white"
                        borderRadius="20px"
                        p={4}
                        border="2px solid #E5E7EB"
                        _hover={{ borderColor: "#0F7173", boxShadow: "0 2px 8px rgba(15,113,115,0.1)" }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <Box>
                            <Text fontWeight="800" fontSize="15px" color="#1A1A2E" mb={1}>
                              {platformUser.name}
                            </Text>
                            <Text fontSize="13px" color="#6B6B7A">
                              {platformUser.email}
                            </Text>
                          </Box>
                          <HStack spacing={2}>
                            <Badge
                              bg={roleColor[platformUser.role]}
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
                                bg={statusColor[platformUser.sellerStatus ?? "PENDING"]}
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
                    ))}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(26,26,46,0.6)" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" bg="white" border="2px solid #0F7173">
          <ModalHeader
            bg={confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}
            color="white"
            borderRadius="18px 18px 0 0"
            fontWeight="800"
            fontSize="18px"
          >
            {confirmAction?.action === "approve" ? "✅ Approve Seller?" : "❌ Reject Seller?"}
            <ModalCloseButton color="white" />
          </ModalHeader>

          <ModalBody py={6}>
            {selectedSeller && (
              <VStack align="stretch" spacing={4}>
                <Box bg="#F3F4F6" borderRadius="12px" p={4}>
                  <Text fontSize="14px" fontWeight="700" color="#1A1A2E" mb={2}>
                    {selectedSeller.name}
                  </Text>
                  <Text fontSize="13px" color="#6B6B7A" mb={3}>
                    {selectedSeller.email}
                  </Text>
                  {selectedSeller.merchant && (
                    <Box>
                      <Text fontSize="13px" fontWeight="600" color="#1A1A2E" mb={1}>
                        🏪 Business: {selectedSeller.merchant.businessName}
                      </Text>
                      <Text fontSize="13px" color="#6B6B7A">
                        📍 {selectedSeller.merchant.neighborhood}, {selectedSeller.merchant.district}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box bg={confirmAction?.action === "approve" ? "#ECFDF5" : "#FEE2E2"} borderRadius="12px" p={4} border={`2px solid ${confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}`}>
                  <Text fontSize="13px" color={confirmAction?.action === "approve" ? "#065F46" : "#991B1B"} lineHeight="1.6">
                    {confirmAction?.action === "approve"
                      ? "✅ This seller will be approved and can start creating listings immediately. They will receive a notification about their approval."
                      : "❌ This seller will be rejected and cannot access the seller dashboard. They will receive a notification about the rejection."}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter gap={3} borderTop="2px solid #E5E7EB" pt={4}>
            <Button
              variant="outline"
              borderRadius="full"
              borderColor="#0F7173"
              color="#0F7173"
              fontWeight="700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg={confirmAction?.action === "approve" ? "#10B981" : "#DC2626"}
              color="white"
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
    </Container>
  );
}
