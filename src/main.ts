import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as express from 'express';

import { AppModule } from '@/app.module';
import { appConfig } from '@/config/app.config';
import { ConfigSwagger } from '@/config/swagger.config';
import { GlobalExceptionFilter } from '@/filters/global-exception.filter';

export async function bootstrap(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
        cors: {
            origin: appConfig.corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true,
        },
    });

    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.use(helmet());
    app.setGlobalPrefix(`/${appConfig.apiPrefix}/${appConfig.apiVersion}`);
    app.use(compression());
    if (appConfig.environment.isDevelopment) {
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

    ConfigSwagger(app);

    await app.listen(appConfig.port);
    const url = await app.getUrl();
    // Replace [::1] or [::] (IPv6) with 127.0.0.1 for display
    const displayUrl = url.replace(/\[::1\]|\[::\]/, '127.0.0.1');
    console.info(`Application is running on: ${displayUrl}`);
    console.info(`API documentation available at: ${displayUrl}${appConfig.apiPrefix}/${appConfig.apiVersion}/docs`);

    return app;
}

bootstrap().catch((err) => {
    console.error('Error during application bootstrap:', err);
    process.exit(1);
});
