import { useState } from "react";
import {
  Box,
  Button,
  InputGroup,
  InputRightAddon,
  Stack,
  Input,
  Text,
  VStack
} from "@chakra-ui/react";
import { askConcierge } from "../lib/api";

export function AiConcierge() {
  const [prompt, setPrompt] = useState("Find me a quick dinner option near Kacyiru under 15000 RWF.");
  const [reply, setReply] = useState(
    "Ask me for the fastest pickup, a cheaper alternative, or the best neighborhoods for what you need."
  );
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    try {
      const nextReply = await askConcierge(prompt);
      setReply(nextReply);
    } catch {
      setReply("Could not reach the AI service. Make sure the backend is running and OPENROUTER_API_KEY is set.");
    } finally {
      setLoading(false);
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
          DeepSeek-powered neighborhood guidance
        </Text>
        <Text color="whiteAlpha.800">
          Turn a messy shopping need into a practical next stop, with nearby alternatives and pickup logic.
        </Text>
        <Stack direction={{ base: "column", md: "row" }}>
          <InputGroup>
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask about a product, budget, or neighborhood"
              bg="whiteAlpha.100"
              borderColor="whiteAlpha.200"
              _placeholder={{ color: "whiteAlpha.600" }}
            />
            <InputRightAddon
              bg="transparent"
              borderColor="whiteAlpha.200"
              p={0}
              display={{ base: "none", md: "flex" }}
            >
              <Button
                onClick={handleAsk}
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                borderLeftRadius={0}
                isLoading={loading}
                loadingText="Asking..."
                h="full"
                px={6}
              >
                Ask concierge
              </Button>
            </InputRightAddon>
          </InputGroup>
          <Button
            display={{ base: "flex", md: "none" }}
            onClick={handleAsk}
            bg="brand.500"
            color="white"
            _hover={{ bg: "brand.600" }}
            isLoading={loading}
            loadingText="Asking..."
            w="full"
          >
            Ask concierge
          </Button>
        </Stack>
        <Box bg="whiteAlpha.100" borderRadius="24px" p={5}>
          <Text color="whiteAlpha.900" lineHeight="1.8">
            {reply}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
