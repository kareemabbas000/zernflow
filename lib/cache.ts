export class MemoryCache<T> {
  private cache: Map<string, { value: T; expiresAt: number }> = new Map();

  /**
   * Set a value in the cache with a Time-To-Live (TTL)
   * @param key The cache key
   * @param value The value to cache
   * @param ttlSeconds Time to live in seconds
   */
  set(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache. Returns undefined if not found or expired.
   * @param key The cache key
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global instances for specific domains to be used across the app
export const workspaceCache = new MemoryCache<any>();
export const channelCache = new MemoryCache<any>();
export const featureFlagCache = new MemoryCache<any>();
