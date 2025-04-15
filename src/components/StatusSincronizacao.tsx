
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { countPendingOperations } from "@/services/offlineStorage";
import { synchronizeData } from "@/services/syncService";
import { toast } from "sonner";
import { CloudOff, CloudUpload, RefreshCw, Clock, CheckCircle } from "lucide-react";

export const StatusSincronizacao = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Carregar a data da última sincronização do localStorage
  useEffect(() => {
    const storedLastSync = localStorage.getItem("lastSync");
    if (storedLastSync) {
      setLastSync(new Date(storedLastSync));
    }
  }, []);

  // Verificar operações pendentes
  const checkPendingOperations = async () => {
    try {
      const count = await countPendingOperations();
      setPendingCount(count);
    } catch (error) {
      console.error("Erro ao verificar operações pendentes:", error);
    }
  };

  // Sincronizar dados
  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Você está offline. Não é possível sincronizar agora.");
      return;
    }

    try {
      setIsSyncing(true);
      const result = await synchronizeData();
      
      if (result.success) {
        toast.success(`Sincronização concluída! ${result.processed} alterações enviadas.`);
        
        // Salvar data da última sincronização
        const now = new Date();
        localStorage.setItem("lastSync", now.toISOString());
        setLastSync(now);
      } else if (result.processed > 0) {
        toast.warning(`Sincronização parcial: ${result.failed} alterações não sincronizadas.`);
        
        // Mesmo sendo parcial, salvamos a data
        const now = new Date();
        localStorage.setItem("lastSync", now.toISOString());
        setLastSync(now);
      } else {
        toast.error("Falha na sincronização. Tente novamente mais tarde.");
      }
      
      checkPendingOperations();
    } catch (error) {
      toast.error("Erro ao sincronizar. Tente novamente mais tarde.");
      console.error("Erro na sincronização:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Configurar monitor de status online
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    
    // Verificar pendências iniciais
    checkPendingOperations();
    
    // Verificar periodicamente
    const interval = setInterval(checkPendingOperations, 10000);
    
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Formatar a data da última sincronização
  const formatLastSync = () => {
    if (!lastSync) return "Nunca sincronizado";
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <CloudOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Status: Offline</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Mudanças Pendentes</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Tudo Sincronizado</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isOnline 
            ? "Conectado ao servidor" 
            : "Trabalhando no modo offline. As alterações serão sincronizadas quando a conexão for restabelecida."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última sincronização: {formatLastSync()}</span>
            </div>
            
            {pendingCount > 0 && (
              <span className="font-semibold">
                {pendingCount} {pendingCount === 1 ? "alteração pendente" : "alterações pendentes"}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleSync} 
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {pendingCount > 0 ? `Sincronizar Agora (${pendingCount})` : "Verificar Novamente"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
