
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Home, Users, Wrench, Receipt, BarChart, Menu, LogOut, 
  ChevronLeft, User, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: Array<"admin" | "usuario" | "mecanico">;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "usuario", "mecanico"] },
  { name: "Mecânicos", path: "/mecanicos", icon: Users, roles: ["admin", "usuario"] },
  { name: "Serviços", path: "/servicos", icon: Wrench, roles: ["admin", "usuario", "mecanico"] },
  { name: "Vales", path: "/vales", icon: Receipt, roles: ["admin", "usuario"] },
  { name: "Relatórios", path: "/relatorios", icon: BarChart, roles: ["admin"] },
  { name: "Usuários", path: "/usuarios", icon: Settings, roles: ["admin"] },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Preservar estado do sidebar entre navegações
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem("sidebar_collapsed", String(newCollapsed));
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white shadow-lg transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-semibold">Oficina</h2>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {collapsed ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems
              .filter(item => item.roles.includes(user.perfil))
              .map((item) => (
                <li key={item.path}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors",
                            location.pathname === item.path && "bg-gray-100 text-primary font-medium"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
                          {!collapsed && <span className="ml-3">{item.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
          </ul>
        </nav>

        {/* User profile */}
        <div className="border-t p-4">
          <div className="flex items-center">
            <div className="bg-gray-200 rounded-full p-2">
              <User className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user.nome}</p>
                <p className="text-xs text-gray-500 capitalize">{user.perfil}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleLogout}
            className={cn("mt-4 text-red-500 hover:text-red-600 hover:bg-red-50", collapsed && "w-full")}
          >
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
