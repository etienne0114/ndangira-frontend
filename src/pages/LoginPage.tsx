import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  HStack
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TT = {
  white: "#FFFFFF",
  black: "#1A1A2E",
  teal: "#0F7173",
  gray: "#6B6B7A",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB"
};

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
    <Flex minH="100vh" bg={TT.lightGray} align="center" justify="center" py={8} px={4}>
      <Box 
        w="full" 
        maxW="520px" 
        bg={TT.white} 
        borderRadius="28px" 
        p={{ base: 6, md: 10 }} 
        boxShadow="0 20px 60px rgba(26,26,46,0.12)"
        border={`2px solid ${TT.borderGray}`}
      >
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="start">
            <Heading 
              size="2xl" 
              fontWeight="800" 
              color={TT.black}
              fontSize={{ base: "28px", md: "36px" }}
            >
              Welcome back
            </Heading>
            <Text fontSize="16px" color={TT.gray} fontWeight="500">
              Sign in to your Ndangira account to continue
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Alert 
              status="error" 
              borderRadius="16px" 
              bg="#FEE2E2" 
              borderLeft="4px solid #DC2626"
            >
              <AlertIcon color="#DC2626" />
              <AlertDescription color="#991B1B" fontSize="14px">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={6} align="stretch">
              {/* Email Field */}
              <FormControl isRequired>
                <FormLabel 
                  fontWeight="700" 
                  color={TT.black}
                  fontSize="15px"
                  mb={3}
                >
                  Email address
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  borderRadius="12px"
                  h="56px"
                  border={`2px solid ${TT.borderGray}`}
                  fontSize="15px"
                  _focus={{ 
                    borderColor: TT.teal, 
                    boxShadow: `0 0 0 3px rgba(15, 113, 115, 0.1)`,
                    outline: "none"
                  }}
                  _placeholder={{ color: TT.gray }}
                  transition="all 0.2s"
                />
              </FormControl>

              {/* Password Field */}
              <FormControl isRequired>
                <FormLabel 
                  fontWeight="700" 
                  color={TT.black}
                  fontSize="15px"
                  mb={3}
                >
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  borderRadius="12px"
                  h="56px"
                  border={`2px solid ${TT.borderGray}`}
                  fontSize="15px"
                  _focus={{ 
                    borderColor: TT.teal, 
                    boxShadow: `0 0 0 3px rgba(15, 113, 115, 0.1)`,
                    outline: "none"
                  }}
                  _placeholder={{ color: TT.gray }}
                  transition="all 0.2s"
                />
              </FormControl>

              {/* Sign In Button */}
              <Button
                type="submit"
                bg={TT.teal}
                color={TT.white}
                _hover={{ bg: "#0D5A5C" }}
                borderRadius="12px"
                h="56px"
                fontSize="16px"
                fontWeight="700"
                isLoading={loading}
                loadingText="Signing in…"
                mt={4}
                transition="all 0.2s"
                _active={{ transform: "scale(0.98)" }}
              >
                Sign in
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <Box h="1px" bg={TT.borderGray} />

          {/* Sign Up Link */}
          <VStack spacing={3} align="center">
            <Text fontSize="15px" color={TT.gray}>
              Don't have an account?{" "}
              <Link 
                as={RouterLink} 
                to="/register" 
                color={TT.teal} 
                fontWeight="700"
                _hover={{ textDecoration: "underline" }}
              >
                Create one
              </Link>
            </Text>
            <Text fontSize="13px" color={TT.gray} textAlign="center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
}
