import { Box, Spinner } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactNode;
  roles: UserRole[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
