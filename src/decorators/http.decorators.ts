import type { PipeTransform } from '@nestjs/common';
import { applyDecorators, Param, ParseUUIDPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Type } from '@nestjs/common/interfaces';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { AuthInterceptor } from '@/interceptors/auth.interceptor';
import { PublicRoute } from '@/decorators/public-route.decorator';
import { Permissions } from '@/decorators/permissions.decorator';
import { PermissionType } from '@/constants/permission-type';

export function Auth(permissions: PermissionType[] = [], options?: Partial<{ public: boolean }>): MethodDecorator {
    const isPublicRoute = options?.public;

    return applyDecorators(
        Permissions(permissions),
        UseGuards(AuthGuard({ public: isPublicRoute }), PermissionsGuard),
        ApiBearerAuth(),
        UseInterceptors(AuthInterceptor),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
        PublicRoute(isPublicRoute),
    );
}

export function UUIDParam(property: string, ...pipes: Array<Type<PipeTransform> | PipeTransform>): ParameterDecorator {
    return Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes);
}
