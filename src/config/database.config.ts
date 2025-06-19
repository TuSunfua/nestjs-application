import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import { SnakeNamingStrategy } from '@/snake-naming.strategy';

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'nestjs-application',
    namingStrategy: new SnakeNamingStrategy(),
    entities: ['dist/src/modules/**/*.entity{.js,.ts}', 'dist/src/modules/**/*.view-entity{.js,.ts}'],
    migrations: ['dist/src/database/migrations/*{.js,.ts}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrationsRun: process.env.NODE_ENV !== 'production',
    migrationsTableName: 'migrations',
};

// For NestJS ConfigModule
export default registerAs('database', () => databaseConfig);
