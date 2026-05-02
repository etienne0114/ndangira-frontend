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
  WrapItem
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { askConcierge } from "../lib/api";
import type { AiResponse, UserLocation } from "../types";

type AiConciergeProps = {
  location?: UserLocation | null;
  locationReady?: boolean;
};

export function AiConcierge({ location = null, locationReady = false }: AiConciergeProps) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hi! I'm your Ndangira shopping assistant. Ask me about products, prices, or neighborhoods in Kigali."
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
          content: "Could not reach the AI service. Make sure the backend is running and OPENROUTER_API_KEY is set."
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
    <Box
      bg="ink.900"
      color="white"
      borderRadius="32px"
      p={{ base: 6, md: 8 }}
      boxShadow="0 24px 80px rgba(23, 23, 23, 0.18)"
    >
      <VStack align="stretch" spacing={5}>
        <Text fontSize="sm" letterSpacing="0.2em" textTransform="uppercase" color="orange.200">
          AI Concierge
        </Text>
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
          DeepSeek-powered shopping assistant
        </Text>
        <Text color="whiteAlpha.800">
          Ask about products, prices, neighborhoods, or nearby alternatives in Kigali.
        </Text>
        <HStack spacing={3} flexWrap="wrap">
          <Badge borderRadius="full" px={3} py={1} bg={locationReady ? "green.500" : "orange.500"}>
            {locationReady ? "Using your live location" : "Using Kigali center"}
          </Badge>
          <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200">
            Live backend replies
          </Badge>
        </HStack>

        <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" bg="whiteAlpha.50" borderRadius="24px" p={4}>
          {messages.map((message, index) => (
            <Box key={`${message.role}-${index}`} alignSelf={message.role === "user" ? "flex-end" : "flex-start"} maxW="85%">
              <Box bg={message.role === "user" ? "brand.500" : "whiteAlpha.100"} color="white" borderRadius="20px" p={4}>
                <Text lineHeight="1.6">{message.content}</Text>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box alignSelf="flex-start">
              <Box bg="whiteAlpha.100" borderRadius="20px" p={4}>
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text>Thinking...</Text>
                </HStack>
              </Box>
            </Box>
          )}
        </VStack>

        {suggestions.length > 0 && !loading && (
          <Box>
            <Text fontSize="sm" color="whiteAlpha.700" mb={2}>
              Suggested questions:
            </Text>
            <Wrap spacing={2}>
              {suggestions.map((suggestion) => (
                <WrapItem key={suggestion}>
                  <Badge
                    as="button"
                    onClick={() => void handleAsk(suggestion)}
                    bg="whiteAlpha.100"
                    color="white"
                    borderRadius="full"
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    {suggestion}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        {relatedListings.length > 0 && (
          <Box>
            <Divider borderColor="whiteAlpha.200" mb={4} />
            <Text fontSize="sm" color="whiteAlpha.700" mb={3}>
              Price and pickup comparison:
            </Text>
            <VStack align="stretch" spacing={3}>
              {relatedListings.map((listing) => (
                <Box key={listing.id} bg="whiteAlpha.100" borderRadius="20px" p={4}>
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="700">{listing.title}</Text>
                      <Text fontSize="sm" color="whiteAlpha.800">
                        {listing.merchant} - {listing.neighborhood}
                      </Text>
                    </Box>
                    {listing.verified && (
                      <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                        Verified
                      </Badge>
                    )}
                  </HStack>
                  <HStack mt={3} spacing={2} flexWrap="wrap">
                    <Badge borderRadius="full" px={3} py={1} bg="brand.500" color="white">
                      {listing.priceRwf.toLocaleString()} RWF / {listing.unitLabel}
                    </Badge>
                    <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200">
                      {(listing.categoryLabel ?? listing.category).replace(/_/g, " ")}
                    </Badge>
                    <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200">
                      {listing.inventoryStatus.replace(/_/g, " ")}
                    </Badge>
                    {listing.distance !== null && (
                      <Badge borderRadius="full" px={3} py={1} bg="whiteAlpha.200">
                        {listing.distance.toFixed(1)} km away
                      </Badge>
                    )}
                  </HStack>
                  {listing.freshnessNote && (
                    <Text mt={2} fontSize="sm" color="orange.100">
                      {listing.freshnessNote}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <HStack align="stretch" flexDirection={{ base: "column", md: "row" }}>
          <Input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, prices, or neighborhoods..."
            bg="whiteAlpha.100"
            borderColor="whiteAlpha.200"
            _placeholder={{ color: "whiteAlpha.600" }}
            disabled={loading}
          />
          <Button
            onClick={() => void handleAsk()}
            bg="brand.500"
            color="white"
            _hover={{ bg: "brand.600" }}
            px={8}
            rightIcon={<ArrowForwardIcon />}
            isLoading={loading}
            isDisabled={!prompt.trim() || loading}
          >
            Ask
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
