import { toast } from "sonner";
import {
  getPendingOperations,
  removePendingOperation,
  OfflineOperation
} from "./offlineStorage";

// Simula um atraso para a API
const simulateApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Simula requisições para a API
const sendToApi = async (operation: OfflineOperation): Promise<boolean> => {
  // Em uma implementação real, aqui faríamos as chamadas para a API do backend
  await simulateApiDelay(300); // Simula tempo de resposta da API
  
  // Simulação de sucesso (95% das vezes) ou falha (5% das vezes)
  const success = Math.random() > 0.05;
  
  if (!success) {
    console.error(`Falha ao sincronizar: ${operation.entity} - ${operation.operation}`);
  }
  
  return success;
};

// Sincroniza os dados com o servidor
export const synchronizeData = async () => {
  if (!navigator.onLine) {
    return { success: false, processed: 0, failed: 0 };
  }
  
  try {
    const pendingOperations = await getPendingOperations();
    
    if (pendingOperations.length === 0) {
      return { success: true, processed: 0, failed: 0 };
    }
    
    let processed = 0;
    let failed = 0;
    const details: string[] = [];
    
    const syncToast = toast.loading(`Sincronizando ${pendingOperations.length} alterações...`, {
      duration: 200,
      position: "bottom-left"
    });
    
    for (const operation of pendingOperations) {
      try {
        const success = await sendToApi(operation);
        
        if (success) {
          await removePendingOperation(operation.id);
          processed++;
          
          const entityName = operation.entity === 'mecanico' 
            ? 'Mecânico' 
            : operation.entity === 'servico' 
              ? 'Serviço' 
              : 'Vale';
          
          const operationName = operation.operation === 'create' 
            ? 'criado' 
            : operation.operation === 'update' 
              ? 'atualizado' 
              : 'removido';
          
          details.push(`${entityName} ${operationName} com sucesso.`);
          
          toast.loading(`Sincronizando... (${processed}/${pendingOperations.length})`, {
            id: syncToast,
            duration: 0.2 * 1000
          });
        } else {
          failed++;
        }
      } catch (error) {
        console.error("Erro ao sincronizar operação:", error);
        failed++;
      }
    }
    
    if (failed === 0) {
      toast.success(`Sincronização concluída! ${processed} alterações enviadas.`, {
        duration: 200,
        position: "bottom-left",
        id: syncToast
      });
    } else {
      toast.error(`Sincronização parcial: ${failed} alterações não sincronizadas.`, {
        duration: 200,
        position: "bottom-left",
        id: syncToast
      });
    }
    
    return {
      success: failed === 0,
      processed,
      failed,
      details
    };
  } catch (error) {
    console.error("Erro na sincronização:", error);
    toast.error("Erro ao sincronizar dados. Tente novamente mais tarde.", {
      duration: 200,
      position: "bottom-left"
    });
    return { success: false, processed: 0, failed: 0 };
  }
};

// Verifica se há operações pendentes e as processa quando a conexão for restabelecida
export const setupSyncListener = () => {
  const handleOnline = async () => {
    try {
      const pendingOperations = await getPendingOperations();
      
      if (pendingOperations.length > 0) {
        toast.info(`Você está online novamente. Sincronizando ${pendingOperations.length} alterações...`);
        await synchronizeData();
      }
    } catch (error) {
      console.error("Erro ao verificar pendências:", error);
    }
  };
  
  window.addEventListener("online", handleOnline);
  
  // Retorna uma função para limpar o listener quando necessário
  return () => {
    window.removeEventListener("online", handleOnline);
  };
};
