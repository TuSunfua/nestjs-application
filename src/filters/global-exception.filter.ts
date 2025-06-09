import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { ErrorDto } from '@/common/dto/error.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let details: string[] = [];

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object') {
                const responseObject = res as any;
                message = responseObject.message || exception.message;
                if (Array.isArray(responseObject.message)) {
                    details = responseObject.message;
                } else if (responseObject.error) {
                    details = [responseObject.error];
                }
            }
        } else if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Database query failed';
            details = [exception.message];
        } else if (exception instanceof Error) {
            message = exception.message;
            details = [exception.stack || ''];
        } else if (typeof exception === 'object' && exception !== null) {
            const ex = exception as any;
            message = ex.message || 'Unknown error occurred';
            details = [JSON.stringify(ex)];
        }

        const errorResponse: ErrorDto = {
            status,
            path: request.url,
            timestamp: new Date().toISOString(),
            message,
            details,
        };

        response.status(status).json(errorResponse);
    }
}
