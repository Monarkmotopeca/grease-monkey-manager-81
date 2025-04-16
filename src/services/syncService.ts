
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
export const synchronizeData = async (): Promise<{ 
  success: boolean, 
  processed: number, 
  failed: number,
  details?: string[]
}> => {
  // Verifica se há conexão com a internet
  if (!navigator.onLine) {
    return { success: false, processed: 0, failed: 0 };
  }
  
  try {
    // Busca todas as operações pendentes
    const pendingOperations = await getPendingOperations();
    
    if (pendingOperations.length === 0) {
      return { success: true, processed: 0, failed: 0 };
    }
    
    let processed = 0;
    let failed = 0;
    const details: string[] = [];
    
    // Exibe um toast de início
    const syncToast = toast.loading(`Sincronizando ${pendingOperations.length} alterações...`, {
      duration: 0.2 * 1000
    });
    
    // Processa cada operação sequencialmente
    for (const operation of pendingOperations) {
      try {
        const success = await sendToApi(operation);
        
        if (success) {
          // Remove a operação da fila
          await removePendingOperation(operation.id);
          processed++;
          
          // Adiciona detalhes da operação sincronizada
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
          
          // Atualiza o toast com o progresso
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
    
    // Atualiza o toast final
    if (failed === 0) {
      toast.success(`Sincronização concluída! ${processed} alterações enviadas.`, {
        duration: 0.2 * 1000,
        id: syncToast
      });
    } else {
      toast.error(`Sincronização parcial: ${failed} alterações não sincronizadas.`, {
        duration: 0.2 * 1000,
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
      duration: 0.2 * 1000
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
