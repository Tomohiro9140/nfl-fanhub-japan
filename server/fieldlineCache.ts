/** Small promise-aware TTL cache used by FIELDLINE's high-frequency comparison queries. */
export class ShortLivedPromiseCache<T> {
  private entries = new Map<string, { expiresAt: number; value: Promise<T> }>();

  constructor(private readonly ttlMs: number, private readonly maxEntries: number) {}

  clear() {
    this.entries.clear();
  }

  getOrCreate(key: string, create: () => Promise<T>) {
    const now = Date.now();
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > now) return cached.value;
    const value = create().catch(error => {
      this.entries.delete(key);
      throw error;
    });
    this.entries.set(key, { expiresAt: now + this.ttlMs, value });
    if (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest) this.entries.delete(oldest);
    }
    return value;
  }
}
