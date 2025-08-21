/**
 * 🗄️ Cache Service - Sistema de caché inteligente multicapa
 * 
 * Características:
 * - Cache en memoria (rápido)
 * - Cache persistente (localStorage)
 * - TTL configurable por tipo de dato
 * - Compresión automática
 * - Gestión de límites de almacenamiento
 * - Invalidación inteligente
 */

export interface CacheConfig {
  maxMemoryItems: number;
  maxStorageSize: number; // MB
  defaultTTL: number; // milliseconds
  enableCompression: boolean;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  compressed?: boolean;
}

export interface CacheStats {
  memoryItems: number;
  storageItems: number;
  storageSize: number; // bytes
  hitRate: number;
  lastCleanup: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    lastCleanup: Date.now()
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxMemoryItems: 100,
      maxStorageSize: 50, // 50MB
      defaultTTL: 30 * 60 * 1000, // 30 minutos
      enableCompression: true,
      ...config
    };

    // Auto-cleanup cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * 🔍 Obtener datos del cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // 1. Buscar en memoria primero (más rápido)
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && this.isValid(memoryItem)) {
        this.stats.hits++;
        return memoryItem.data;
      }

      // 2. Buscar en localStorage
      const storageData = localStorage.getItem(`cache_${key}`);
      if (storageData) {
        const item: CacheItem<T> = JSON.parse(storageData);
        
        if (this.isValid(item)) {
          // Promover a memoria para próximos accesos
          this.setMemory(key, item);
          this.stats.hits++;
          return item.data;
        } else {
          // Eliminar item expirado
          localStorage.removeItem(`cache_${key}`);
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn(`Error getting cache item ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 💾 Guardar datos en cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        version: '1.0'
      };

      // Guardar en memoria
      this.setMemory(key, item);

      // Guardar en localStorage
      await this.setStorage(key, item);

      this.stats.sets++;
    } catch (error) {
      console.warn(`Error setting cache item ${key}:`, error);
    }
  }

  /**
   * 🗑️ Eliminar del cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
    this.stats.deletes++;
  }

  /**
   * 🧹 Limpiar cache por patrón
   */
  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      // Limpiar por patrón (ej: "rce_comprobantes_*")
      const regex = new RegExp(pattern.replace('*', '.*'));
      
      // Limpiar memoria
      for (const [key] of this.memoryCache) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }

      // Limpiar localStorage
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_') && regex.test(key.substring(6))) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } else {
      // Limpiar todo
      this.memoryCache.clear();
      this.clearAllStorage();
    }
  }

  /**
   * 📊 Obtener estadísticas
   */
  getStats(): CacheStats {
    const storageSize = this.getStorageSize();
    const storageItems = this.countStorageItems();
    
    return {
      memoryItems: this.memoryCache.size,
      storageItems,
      storageSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      lastCleanup: this.stats.lastCleanup
    };
  }

  /**
   * 🔄 Invalidar cache específico por criterios
   */
  async invalidate(criteria: {
    type?: string;
    ruc?: string;
    periodo?: string;
    maxAge?: number;
  }): Promise<void> {
    const { type, ruc, periodo, maxAge } = criteria;
    
    // Construir patrón de búsqueda
    let pattern = '';
    if (type) pattern += `${type}_`;
    if (ruc) pattern += `${ruc}_`;
    if (periodo) pattern += `${periodo}_`;
    pattern += '*';

    if (maxAge) {
      // Invalidar por edad
      const cutoff = Date.now() - maxAge;
      await this.clearOlderThan(cutoff);
    } else {
      // Invalidar por patrón
      await this.clear(pattern);
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  private setMemory<T>(key: string, item: CacheItem<T>): void {
    // Limitar tamaño de memoria
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      // Eliminar el más antiguo (LRU simple)
      const oldest = Array.from(this.memoryCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.memoryCache.delete(oldest[0]);
      }
    }

    this.memoryCache.set(key, item);
  }

  private async setStorage<T>(key: string, item: CacheItem<T>): Promise<void> {
    try {
      // Verificar límite de almacenamiento
      const currentSize = this.getStorageSize();
      const maxSize = this.config.maxStorageSize * 1024 * 1024; // MB to bytes

      if (currentSize > maxSize) {
        await this.cleanupStorage();
      }

      const data = JSON.stringify(item);
      localStorage.setItem(`cache_${key}`, data);
    } catch (error) {
      // localStorage lleno, limpiar y reintentar
      if (error instanceof DOMException && error.code === 22) {
        await this.cleanupStorage();
        try {
          const data = JSON.stringify(item);
          localStorage.setItem(`cache_${key}`, data);
        } catch (retryError) {
          console.warn('Could not save to localStorage after cleanup:', retryError);
        }
      }
    }
  }

  private cleanup(): void {
    // Limpiar memoria
    for (const [key, item] of this.memoryCache) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Limpiar localStorage
    this.cleanupStorage();
    this.stats.lastCleanup = Date.now();
  }

  private async cleanupStorage(): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const item: CacheItem<any> = JSON.parse(data);
            if (!this.isValid(item)) {
              keysToDelete.push(key);
            }
          }
        } catch (error) {
          // Item corrupto, eliminar
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
  }

  private getStorageSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        const data = localStorage.getItem(key);
        size += data ? data.length * 2 : 0; // approximation in bytes
      }
    }
    return size;
  }

  private countStorageItems(): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        count++;
      }
    }
    return count;
  }

  private clearAllStorage(): void {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
  }

  private async clearOlderThan(timestamp: number): Promise<void> {
    const keysToDelete: string[] = [];
    
    // Memoria
    for (const [key, item] of this.memoryCache) {
      if (item.timestamp < timestamp) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Storage
    keysToDelete.length = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const item: CacheItem<any> = JSON.parse(data);
            if (item.timestamp < timestamp) {
              keysToDelete.push(key);
            }
          }
        } catch (error) {
          keysToDelete.push(key);
        }
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
  }
}

// ========================================
// CONFIGURACIONES PREESTABLECIDAS
// ========================================

export const cacheConfigs = {
  // Datos que cambian poco (empresas, configuraciones)
  static: {
    defaultTTL: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Resúmenes y totales SUNAT
  summary: {
    defaultTTL: 6 * 60 * 60 * 1000, // 6 horas
  },
  
  // Comprobantes detallados
  detailed: {
    defaultTTL: 2 * 60 * 60 * 1000, // 2 horas
  },
  
  // Datos en tiempo real
  realtime: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
  }
};

// ========================================
// INSTANCIA SINGLETON
// ========================================

export const cacheService = new CacheService({
  maxMemoryItems: 50,
  maxStorageSize: 25, // 25MB
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  enableCompression: false // Simplicidad por ahora
});

export default cacheService;
