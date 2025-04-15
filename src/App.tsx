
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { setupSyncListener } from "@/services/syncService";
import { LockScreen } from "@/components/LockScreen";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Mecanicos from "./pages/Mecanicos";
import Servicos from "./pages/Servicos";
import Vales from "./pages/Vales";
import Relatorios from "./pages/Relatorios";
import UserManagement from "./pages/UserManagement";
import PrivateRoute from "./components/PrivateRoute";
import { AppLayout } from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  // Configurar o ouvinte de sincronização quando a aplicação iniciar
  useEffect(() => {
    const cleanupListener = setupSyncListener();
    return cleanupListener;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Sonner position="top-right" expand={true} closeButton={true} />
            <LockScreen />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<Navigate to="/dashboard" replace />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/mecanicos" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <Mecanicos />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/servicos" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <Servicos />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/vales" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <Vales />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/relatorios" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <Relatorios />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/usuarios" 
                  element={
                    <PrivateRoute>
                      <AppLayout>
                        <UserManagement />
                      </AppLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
