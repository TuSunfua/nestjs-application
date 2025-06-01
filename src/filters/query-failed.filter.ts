import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const constraintErrors = {
    UQ_USER_EMAIL: 'Email already exists',
    UQ_USER_USERNAME: 'Username already exists',
    UQ_USER_PHONE: 'Phone number already exists',
} as const;

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter<QueryFailedError> {
    constructor(public reflector: Reflector) {}

    catch(exception: QueryFailedError & { constraint?: string }, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const constraint = exception.constraint;
        const isConstraintError = constraint && constraint.startsWith('UQ');
        const status = isConstraintError ? HttpStatus.CONFLICT : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = isConstraintError ? (constraintErrors[constraint] ?? 'Database constraint error') : 'Internal server error';

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errors: null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
