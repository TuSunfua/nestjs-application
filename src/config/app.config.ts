import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

const appName = process.env.APP_NAME || 'NestJS Application';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').filter(Boolean) : '*';

const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

const environment = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
};

export const appConfig = {
    appName,
    port,
    corsOrigins,
    apiPrefix,
    apiVersion,
    environment,
};
