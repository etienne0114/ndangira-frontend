import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  HStack,
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
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red"
};

const roleColor: Record<PlatformUser["role"], string> = {
  ADMIN: "red",
  SELLER: "orange",
  CUSTOMER: "green"
};

export function AdminDashboard() {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<SellerUser[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const res = await fetch(`${API_URL}/api/admin/sellers/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Status update failed");
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
        <Box>
          <Text fontSize="3xl" fontWeight="800">Admin Dashboard</Text>
          <Text color="ink.700" mt={1}>Approve sellers and monitor every platform account.</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Pending approval</StatLabel>
            <StatNumber color="orange.500">{loading ? "-" : pending.length}</StatNumber>
            <StatHelpText>Sellers awaiting review</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Approved sellers</StatLabel>
            <StatNumber color="green.500">{loading ? "-" : approved.length}</StatNumber>
            <StatHelpText>Active on platform</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Rejected</StatLabel>
            <StatNumber color="red.400">{loading ? "-" : rejected.length}</StatNumber>
            <StatHelpText>Declined applications</StatHelpText>
          </Stat>
          <Stat bg="white" borderRadius="24px" p={5} border="1px solid rgba(23,23,23,0.06)">
            <StatLabel>Total users</StatLabel>
            <StatNumber color="blue.500">{loading ? "-" : users.length}</StatNumber>
            <StatHelpText>{customers.length} customers</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box bg="white" borderRadius="28px" p={6} border="1px solid rgba(23,23,23,0.06)">
          {error && (
            <Alert status="error" borderRadius="16px" mb={4}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2, 3].map((i) => <Skeleton key={i} h="80px" borderRadius="20px" />)}
            </VStack>
          ) : (
            <Tabs colorScheme="orange">
              <TabList>
                <Tab>Seller Applications</Tab>
                <Tab>All Users</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  {sellers.length === 0 ? (
                    <Text color="ink.700">No seller applications yet.</Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {sellers.map((seller) => (
                        <Box key={seller.id} bg="sand.100" borderRadius="20px" p={4}>
                          <HStack justify="space-between" flexWrap="wrap" gap={3}>
                            <Box>
                              <HStack spacing={2} mb={1}>
                                <Text fontWeight="700">{seller.name}</Text>
                                <Badge colorScheme={statusColor[seller.sellerStatus ?? "PENDING"]} borderRadius="full" fontSize="xs">
                                  {seller.sellerStatus ?? "PENDING"}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="ink.700">{seller.email}</Text>
                              {seller.merchant && (
                                <Text fontSize="sm" color="ink.700">
                                  {seller.merchant.businessName} - {seller.merchant.neighborhood}
                                </Text>
                              )}
                            </Box>

                            {seller.sellerStatus === "PENDING" && (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  borderRadius="full"
                                  isLoading={actionLoading === seller.id + "approve"}
                                  onClick={() => updateSellerStatus(seller.id, "approve")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  borderRadius="full"
                                  isLoading={actionLoading === seller.id + "reject"}
                                  onClick={() => updateSellerStatus(seller.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </HStack>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                <TabPanel px={0}>
                  <VStack spacing={3} align="stretch">
                    {users.map((platformUser) => (
                      <Box key={platformUser.id} bg="sand.100" borderRadius="20px" p={4}>
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <Box>
                            <Text fontWeight="700">{platformUser.name}</Text>
                            <Text fontSize="sm" color="ink.700">{platformUser.email}</Text>
                          </Box>
                          <HStack spacing={2}>
                            <Badge colorScheme={roleColor[platformUser.role]} borderRadius="full">
                              {platformUser.role.toLowerCase()}
                            </Badge>
                            {platformUser.role === "SELLER" && (
                              <Badge colorScheme={statusColor[platformUser.sellerStatus ?? "PENDING"]} borderRadius="full">
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
    </Container>
  );
}
