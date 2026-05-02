import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
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
          setError(data.message ?? "Login failed.");
        }
        return;
      }
      login(data.token!, data.user!);
      if (data.user!.role === "ADMIN") navigate("/admin");
      else if (data.user!.role === "SELLER") navigate("/seller");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="sm" py={16}>
      <Box bg="white" borderRadius="32px" p={8} boxShadow="0 16px 50px rgba(23,23,23,0.08)" border="1px solid rgba(23,23,23,0.06)">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" fontWeight="800">Sign in</Heading>

          {error && (
            <Alert status="error" borderRadius="16px">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
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
                  placeholder="••••••••"
                  borderRadius="full"
                  h="48px"
                />
              </FormControl>

              <Button
                type="submit"
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                borderRadius="full"
                h="48px"
                isLoading={loading}
                loadingText="Signing in…"
                mt={2}
              >
                Sign in
              </Button>
            </VStack>
          </form>

          <Text fontSize="sm" textAlign="center" color="ink.700">
            No account?{" "}
            <Link as={RouterLink} to="/register" color="brand.500" fontWeight="700">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
