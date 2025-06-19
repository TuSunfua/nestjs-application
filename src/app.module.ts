import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheModule } from '@/modules/cache/cache.module';
import { WhitelistModule } from '@/modules/whitelist/whitelist.module';
import databaseConfig from '@/config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ...config.get('database'),
            }),
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        ttl: config.get<number>('THROTTLE_TTL', 60),
                        limit: config.get<number>('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
        }),
        CacheModule,
        WhitelistModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
