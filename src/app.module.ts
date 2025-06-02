import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

// import { AuthModule } from './modules/auth/auth.module.ts';
// import { PostModule } from './modules/post/post.module.ts';
import { UserModule } from '@/modules/user/user.module';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { SharedModule } from '@/shared/shared.module';

@Module({
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
            },
        }),
        ThrottlerModule.forRootAsync({
            imports: [SharedModule],
            useFactory: (configService: ApiConfigService) => ({
                throttlers: [configService.throttlerConfigs],
            }),
            inject: [ApiConfigService],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [SharedModule],
            useFactory: (configService: ApiConfigService) => configService.postgresConfig,
            inject: [ApiConfigService],
            dataSourceFactory: (options) => {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return Promise.resolve(addTransactionalDataSource(new DataSource(options)));
            },
        }),
        UserModule,
        // AuthModule,
    ],
    providers: [],
})
export class AppModule {}
