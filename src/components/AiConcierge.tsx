import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Icon
} from "@chakra-ui/react";
import { ArrowForwardIcon, CloseIcon } from "@chakra-ui/icons";
import { HiMapPin, HiArrowTopRightOnSquare } from "react-icons/hi2";
import { askConcierge } from "../lib/api";
import type { AiResponse, UserLocation } from "../types";

type AiConciergeProps = {
  location?: UserLocation | null;
  locationReady?: boolean;
};

export function AiConcierge({ location = null, locationReady = false }: AiConciergeProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "🤖 Hi! I'm your Ndangira shopping assistant. Ask me about products, prices, or neighborhoods in Kigali."
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Find me fresh vegetables nearby",
    "Show me affordable restaurants in Kacyiru",
    "Compare the cheapest and closest options"
  ]);
  const [relatedListings, setRelatedListings] = useState<AiResponse["relatedListings"]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleAsk(messageText?: string) {
    const textToSend = messageText || prompt;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setPrompt("");
    setLoading(true);

    try {
      const response = await askConcierge(
        textToSend,
        location?.latitude,
        location?.longitude,
        conversationId
      );

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      setSuggestions(response.suggestions);
      setRelatedListings(response.relatedListings);
      setConversationId(response.conversationId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Could not reach the AI service. Make sure the backend is running and OPENROUTER_API_KEY is set."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAsk();
    }
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={onOpen}
        position="fixed"
        bottom="24px"
        right="24px"
        borderRadius="999px"
        w="60px"
        h="60px"
        bg="#0F7173"
        color="white"
        boxShadow="0 8px 24px rgba(15,113,115,0.3)"
        _hover={{ bg: "#0D5A5C", transform: "scale(1.1)" }}
        transition="all 0.2s"
        zIndex={40}
        fontSize="28px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        🤖
      </Button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="rgba(26,26,46,0.6)" backdropFilter="blur(4px)" />
        <ModalContent
          borderRadius="20px"
          bg="white"
          maxH="90vh"
          display="flex"
          flexDirection="column"
          border="2px solid #0F7173"
          boxShadow="0 20px 60px rgba(15,113,115,0.3)"
        >
          {/* Header */}
          <ModalHeader
            bg="linear-gradient(135deg, #0F7173 0%, #0D5A5C 100%)"
            color="white"
            borderRadius="18px 18px 0 0"
            fontWeight="800"
            fontSize="18px"
            display="flex"
            alignItems="center"
            gap={2}
            py={4}
          >
            🤖 DeepSeek Shopping Assistant
            <ModalCloseButton color="white" />
          </ModalHeader>

          {/* Body */}
          <ModalBody
            display="flex"
            flexDirection="column"
            gap={4}
            py={4}
            overflowY="auto"
            flex={1}
          >
            {/* Location Status */}
            <Box
              bg={locationReady ? "#E0F2F1" : "#FEF3C7"}
              borderRadius="12px"
              p={3}
              border={`2px solid ${locationReady ? "#0F7173" : "#F59E0B"}`}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={HiMapPin} boxSize={5} color={locationReady ? "#0F7173" : "#D97706"} />
              <VStack align="start" spacing={0}>
                <Text fontSize="12px" fontWeight="700" color={locationReady ? "#0F7173" : "#92400E"}>
                  {locationReady ? "📍 LIVE GPS LOCATION" : "📍 USING KIGALI CENTER"}
                </Text>
                <Text fontSize="11px" color={locationReady ? "#0D5A5C" : "#B45309"}>
                  {locationReady
                    ? `${location?.latitude.toFixed(4)}, ${location?.longitude.toFixed(4)}`
                    : "Enable GPS for accurate results"}
                </Text>
              </VStack>
            </Box>

            {/* Messages */}
            <VStack
              align="stretch"
              spacing={3}
              maxH="300px"
              overflowY="auto"
              bg="#F9FAFB"
              borderRadius="12px"
              p={3}
              border="1px solid #E5E7EB"
            >
              {messages.map((message, index) => (
                <Box
                  key={`${message.role}-${index}`}
                  alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
                  maxW="85%"
                >
                  <Box
                    bg={message.role === "user" ? "#0F7173" : "#E0F2F1"}
                    color={message.role === "user" ? "white" : "#1A1A2E"}
                    borderRadius="12px"
                    p={3}
                    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                  >
                    <Text fontSize="13px" lineHeight="1.6">
                      {message.content}
                    </Text>
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box alignSelf="flex-start">
                  <Box bg="#E0F2F1" borderRadius="12px" p={3} display="flex" alignItems="center" gap={2}>
                    <Spinner size="sm" color="#0F7173" />
                    <Text fontSize="13px" color="#0F7173" fontWeight="600">
                      Thinking...
                    </Text>
                  </Box>
                </Box>
              )}
            </VStack>

            {/* Suggestions */}
            {suggestions.length > 0 && !loading && (
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#1A1A2E" mb={2} letterSpacing="0.05em" textTransform="uppercase">
                  💡 Suggested Questions
                </Text>
                <Wrap spacing={2}>
                  {suggestions.map((suggestion) => (
                    <WrapItem key={suggestion}>
                      <Button
                        onClick={() => void handleAsk(suggestion)}
                        size="sm"
                        bg="#F3F4F6"
                        color="#1A1A2E"
                        border="1px solid #E5E7EB"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        _hover={{ bg: "#E5E7EB", borderColor: "#0F7173" }}
                        transition="all 0.2s"
                      >
                        {suggestion}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Related Listings */}
            {relatedListings.length > 0 && (
              <Box>
                <Divider borderColor="#E5E7EB" my={2} />
                <Text fontSize="12px" fontWeight="700" color="#1A1A2E" mb={3} letterSpacing="0.05em" textTransform="uppercase">
                  🛍️ Price & Pickup Comparison
                </Text>
                <VStack align="stretch" spacing={2}>
                  {relatedListings.map((listing) => (
                    <Box
                      key={listing.id}
                      bg="#F9FAFB"
                      borderRadius="12px"
                      p={3}
                      border="2px solid #E5E7EB"
                      _hover={{ borderColor: "#0F7173", boxShadow: "0 4px 12px rgba(15,113,115,0.1)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <HStack justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Text fontWeight="700" fontSize="13px" color="#1A1A2E" noOfLines={1}>
                            {listing.title}
                          </Text>
                          <Text fontSize="11px" color="#6B6B7A" noOfLines={1}>
                            {listing.merchant} • {listing.neighborhood}
                          </Text>
                        </Box>
                        {listing.verified && (
                          <Badge bg="#10B981" color="white" borderRadius="full" fontSize="10px" fontWeight="700">
                            ✓ Verified
                          </Badge>
                        )}
                      </HStack>

                      {/* Price and Distance */}
                      <HStack spacing={2} mb={2} flexWrap="wrap">
                        <Badge bg="#0F7173" color="white" borderRadius="full" fontSize="11px" fontWeight="700">
                          💰 {listing.priceRwf.toLocaleString()} RWF
                        </Badge>
                        <Badge bg="#E0F2F1" color="#0F7173" borderRadius="full" fontSize="11px" fontWeight="700">
                          {listing.unitLabel}
                        </Badge>
                        {listing.distance !== null && (
                          <Badge bg="#FEF3C7" color="#92400E" borderRadius="full" fontSize="11px" fontWeight="700">
                            📍 {listing.distance.toFixed(1)} km
                          </Badge>
                        )}
                      </HStack>

                      {/* Category and Status */}
                      <HStack spacing={2} mb={2} flexWrap="wrap">
                        <Badge bg="#F3F4F6" color="#1A1A2E" borderRadius="full" fontSize="10px">
                          {listing.categoryLabel || listing.category}
                        </Badge>
                        <Badge
                          bg={
                            listing.inventoryStatus === "IN_STOCK"
                              ? "#D1FAE5"
                              : listing.inventoryStatus === "LOW_STOCK"
                              ? "#FEF3C7"
                              : "#DBEAFE"
                          }
                          color={
                            listing.inventoryStatus === "IN_STOCK"
                              ? "#065F46"
                              : listing.inventoryStatus === "LOW_STOCK"
                              ? "#92400E"
                              : "#1E40AF"
                          }
                          borderRadius="full"
                          fontSize="10px"
                          fontWeight="600"
                        >
                          {listing.inventoryStatus.replace(/_/g, " ")}
                        </Badge>
                      </HStack>

                      {/* Freshness Note */}
                      {listing.freshnessNote && (
                        <Text fontSize="11px" color="#0F7173" fontWeight="600" mb={2}>
                          🕐 {listing.freshnessNote}
                        </Text>
                      )}

                      {/* Action Buttons */}
                      <HStack spacing={2}>
                        <Button
                          as="a"
                          href={`https://wa.me/${listing.merchant.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          bg="#0F7173"
                          color="white"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                          flex={1}
                          _hover={{ bg: "#0D5A5C" }}
                          leftIcon={<Text>💬</Text>}
                        >
                          Message
                        </Button>
                        <Button
                          as="a"
                          href={`https://www.google.com/maps/search/?api=1&query=${listing.merchant}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          bg="#1A1A2E"
                          color="white"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                          flex={1}
                          _hover={{ bg: "#0F0F1A" }}
                          leftIcon={<Icon as={HiArrowTopRightOnSquare} boxSize={3} />}
                        >
                          Directions
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </ModalBody>

          {/* Input Area */}
          <Box
            borderTop="2px solid #E5E7EB"
            p={4}
            bg="white"
            borderRadius="0 0 18px 18px"
            display="flex"
            gap={2}
          >
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, prices, neighborhoods..."
              borderRadius="full"
              border="2px solid #1A1A2E"
              _focus={{ borderColor: "#0F7173", borderWidth: "2px" }}
              disabled={loading}
              fontSize="13px"
              fontWeight="500"
            />
            <Button
              onClick={() => void handleAsk()}
              bg="#0F7173"
              color="white"
              _hover={{ bg: "#0D5A5C" }}
              borderRadius="full"
              px={6}
              isLoading={loading}
              isDisabled={!prompt.trim() || loading}
              fontWeight="700"
              rightIcon={<ArrowForwardIcon />}
            >
              Ask
            </Button>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}
