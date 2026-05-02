import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationIcon } from "./NotificationIcon";

const roleBadgeColor: Record<string, string> = {
  ADMIN: "red",
  SELLER: "orange",
  CUSTOMER: "green"
};

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.100" py={3}>
      <Container maxW="7xl">
        <HStack justify="space-between">
          <Link to="/">
            <Text fontWeight="800" fontSize="xl" color="brand.500">
              Ndangira
            </Text>
          </Link>

          <HStack spacing={3}>
            {user ? (
              <>
                <NotificationIcon />
                <Menu>
                  <MenuButton as={Button} variant="ghost" p={1}>
                    <HStack spacing={2}>
                      <Avatar size="sm" name={user.name} />
                      <Box display={{ base: "none", md: "block" }} textAlign="left">
                        <Text fontSize="sm" fontWeight="700" lineHeight="1.2">
                          {user.name}
                        </Text>
                        <Badge fontSize="xs" colorScheme={roleBadgeColor[user.role]} borderRadius="full">
                          {user.role.toLowerCase()}
                        </Badge>
                      </Box>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {user.role === "ADMIN" && (
                      <MenuItem onClick={() => navigate("/admin")}>Admin Dashboard</MenuItem>
                    )}
                    {user.role === "SELLER" && (
                      <MenuItem onClick={() => navigate("/seller")}>Seller Dashboard</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout} color="red.500">
                      Sign out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button as={Link} to="/register" size="sm" bg="brand.500" color="white" _hover={{ bg: "brand.600" }}>
                  Sign up
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
