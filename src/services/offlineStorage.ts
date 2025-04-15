
export interface OfflineOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'mecanico' | 'servico' | 'vale';
  data: any;
  timestamp: number;
}

// Nomes dos stores no IndexedDB
const DB_NAME = 'oficinaPro';
const DB_VERSION = 1;
const STORES = {
  MECANICOS: 'mecanicos',
  SERVICOS: 'servicos',
  VALES: 'vales',
  PENDENTES: 'operacoesPendentes'
};

// Inicializa o banco de dados IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Falha ao abrir o banco de dados offline'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Cria os object stores se não existirem
      if (!db.objectStoreNames.contains(STORES.MECANICOS)) {
        db.createObjectStore(STORES.MECANICOS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SERVICOS)) {
        db.createObjectStore(STORES.SERVICOS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.VALES)) {
        db.createObjectStore(STORES.VALES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDENTES)) {
        db.createObjectStore(STORES.PENDENTES, { keyPath: 'id' });
      }
    };
  });
};

// Gera um ID único para operações
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Adiciona uma operação à fila de pendentes
export const queueOperation = async (
  operation: 'create' | 'update' | 'delete',
  entity: 'mecanico' | 'servico' | 'vale',
  data: any
): Promise<string> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const id = generateId();
    const transaction = db.transaction([STORES.PENDENTES], 'readwrite');
    const store = transaction.objectStore(STORES.PENDENTES);
    
    const offlineOp: OfflineOperation = {
      id,
      operation,
      entity,
      data,
      timestamp: Date.now()
    };
    
    const request = store.add(offlineOp);
    
    request.onsuccess = () => {
      resolve(id);
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao adicionar operação offline para ${entity}`));
    };
  });
};

// Salva dados localmente
export const saveLocally = async <T extends { id: string }>(
  store: 'mecanico' | 'servico' | 'vale',
  data: T
): Promise<T> => {
  const storeName = store === 'mecanico' 
    ? STORES.MECANICOS 
    : store === 'servico' 
      ? STORES.SERVICOS 
      : STORES.VALES;
      
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName, STORES.PENDENTES], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    
    // Se não tiver ID, gere um
    if (!data.id) {
      data.id = generateId();
    }
    
    const request = objectStore.put(data);
    
    request.onsuccess = () => {
      // Adiciona à fila de operações pendentes
      queueOperation(data.id ? 'update' : 'create', store, data)
        .then(() => resolve(data))
        .catch(reject);
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao salvar ${store} localmente`));
    };
  });
};

// Recupera todos os itens de um store
export const getAll = async <T>(store: 'mecanico' | 'servico' | 'vale'): Promise<T[]> => {
  const storeName = store === 'mecanico' 
    ? STORES.MECANICOS 
    : store === 'servico' 
      ? STORES.SERVICOS 
      : STORES.VALES;
      
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao recuperar ${store}s do armazenamento local`));
    };
  });
};

// Recupera um item específico pelo ID
export const getById = async <T>(
  store: 'mecanico' | 'servico' | 'vale',
  id: string
): Promise<T | null> => {
  const storeName = store === 'mecanico' 
    ? STORES.MECANICOS 
    : store === 'servico' 
      ? STORES.SERVICOS 
      : STORES.VALES;
      
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao recuperar ${store} com ID ${id}`));
    };
  });
};

// Remove um item do armazenamento local
export const removeLocally = async (
  store: 'mecanico' | 'servico' | 'vale',
  id: string
): Promise<void> => {
  const storeName = store === 'mecanico' 
    ? STORES.MECANICOS 
    : store === 'servico' 
      ? STORES.SERVICOS 
      : STORES.VALES;
      
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName, STORES.PENDENTES], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      // Adiciona à fila de operações pendentes
      queueOperation('delete', store, { id })
        .then(() => resolve())
        .catch(reject);
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao remover ${store} com ID ${id}`));
    };
  });
};

// Conta quantas operações estão pendentes de sincronização
export const countPendingOperations = async (): Promise<number> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDENTES], 'readonly');
    const objectStore = transaction.objectStore(STORES.PENDENTES);
    const countRequest = objectStore.count();
    
    countRequest.onsuccess = () => {
      resolve(countRequest.result);
    };
    
    countRequest.onerror = () => {
      reject(new Error('Falha ao contar operações pendentes'));
    };
  });
};

// Recupera todas as operações pendentes para sincronização
export const getPendingOperations = async (): Promise<OfflineOperation[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDENTES], 'readonly');
    const objectStore = transaction.objectStore(STORES.PENDENTES);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      // Ordena por timestamp para processar na ordem correta
      const operations = request.result as OfflineOperation[];
      operations.sort((a, b) => a.timestamp - b.timestamp);
      resolve(operations);
    };
    
    request.onerror = () => {
      reject(new Error('Falha ao recuperar operações pendentes'));
    };
  });
};

// Remove uma operação pendente após sincronização bem-sucedida
export const removePendingOperation = async (id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDENTES], 'readwrite');
    const objectStore = transaction.objectStore(STORES.PENDENTES);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Falha ao remover operação pendente ${id}`));
    };
  });
};

// Limpa todas as operações pendentes (uso com cuidado)
export const clearPendingOperations = async (): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDENTES], 'readwrite');
    const objectStore = transaction.objectStore(STORES.PENDENTES);
    const request = objectStore.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Falha ao limpar operações pendentes'));
    };
  });
};
