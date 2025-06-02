import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { PermissionType } from '@/constants/permission-type';
import type { UserEntity } from '../modules/user/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.get<PermissionType[]>('permissions', context.getHandler());

        if (!requiredPermissions?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ user: UserEntity }>();
        const user = request.user;

        const userPermissionNames = user.role.permissions.map((p) => p);

        return requiredPermissions.every((perm) => userPermissionNames.includes(perm));
    }
}
