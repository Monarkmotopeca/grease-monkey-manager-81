
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Shield, KeyRound } from "lucide-react";

export const LockScreen = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, verifyPassword } = useAuth();

  // Quando o sistema é bloqueado
  const handleLock = useCallback((event: CustomEvent<{userId: string}>) => {
    setUserId(event.detail.userId);
    setIsLocked(true);
    setPassword("");
  }, []);

  // Tenta desbloquear o sistema
  const handleUnlock = async () => {
    if (!userId || !password) return;
    
    setIsLoading(true);
    
    try {
      const isValid = await verifyPassword(userId, password);
      
      if (isValid) {
        setIsLocked(false);
        // Dispara evento de desbloqueio bem-sucedido
        document.dispatchEvent(new CustomEvent('system-unlock', { detail: { success: true } }));
      } else {
        toast.error("Senha incorreta. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao desbloquear:", error);
      toast.error("Erro ao verificar a senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar listeners para eventos de bloqueio
  useEffect(() => {
    document.addEventListener('system-lock' as any, handleLock as EventListener);
    
    return () => {
      document.removeEventListener('system-lock' as any, handleLock as EventListener);
    };
  }, [handleLock]);

  // Lidar com tecla Enter para desbloquear
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Sistema Bloqueado</CardTitle>
          <CardDescription>
            O sistema foi bloqueado por inatividade. Por favor, digite sua senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">
                  Digite a senha de administrador para desbloquear
                </span>
              </div>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUnlock}
              disabled={isLoading}
            >
              {isLoading ? (
                <>Verificando...</>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Desbloquear
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
