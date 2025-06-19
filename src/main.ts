import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as express from 'express';

import { AppModule } from '@/app.module';
import { ConfigSwagger } from '@/config/swagger.config';
import { GlobalExceptionFilter } from '@/filters/global-exception.filter';
import { WhitelistGuard } from '@/guards/whitelist.guard';
import { WhitelistService } from '@/modules/whitelist/whitelist.service';

export async function bootstrap(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter());

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 8080);
    const corsOrigins = configService.get<string>('CORS_ORIGINS');
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    const apiVersion = configService.get<string>('API_VERSION', 'v1');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Enable CORS with allowed methods
    app.enableCors({
        origin: corsOrigins ? corsOrigins.split(',').filter(Boolean) : '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.use(helmet());
    app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`, { exclude: [] }); // Set global prefix for API routes
    app.use(compression());
    if (nodeEnv === 'development') {
        app.use(morgan('dev')); // Can change to 'combined' or 'common' for different logging formats
    }
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.enableVersioning();
    app.enableShutdownHooks();

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            transform: true,
            dismissDefaultMessages: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => {
                const messages = errors.map((e) => Object.values(e.constraints || {})).flat();
                return new UnprocessableEntityException(messages);
            },
        }),
    );

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new WhitelistGuard(app.get(WhitelistService), reflector));

    ConfigSwagger(app);

    await app.listen(port);
    const url = await app.getUrl();
    // Replace [::1] or [::] (IPv6) with 127.0.0.1 for display
    const displayUrl = url.replace(/\[::1\]|\[::\]/, '127.0.0.1');
    console.info(`Application is running on: ${displayUrl}`);
    console.info(`API documentation available at: ${displayUrl}/${apiPrefix}/${apiVersion}/docs`);

    return app;
}

bootstrap().catch((err) => {
    console.error('Error during application bootstrap:', err);
    process.exit(1);
});
