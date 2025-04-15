
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  nome: string;
  email: string;
  perfil: "admin" | "usuario" | "mecanico";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Mock de usuários para testar o sistema
const MOCK_USERS = [
  {
    id: "1",
    nome: "Administrador",
    email: "admin@oficina.com",
    password: "admin123",
    perfil: "admin" as const,
  },
  {
    id: "2",
    nome: "Usuário Padrão",
    email: "usuario@oficina.com",
    password: "usuario123",
    perfil: "usuario" as const,
  },
  {
    id: "3",
    nome: "Mecânico",
    email: "mecanico@oficina.com",
    password: "mecanico123",
    perfil: "mecanico" as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar autenticação ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("oficina_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
    
    // Configurar temporizador de inatividade (90 minutos)
    let inactivityTimeout: number;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = window.setTimeout(() => {
        if (user) {
          logout();
          toast.warning("Sessão encerrada por inatividade");
        }
      }, 90 * 60 * 1000); // 90 minutos
    };
    
    // Eventos para resetar o temporizador
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    
    resetTimer();
    
    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
    };
  }, [user]);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("oficina_user", JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("oficina_user");
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
