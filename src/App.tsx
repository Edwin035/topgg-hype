import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthDialogProvider } from "./contexts/AuthContext";
import { AuthProvider } from "./components/Auth/AuthProvider";

import ScrollToTop from "./components/ScrollToTop";
import AuthDialog from "./components/Auth/AuthDialog";
import AuthRouteListener from "./contexts/AuthRouteListener";

import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import CatalogPage from "./pages/CatalogPage";
import InvoicePage from "./pages/InvoicePage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import BinancePaySuccess from "./pages/BinancePaySuccess";
import PartnerPage from "./pages/PartnerPage";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSales from "./pages/admin/AdminSales";
import AdminAttention from "./pages/admin/AdminAttention";

import { RequireAuth } from "./RequireAuth";
import { RequireAdmin } from "./RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AuthDialogProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <AuthRouteListener />
            <ScrollToTop />
            <AuthDialog />

            <Routes>
              <Route path="/" element={<Index />} />

              <Route path="/catalogo" element={<CatalogPage />} />

              <Route
                path="/producto/:id"
                element={
                  <RequireAuth>
                    <ProductPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/checkout/:id"
                element={
                  <RequireAuth>
                    <CheckoutPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/factura/:id"
                element={
                  <RequireAuth>
                    <InvoicePage />
                  </RequireAuth>
                }
              />

              <Route
                path="/perfil"
                element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                }
              />

              <Route
                path="/cambiar-contrasena"
                element={
                  <RequireAuth>
                    <ChangePasswordPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/historial"
                element={
                  <RequireAuth>
                    <OrderHistoryPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/pago/binance/success"
                element={
                  <RequireAuth>
                    <BinancePaySuccess />
                  </RequireAuth>
                }
              />

              <Route path="/aliados" element={<PartnerPage />} />

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }>
                <Route index element={<AdminOverview />} />
                <Route path="ventas" element={<AdminSales />} />
                <Route path="atencion" element={<AdminAttention />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthDialogProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;