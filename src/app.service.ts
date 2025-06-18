import { Injectable } from '@nestjs/common';
import { CacheService } from '@/modules/cache/cache.service';

@Injectable()
export class AppService {
    constructor(private readonly cacheService: CacheService) {}

    getHello(): string {
        return 'Hello World! NestJS app with Redis and Memory fallback is running.';
    }

    getCacheStatus() {
        return this.cacheService.getStatus();
    }

    async setCache(key: string, value: any, ttl?: number): Promise<void> {
        return this.cacheService.set(key, value, ttl || 1000);
    }

    async getCache(key: string): Promise<any> {
        return this.cacheService.get(key);
    }

    async deleteCache(key: string): Promise<void> {
        return this.cacheService.delete(key);
    }

    async clearCache(): Promise<void> {
        return this.cacheService.clear();
    }
}
