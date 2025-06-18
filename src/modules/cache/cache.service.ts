import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { RedisService } from '@/modules/cache/redis.service';
import { MemoryCacheService } from '@/modules/cache/memory-cache.service';
import { ICacheService } from '@/modules/cache/interfaces/cache.interface';

@Injectable()
export class CacheService implements ICacheService, OnModuleInit {
    private readonly logger = new Logger(CacheService.name);
    private activeService: ICacheService;

    constructor(
        private readonly redisService: RedisService,
        private readonly memoryCacheService: MemoryCacheService,
    ) {}

    async onModuleInit() {
        const isRedisConnected = await this.redisService.connect();

        if (isRedisConnected) {
            this.activeService = this.redisService;
            this.logger.log('Using Redis as cache service');
        } else {
            this.logger.log('Falling back to memory cache service');
            this.activeService = this.memoryCacheService;
        }
    }

    async get(key: string): Promise<any> {
        try {
            return await this.activeService.get(key);
        } catch (error) {
            this.logger.error(`Cache get error: ${error.message}`);
            if (this.activeService === this.redisService) {
                this.logger.warn('Switching to memory cache due to Redis error');
                this.activeService = this.memoryCacheService;
                return await this.memoryCacheService.get(key);
            }
            throw error;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            await this.activeService.set(key, value, ttl);
        } catch (error) {
            this.logger.error(`Cache set error: ${error.message}`);
            if (this.activeService === this.redisService) {
                this.logger.warn('Switching to memory cache due to Redis error');
                this.activeService = this.memoryCacheService;
                await this.memoryCacheService.set(key, value, ttl);
            } else {
                throw error;
            }
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.activeService.delete(key);
        } catch (error) {
            this.logger.error(`Cache delete error: ${error.message}`);
            if (this.activeService === this.redisService) {
                this.logger.warn('Switching to memory cache due to Redis error');
                this.activeService = this.memoryCacheService;
                await this.memoryCacheService.delete(key);
            } else {
                throw error;
            }
        }
    }

    async clear(): Promise<void> {
        try {
            await this.activeService.clear();
        } catch (error) {
            this.logger.error(`Cache clear error: ${error.message}`);
            if (this.activeService === this.redisService) {
                this.logger.warn('Switching to memory cache due to Redis error');
                this.activeService = this.memoryCacheService;
                await this.memoryCacheService.clear();
            } else {
                throw error;
            }
        }
    }

    getStatus() {
        const activeServiceName = this.activeService === this.redisService ? 'Redis' : 'Memory';
        return {
            activeService: activeServiceName,
            ...this.activeService.getStatus(),
            redisStatus: this.redisService.getStatus(),
            memoryStatus: this.memoryCacheService.getStatus(),
        };
    }
}
