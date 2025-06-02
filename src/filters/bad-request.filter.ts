import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, UnprocessableEntityException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import type { ValidationError } from 'class-validator';
import _ from 'lodash';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter implements ExceptionFilter<UnprocessableEntityException> {
    constructor(public reflector: Reflector) {}

    catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode = exception.getStatus();
        const r = exception.getResponse() as { message: ValidationError[] };

        const validationErrors = r.message;
        const errors = this.normalizeValidationErrors(validationErrors);

        response.status(statusCode).json({
            success: false,
            statusCode,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }

    private normalizeValidationErrors(validationErrors: ValidationError[]): Array<{ field: string; messages: string[] }> {
        const result: Array<{ field: string; messages: string[] }> = [];

        for (const error of validationErrors) {
            // Recursively normalize children
            if (error.children && error.children.length > 0) {
                result.push(...this.normalizeValidationErrors(error.children));
                continue;
            }

            const constraints = error.constraints;
            if (!constraints) continue;

            const messages = Object.entries(constraints).map(([key, message]) => message || `error.fields.${_.snakeCase(key)}`);

            result.push({
                field: error.property,
                messages,
            });
        }

        return result;
    }
}
