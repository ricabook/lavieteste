import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import useAuth from "./hooks/useAuth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { user, isAdmin, loading } = useAuth();

  console.log('ProtectedRoute - user:', user?.id, 'isAdmin:', isAdmin, 'loading:', loading, 'requireAdmin:', requireAdmin);

  if (loading) {
    console.log('ProtectedRoute - still loading');
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to /');
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute - admin required but user is not admin, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute - access granted');
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
