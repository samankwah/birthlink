// BirthLink Ghana - Advanced Caching Service
// Phase 4: Performance Optimization for Nationwide Scale
// Created: August 12, 2025

import { analyticsService } from './analytics';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

interface CacheConfig {
  maxEntries: number;
  defaultTTL: number;
  enablePersistence: boolean;
  enableCompression: boolean;
  enableAnalytics: boolean;
}

// Advanced caching service for optimal performance at scale
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    writes: 0
  };

  private config: CacheConfig = {
    maxEntries: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true,
    enableCompression: false, // Disabled for simplicity, would use compression lib in production
    enableAnalytics: true
  };

  private persistenceKey = 'birthlink_cache_v1';
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadFromPersistence();
    this.startCleanupInterval();
    this.setupBeforeUnload();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Core caching operations
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: '1.0.0',
      hits: 0
    };

    // Evict oldest entries if at capacity
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.writes++;

    if (this.config.enablePersistence) {
      this.saveToPersistence();
    }

    if (this.config.enableAnalytics) {
      analyticsService.trackEvent('cache_write', {
        cache_key: this.hashKey(key),
        data_size: this.estimateSize(data),
        ttl: entry.ttl
      });
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      if (this.config.enableAnalytics) {
        analyticsService.trackEvent('cache_miss', {
          cache_key: this.hashKey(key)
        });
      }
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      if (this.config.enableAnalytics) {
        analyticsService.trackEvent('cache_expired', {
          cache_key: this.hashKey(key),
          age: Date.now() - entry.timestamp
        });
      }
      return null;
    }

    // Update hit count and move to end (LRU)
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;

    if (this.config.enableAnalytics) {
      analyticsService.trackEvent('cache_hit', {
        cache_key: this.hashKey(key),
        hit_count: entry.hits,
        age: Date.now() - entry.timestamp
      });
    }

    return entry.data;
  }

  // Specialized caching methods for different data types
  cacheRegistration(registrationId: string, registration: any, ttl = 30 * 60 * 1000): void {
    this.set(`registration:${registrationId}`, registration, ttl);
  }

  getCachedRegistration(registrationId: string): any | null {
    return this.get(`registration:${registrationId}`);
  }

  cacheUserProfile(userId: string, profile: any, ttl = 60 * 60 * 1000): void {
    this.set(`user:${userId}`, profile, ttl);
  }

  getCachedUserProfile(userId: string): any | null {
    return this.get(`user:${userId}`);
  }

  cacheRegionalStats(region: string, stats: any, ttl = 10 * 60 * 1000): void {
    this.set(`regional_stats:${region}`, stats, ttl);
  }

  getCachedRegionalStats(region: string): any | null {
    return this.get(`regional_stats:${region}`);
  }

  cacheTranslation(language: string, namespace: string, translations: any, ttl = 24 * 60 * 60 * 1000): void {
    this.set(`translation:${language}:${namespace}`, translations, ttl);
  }

  getCachedTranslation(language: string, namespace: string): any | null {
    return this.get(`translation:${language}:${namespace}`);
  }

  // Batch operations
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  // Cache invalidation
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.config.enablePersistence) {
      this.saveToPersistence();
    }
    return deleted;
  }

  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0 && this.config.enablePersistence) {
      this.saveToPersistence();
    }

    return deletedCount;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, writes: 0 };
    if (this.config.enablePersistence) {
      localStorage.removeItem(this.persistenceKey);
    }
  }

  // Cache warming for critical data
  async warmCache(): Promise<void> {
    try {
      // Pre-load critical data that's likely to be accessed
      const criticalDataSources = [
        { type: 'system_config', ttl: 60 * 60 * 1000 },
        { type: 'region_list', ttl: 24 * 60 * 60 * 1000 },
        { type: 'translations', ttl: 24 * 60 * 60 * 1000 }
      ];

      for (const source of criticalDataSources) {
        // In production, this would fetch actual data
        const mockData = { type: source.type, preloaded: true, timestamp: Date.now() };
        this.set(`warm:${source.type}`, mockData, source.ttl);
      }

      analyticsService.trackEvent('cache_warmed', {
        preloaded_items: criticalDataSources.length
      });

    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  // Memory management
  private evictLRU(): void {
    // Find the least recently used entry (first in map due to our LRU implementation)
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry, now)) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
      
      if (this.config.enableAnalytics) {
        analyticsService.trackEvent('cache_cleanup', {
          expired_entries: expiredCount,
          remaining_entries: this.cache.size
        });
      }
    }
  }

  private isExpired(entry: CacheEntry<any>, now: number = Date.now()): boolean {
    return now - entry.timestamp > entry.ttl;
  }

  // Persistence
  private loadFromPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        data.forEach(([key, entry]: [string, CacheEntry<any>]) => {
          if (!this.isExpired(entry, now)) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }

  private saveToPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      // Handle localStorage quota exceeded
      console.warn('Failed to save cache to persistence:', error);
      // Clear some space and try again
      this.evictLRU();
      try {
        const data = Array.from(this.cache.entries());
        localStorage.setItem(this.persistenceKey, JSON.stringify(data));
      } catch (retryError) {
        console.error('Cache persistence failed after retry:', retryError);
      }
    }
  }

  // Utility methods
  private hashKey(key: string): string {
    // Simple hash for analytics (to avoid storing sensitive keys)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private estimateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    });
  }

  // Statistics and monitoring
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      memoryUsage: this.estimateSize(Array.from(this.cache.entries()))
    };
  }

  getDetailedStats(): any {
    const stats = this.getStats();
    const entryStats = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: this.hashKey(key),
      hits: entry.hits,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      size: this.estimateSize(entry.data)
    }));

    return {
      ...stats,
      totalWrites: this.stats.writes,
      totalEvictions: this.stats.evictions,
      topEntries: entryStats
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 10),
      config: this.config
    };
  }

  // Configuration management
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableAnalytics) {
      analyticsService.trackEvent('cache_config_updated', {
        new_config: newConfig
      });
    }
  }

  // Health check
  healthCheck(): { isHealthy: boolean; issues: string[] } {
    const issues: string[] = [];
    const stats = this.getStats();

    if (stats.totalEntries > this.config.maxEntries * 0.9) {
      issues.push('Cache near capacity limit');
    }

    if (stats.hitRate < 50 && stats.totalHits + stats.totalMisses > 100) {
      issues.push('Cache hit rate below 50%');
    }

    if (stats.memoryUsage > 10 * 1024 * 1024) { // 10MB
      issues.push('High memory usage');
    }

    return {
      isHealthy: issues.length === 0,
      issues
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.config.enablePersistence) {
      this.saveToPersistence();
    }
    
    this.cache.clear();
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Auto-initialize cache warming on app start
if (typeof window !== 'undefined') {
  cacheService.warmCache().catch(console.error);
}