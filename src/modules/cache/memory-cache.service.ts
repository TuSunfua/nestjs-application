import { Injectable, Logger } from '@nestjs/common';

import { ICacheService } from '@/modules/cache/interfaces/cache.interface';

interface CacheItem {
    value: any;
    expiresAt?: number;
}

@Injectable()
export class MemoryCacheService implements ICacheService {
    private readonly logger = new Logger(MemoryCacheService.name);
    private cache = new Map<string, CacheItem>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up expired items every 15 minutes
        this.cleanupInterval = setInterval(
            () => {
                this.cleanupExpired();
            },
            15 * 60 * 1000,
        );
    }

    onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }

    private cleanupExpired() {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt && item.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }

        for (const key of expiredKeys) {
            this.cache.delete(key);
        }

        if (expiredKeys.length > 0) {
            this.logger.debug(`Cleaned up ${expiredKeys.length} expired cache items`);
        }
    }

    async get(key: string): Promise<any> {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // Check if item has expired
        if (item.expiresAt && item.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const item: CacheItem = { value };

        if (ttl) {
            item.expiresAt = Date.now() + ttl * 1000;
        }

        this.cache.set(key, item);
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    getStatus() {
        const now = Date.now();
        let activeItems = 0;
        let expiredItems = 0;

        for (const item of this.cache.values()) {
            if (item.expiresAt && item.expiresAt <= now) {
                expiredItems++;
            } else {
                activeItems++;
            }
        }

        return {
            type: 'Memory',
            connected: true,
            details: {
                totalItems: this.cache.size,
                activeItems,
                expiredItems,
            },
        };
    }
}
