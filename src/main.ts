import '@/boilerplate.polyfill';

import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/filters/bad-request.filter';
import { QueryFailedFilter } from '@/filters/query-failed.filter';
import { setupSwagger } from '@/setup-swagger';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { SharedModule } from '@/shared/shared.module';

export async function bootstrap(): Promise<NestExpressApplication> {
    initializeTransactionalContext();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
        cors: {
            origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true,
        },
    });

    const configService = app.select(SharedModule).get(ApiConfigService);

    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.use(helmet());
    app.setGlobalPrefix('/api');
    app.use(compression());
    if (configService.isDevelopment) {
        app.use(morgan('dev')); // Can change to 'combined' or 'common' for different logging formats
    }
    app.enableVersioning();

    const reflector = app.get(Reflector);

    app.useGlobalFilters(new HttpExceptionFilter(reflector), new QueryFailedFilter(reflector));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            transform: true,
            dismissDefaultMessages: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => new UnprocessableEntityException(errors),
        }),
    );

    if (configService.documentationEnabled) {
        setupSwagger(app);
    }

    // Starts listening for shutdown hooks
    if (!configService.isDevelopment) {
        app.enableShutdownHooks();
    }

    const port = configService.appConfig.port;

    await app.listen(port);
    console.info(`Server running on: http://localhost:${port}`);

    return app;
}

bootstrap().catch((err) => {
    console.error('Error during application bootstrap:', err);
    process.exit(1);
});
