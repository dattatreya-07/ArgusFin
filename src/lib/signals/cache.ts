interface CacheEntry<T> {
  data: T;
  status: 'verified' | 'unverified' | 'unavailable';
  expiresAt: number;
}

export class SignalCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMinutes = 60) {
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
  }

  get(key: string): { data: T; status: 'verified' | 'unverified' | 'unavailable' } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return { data: entry.data, status: entry.status };
  }

  set(key: string, data: T, status: 'verified' | 'unverified' | 'unavailable', ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { data, status, expiresAt });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const globalDomainCache = new SignalCache<unknown>(120);
