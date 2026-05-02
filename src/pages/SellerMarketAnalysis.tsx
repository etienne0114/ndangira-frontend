import { useEffect, useState } from "react";
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
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { HiSparkles, HiCheckCircle } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface MarketInsight {
  category: string;
  trend: "rising" | "stable" | "declining";
  demand: number; // 1-10
  avgPrice: number;
  competitorCount: number;
  opportunity: string;
}

interface SellerRecommendation {
  title: string;
  description: string;
  category: string;
  estimatedDemand: number;
  potentialPrice: number;
  reason: string;
}

export function SellerMarketAnalysis() {
  const { token, user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [recommendations, setRecommendations] = useState<SellerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [selectedRecommendation, setSelectedRecommendation] = useState<SellerRecommendation | null>(null);

  useEffect(() => {
    fetchMarketAnalysis();
  }, []);

  async function fetchMarketAnalysis() {
    setLoading(true);
    setError(null);
    try {
      // Mock data for market insights
      const mockInsights: MarketInsight[] = [
        {
          category: "GROCERIES",
          trend: "rising",
          demand: 9,
          avgPrice: 4500,
          competitorCount: 12,
          opportunity: "High demand, moderate competition"
        },
        {
          category: "ELECTRONICS",
          trend: "stable",
          demand: 7,
          avgPrice: 45000,
          competitorCount: 8,
          opportunity: "Stable market with good margins"
        },
        {
          category: "FASHION",
          trend: "rising",
          demand: 8,
          avgPrice: 15000,
          competitorCount: 15,
          opportunity: "Growing trend, seasonal opportunity"
        },
        {
          category: "RESTAURANTS",
          trend: "rising",
          demand: 9,
          avgPrice: 12000,
          competitorCount: 20,
          opportunity: "Peak demand during lunch/dinner hours"
        },
        {
          category: "SERVICES",
          trend: "stable",
          demand: 6,
          avgPrice: 8000,
          competitorCount: 10,
          opportunity: "Consistent demand, build reputation"
        },
        {
          category: "PHARMACY",
          trend: "stable",
          demand: 8,
          avgPrice: 5000,
          competitorCount: 5,
          opportunity: "Essential services, loyal customers"
        }
      ];

      const mockRecommendations: SellerRecommendation[] = [
        {
          title: "Fresh Vegetables Bundle",
          description: "Seasonal vegetables with high freshness",
          category: "GROCERIES",
          estimatedDemand: 9,
          potentialPrice: 5000,
          reason: "High demand in your neighborhood, trending upward"
        },
        {
          title: "Phone Accessories",
          description: "Chargers, cables, screen protectors",
          category: "ELECTRONICS",
          estimatedDemand: 7,
          potentialPrice: 3500,
          reason: "Consistent demand with good profit margins"
        },
        {
          title: "Casual Wear Collection",
          description: "T-shirts, jeans, casual outfits",
          category: "FASHION",
          estimatedDemand: 8,
          potentialPrice: 12000,
          reason: "Rising trend, seasonal opportunity"
        },
        {
          title: "Lunch Meal Packages",
          description: "Healthy, affordable meal options",
          category: "RESTAURANTS",
          estimatedDemand: 9,
          potentialPrice: 10000,
          reason: "Peak demand during lunch hours, high repeat customers"
        }
      ];

      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setAiAnalysis(
        "📊 Market Analysis: Your neighborhood shows strong demand for groceries and restaurant services. " +
        "Fresh produce and meal packages are trending upward with 9/10 demand. Electronics and fashion also show " +
        "good opportunities. Consider starting with high-demand items to build your reputation quickly."
      );
    } catch (err) {
      setError("Could not load market analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const trendColor = (trend: string) => {
    switch (trend) {
      case "rising":
        return "#10B981";
      case "stable":
        return "#0F7173";
      case "declining":
        return "#DC2626";
      default:
        return "#6B6B7A";
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return "📈";
      case "stable":
        return "➡️";
      case "declining":
        return "📉";
      default:
        return "❓";
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="800" color="#1A1A2E">
            📊 Market Analysis & Insights
          </Text>
          <Text color="#6B6B7A" mt={1}>
            AI-powered analysis to help you choose the best products to sell
          </Text>
        </Box>

        {/* AI Analysis Summary */}
        {!loading && aiAnalysis && (
          <Box
            bg="linear-gradient(135deg, #0F7173 0%, #0D5A5C 100%)"
            borderRadius="20px"
            p={6}
            color="white"
            border="2px solid #0F7173"
            boxShadow="0 8px 24px rgba(15,113,115,0.2)"
          >
            <HStack spacing={3} align="start" mb={3}>
              <Icon as={HiSparkles} boxSize={6} />
              <Text fontSize="14px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase">
                AI Insights
              </Text>
            </HStack>
            <Text fontSize="15px" lineHeight="1.7">
              {aiAnalysis}
            </Text>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert status="error" borderRadius="16px" bg="#FEE2E2" borderLeft="4px solid #DC2626">
            <AlertIcon color="#DC2626" />
            <AlertDescription color="#991B1B">{error}</AlertDescription>
          </Alert>
        )}

        {/* Market Insights Grid */}
        <Box>
          <Text fontSize="lg" fontWeight="800" mb={4} color="#1A1A2E">
            🏪 Market Trends by Category
          </Text>
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} h="200px" borderRadius="16px" />
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {insights.map((insight) => (
                <Box
                  key={insight.category}
                  bg="white"
                  borderRadius="16px"
                  p={5}
                  border="2px solid #E5E7EB"
                  _hover={{ borderColor: "#0F7173", boxShadow: "0 8px 24px rgba(15,113,115,0.1)" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between" align="start" mb={3}>
                    <Text fontWeight="800" fontSize="16px" color="#1A1A2E">
                      {insight.category}
                    </Text>
                    <Badge
                      bg={trendColor(insight.trend)}
                      color="white"
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="700"
                      px={3}
                    >
                      {trendIcon(insight.trend)} {insight.trend.toUpperCase()}
                    </Badge>
                  </HStack>

                  <VStack align="stretch" spacing={3}>
                    {/* Demand */}
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="12px" fontWeight="700" color="#6B6B7A" textTransform="uppercase">
                          Demand
                        </Text>
                        <Text fontSize="14px" fontWeight="800" color="#0F7173">
                          {insight.demand}/10
                        </Text>
                      </HStack>
                      <Box h="6px" bg="#E5E7EB" borderRadius="full" overflow="hidden">
                        <Box
                          h="full"
                          bg="#0F7173"
                          w={`${(insight.demand / 10) * 100}%`}
                          transition="width 0.3s"
                        />
                      </Box>
                    </Box>

                    {/* Avg Price */}
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="700" color="#6B6B7A">
                        💰 Avg Price
                      </Text>
                      <Text fontSize="14px" fontWeight="800" color="#1A1A2E">
                        {insight.avgPrice.toLocaleString()} RWF
                      </Text>
                    </HStack>

                    {/* Competitors */}
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="700" color="#6B6B7A">
                        🏪 Competitors
                      </Text>
                      <Text fontSize="14px" fontWeight="800" color="#1A1A2E">
                        {insight.competitorCount}
                      </Text>
                    </HStack>

                    {/* Opportunity */}
                    <Box bg="#F3F4F6" borderRadius="8px" p={2}>
                      <Text fontSize="12px" color="#1A1A2E" fontWeight="600">
                        💡 {insight.opportunity}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* AI Recommendations */}
        <Box>
          <Text fontSize="lg" fontWeight="800" mb={4} color="#1A1A2E">
            🎯 AI Recommendations for You
          </Text>
          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} h="150px" borderRadius="16px" />
              ))}
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {recommendations.map((rec, idx) => (
                <Box
                  key={idx}
                  bg="white"
                  borderRadius="16px"
                  p={5}
                  border="2px solid #E5E7EB"
                  _hover={{ borderColor: "#0F7173", boxShadow: "0 8px 24px rgba(15,113,115,0.1)" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between" align="start" mb={3}>
                    <Box flex={1}>
                      <Text fontWeight="800" fontSize="16px" color="#1A1A2E" mb={1}>
                        {rec.title}
                      </Text>
                      <Text fontSize="13px" color="#6B6B7A">
                        {rec.description}
                      </Text>
                    </Box>
                    <Badge bg="#0F7173" color="white" borderRadius="full" fontSize="11px" fontWeight="700">
                      {rec.category}
                    </Badge>
                  </HStack>

                  <VStack align="stretch" spacing={3} mb={4}>
                    {/* Demand */}
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="700" color="#6B6B7A">
                        📈 Estimated Demand
                      </Text>
                      <Text fontSize="14px" fontWeight="800" color="#0F7173">
                        {rec.estimatedDemand}/10
                      </Text>
                    </HStack>

                    {/* Price */}
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="700" color="#6B6B7A">
                        💰 Potential Price
                      </Text>
                      <Text fontSize="14px" fontWeight="800" color="#1A1A2E">
                        {rec.potentialPrice.toLocaleString()} RWF
                      </Text>
                    </HStack>

                    {/* Reason */}
                    <Box bg="#E0F2F1" borderRadius="8px" p={3} border="1px solid #0F7173">
                      <Text fontSize="12px" color="#0D5A5C" fontWeight="600">
                        ✨ {rec.reason}
                      </Text>
                    </Box>
                  </VStack>

                  <Button
                    w="full"
                    bg="#0F7173"
                    color="white"
                    _hover={{ bg: "#0D5A5C" }}
                    borderRadius="full"
                    fontWeight="700"
                    rightIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      setSelectedRecommendation(rec);
                      onOpen();
                    }}
                  >
                    Add This Product
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat bg="white" borderRadius="16px" p={5} border="2px solid #E5E7EB">
            <StatLabel fontSize="12px" fontWeight="700" color="#6B6B7A" textTransform="uppercase">
              🔥 Hottest Category
            </StatLabel>
            <StatNumber fontSize="24px" color="#0F7173">
              {insights.length > 0 ? insights[0].category : "N/A"}
            </StatNumber>
            <StatHelpText color="#6B6B7A">
              {insights.length > 0 ? `${insights[0].demand}/10 demand` : "Loading..."}
            </StatHelpText>
          </Stat>

          <Stat bg="white" borderRadius="16px" p={5} border="2px solid #E5E7EB">
            <StatLabel fontSize="12px" fontWeight="700" color="#6B6B7A" textTransform="uppercase">
              📊 Avg Market Price
            </StatLabel>
            <StatNumber fontSize="24px" color="#0F7173">
              {insights.length > 0
                ? `${Math.round(insights.reduce((a, b) => a + b.avgPrice, 0) / insights.length).toLocaleString()} RWF`
                : "N/A"}
            </StatNumber>
            <StatHelpText color="#6B6B7A">Across all categories</StatHelpText>
          </Stat>

          <Stat bg="white" borderRadius="16px" p={5} border="2px solid #E5E7EB">
            <StatLabel fontSize="12px" fontWeight="700" color="#6B6B7A" textTransform="uppercase">
              🎯 Opportunities
            </StatLabel>
            <StatNumber fontSize="24px" color="#0F7173">
              {recommendations.length}
            </StatNumber>
            <StatHelpText color="#6B6B7A">AI recommendations</StatHelpText>
          </Stat>
        </SimpleGrid>
      </VStack>

      {/* Add Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="rgba(26,26,46,0.6)" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px" bg="white" border="2px solid #0F7173">
          <ModalHeader
            bg="linear-gradient(135deg, #0F7173 0%, #0D5A5C 100%)"
            color="white"
            borderRadius="18px 18px 0 0"
            fontWeight="800"
            fontSize="18px"
            display="flex"
            alignItems="center"
            gap={2}
          >
            ✨ Add Recommended Product
            <ModalCloseButton color="white" />
          </ModalHeader>

          <ModalBody py={6}>
            {selectedRecommendation && (
              <VStack align="stretch" spacing={4}>
                {/* Product Info */}
                <Box bg="#F3F4F6" borderRadius="12px" p={4}>
                  <Text fontSize="16px" fontWeight="800" color="#1A1A2E" mb={2}>
                    {selectedRecommendation.title}
                  </Text>
                  <Text fontSize="13px" color="#6B6B7A" mb={3}>
                    {selectedRecommendation.description}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge bg="#0F7173" color="white" borderRadius="full" fontSize="11px" fontWeight="700">
                      {selectedRecommendation.category}
                    </Badge>
                    <Badge bg="#E0F2F1" color="#0F7173" borderRadius="full" fontSize="11px" fontWeight="700">
                      📈 {selectedRecommendation.estimatedDemand}/10 Demand
                    </Badge>
                    <Badge bg="#FEF3C7" color="#92400E" borderRadius="full" fontSize="11px" fontWeight="700">
                      💰 {selectedRecommendation.potentialPrice.toLocaleString()} RWF
                    </Badge>
                  </HStack>
                </Box>

                {/* Why This Product */}
                <Box bg="#E0F2F1" borderRadius="12px" p={4} border="2px solid #0F7173">
                  <Text fontSize="12px" fontWeight="700" color="#0D5A5C" mb={2} textTransform="uppercase">
                    ✨ Why This Product?
                  </Text>
                  <Text fontSize="13px" color="#0D5A5C" lineHeight="1.6">
                    {selectedRecommendation.reason}
                  </Text>
                </Box>

                {/* Next Steps */}
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#1A1A2E" mb={3} textTransform="uppercase">
                    📋 Next Steps
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={3} p={3} bg="#F3F4F6" borderRadius="8px">
                      <Icon as={HiCheckCircle} boxSize={5} color="#0F7173" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="700" color="#1A1A2E">
                          1. Fill in Product Details
                        </Text>
                        <Text fontSize="11px" color="#6B6B7A">
                          Title, description, price, quantity
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={3} p={3} bg="#F3F4F6" borderRadius="8px">
                      <Icon as={HiCheckCircle} boxSize={5} color="#0F7173" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="700" color="#1A1A2E">
                          2. Set Competitive Price
                        </Text>
                        <Text fontSize="11px" color="#6B6B7A">
                          Suggested: {selectedRecommendation.potentialPrice.toLocaleString()} RWF
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={3} p={3} bg="#F3F4F6" borderRadius="8px">
                      <Icon as={HiCheckCircle} boxSize={5} color="#0F7173" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="700" color="#1A1A2E">
                          3. Add Freshness Note
                        </Text>
                        <Text fontSize="11px" color="#6B6B7A">
                          e.g., "Fresh today", "Just arrived"
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={3} pt={4}>
                  <Button
                    flex={1}
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
                    flex={1}
                    bg="#0F7173"
                    color="white"
                    _hover={{ bg: "#0D5A5C" }}
                    borderRadius="full"
                    fontWeight="700"
                    rightIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      // Navigate to seller dashboard to add product
                      window.location.href = "/seller";
                      onClose();
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
