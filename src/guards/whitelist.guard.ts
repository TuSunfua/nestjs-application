import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { WhitelistService } from '@/modules/whitelist/whitelist.service';
import { SKIP_IP_CHECK_KEY } from '@/decorators/skip-ip-check.decorator';

@Injectable()
export class WhitelistGuard implements CanActivate {
    constructor(
        private readonly ipService: WhitelistService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skip = this.reflector.getAllAndOverride<boolean>(SKIP_IP_CHECK_KEY, [
            context.getHandler(), // method level
            context.getClass(), // controller level
        ]);

        if (skip) return true;

        const req: Request = context.switchToHttp().getRequest();
        const ip = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

        const isAllowed = await this.ipService.isIpAllowed(ip);

        if (!isAllowed) {
            throw new ForbiddenException('Your IP is not allowed.');
        }

        return true;
    }
}
