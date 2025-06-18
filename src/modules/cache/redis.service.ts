import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { ICacheService } from '@/modules/cache/interfaces/cache.interface';

@Injectable()
export class RedisService implements ICacheService, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private redis: Redis;
    private isConnected = false;

    constructor(private readonly configService: ConfigService) {}

    async onModuleDestroy() {
        await this.disconnect();
    }

    async connect(): Promise<boolean> {
        try {
            const redisUrl = this.configService.get<string>('REDIS_URL');
            const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
            const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
            const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
            const redisDb = this.configService.get<number>('REDIS_DB', 0);

            if (redisUrl) {
                this.redis = new Redis(redisUrl, {
                    retryStrategy: () => null,
                    reconnectOnError: () => false,
                });
            } else {
                this.redis = new Redis({
                    port: redisPort,
                    host: redisHost,
                    password: redisPassword,
                    db: redisDb,
                    retryStrategy: () => null,
                    reconnectOnError: () => false,
                });
            }

            await new Promise<void>((resolve, reject) => {
                this.redis.once('connect', () => {
                    this.logger.log('Connected to Redis');
                    this.isConnected = true;
                    resolve();
                });
                this.redis.once('error', (err) => {
                    this.logger.error(`Redis connection error: ${err.message}`);
                    this.isConnected = false;
                    reject(err);
                });
            });

            // Test the connection
            await this.redis.ping();

            return true;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    private async disconnect() {
        if (this.redis) {
            await this.redis.quit();
            this.isConnected = false;
        }
    }

    async get(key: string): Promise<any> {
        if (!this.isConnected) {
            throw new Error('Redis is not connected');
        }

        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error(`Redis get error for key ${key}: ${error.message}`);
            throw error;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Redis is not connected');
        }

        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.redis.setex(key, ttl, serializedValue);
            } else {
                await this.redis.set(key, serializedValue);
            }
        } catch (error) {
            this.logger.error(`Redis set error for key ${key}: ${error.message}`);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Redis is not connected');
        }

        try {
            await this.redis.del(key);
        } catch (error) {
            this.logger.error(`Redis delete error for key ${key}: ${error.message}`);
            throw error;
        }
    }

    async clear(): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Redis is not connected');
        }

        try {
            await this.redis.flushdb();
        } catch (error) {
            this.logger.error(`Redis clear error: ${error.message}`);
            throw error;
        }
    }

    getStatus() {
        return {
            type: 'Redis',
            connected: this.isConnected,
            details: {
                host: this.configService.get<string>('REDIS_HOST', 'localhost'),
                port: this.configService.get<number>('REDIS_PORT', 6379),
                db: this.configService.get<number>('REDIS_DB', 0),
            },
        };
    }
}
