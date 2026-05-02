import { Box } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BuyerHome } from "./pages/BuyerHome";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SellerDashboard } from "./pages/SellerDashboard";
import { SellerMarketAnalysis } from "./pages/SellerMarketAnalysis";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BuyerHome />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <ProtectedRoute roles={["SELLER"]}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/market-analysis"
              element={
                <ProtectedRoute roles={["SELLER"]}>
                  <SellerMarketAnalysis />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </AuthProvider>
    </BrowserRouter>
  );
}
