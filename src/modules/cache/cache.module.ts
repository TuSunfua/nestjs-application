import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CacheService } from '@/modules/cache/cache.service';
import { RedisService } from '@/modules/cache/redis.service';
import { MemoryCacheService } from '@/modules/cache/memory-cache.service';

@Module({
    imports: [ConfigModule],
    providers: [CacheService, RedisService, MemoryCacheService],
    exports: [CacheService],
})
export class CacheModule {}
