import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Radio,
  RadioGroup,
  Text,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SELLER" | "CUSTOMER">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = (await res.json()) as { 
        token?: string; 
        user?: AuthUser; 
        message?: string;
        errors?: Array<{ path: string[]; message: string }>;
      };
      if (!res.ok) {
        // Handle Zod validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(", ");
          setError(errorMessages);
        } else {
          setError(data.message ?? "Registration failed.");
        }
        return;
      }
      login(data.token!, data.user!);
      if (data.user!.role === "SELLER") navigate("/seller");
      else navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="sm" py={16}>
      <Box bg="white" borderRadius="32px" p={8} boxShadow="0 16px 50px rgba(23,23,23,0.08)" border="1px solid rgba(23,23,23,0.06)">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" fontWeight="800">Create account</Heading>

          {error && (
            <Alert status="error" borderRadius="16px">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Full name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  borderRadius="full"
                  h="48px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  borderRadius="full"
                  h="48px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  borderRadius="full"
                  h="48px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>I want to</FormLabel>
                <RadioGroup value={role} onChange={(v) => setRole(v as "SELLER" | "CUSTOMER")}>
                  <HStack spacing={6}>
                    <Radio value="CUSTOMER" colorScheme="orange">
                      Browse &amp; buy
                    </Radio>
                    <Radio value="SELLER" colorScheme="orange">
                      Sell products / services
                    </Radio>
                  </HStack>
                </RadioGroup>
                {role === "SELLER" && (
                  <FormHelperText color="orange.600">
                    Your account will need admin approval before you can create listings.
                  </FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                borderRadius="full"
                h="48px"
                isLoading={loading}
                loadingText="Creating account…"
                mt={2}
              >
                Create account
              </Button>
            </VStack>
          </form>

          <Text fontSize="sm" textAlign="center" color="ink.700">
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="brand.500" fontWeight="700">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
