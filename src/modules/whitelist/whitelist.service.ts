import { NotFoundException } from '@nestjs/common/exceptions';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ipaddr from 'ipaddr.js';

import { IpEntity } from '@/modules/whitelist/entity/ip.entity';
import { CacheService } from '@/modules/cache/cache.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class WhitelistService implements OnModuleInit {
    private readonly CACHE_KEY = 'whitelist';

    constructor(
        @InjectRepository(IpEntity)
        private readonly ipRepository: Repository<IpEntity>,
        private readonly cacheService: CacheService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.refreshCache();
    }

    private async refreshCache(): Promise<void> {
        await this.cacheService.set(this.CACHE_KEY, await this.ipRepository.find());
    }

    async getWhitelist(): Promise<IpEntity[]> {
        const cached = await this.cacheService.get(this.CACHE_KEY);
        if (cached) return cached;
        const whitelist = await this.ipRepository.find();
        await this.cacheService.set(this.CACHE_KEY, whitelist);
        return whitelist;
    }

    async isIpAllowed(ipAddress: string): Promise<boolean> {
        const whitelist = await this.getWhitelist();
        try {
            const parsedIp = ipaddr.parse(ipAddress).toNormalizedString();
            for (const entry of whitelist) {
                const entryIp = entry.ip;
                if (ipaddr.isValid(entryIp)) {
                    if (parsedIp === ipaddr.parse(entryIp).toNormalizedString()) {
                        return true;
                    }
                } else if (entryIp.includes('/')) {
                    if (ipaddr.parse(ipAddress).match(ipaddr.parseCIDR(entryIp))) {
                        return true;
                    }
                }
            }
        } catch (err) {
            return false;
        }
        return false;
    }

    async addToWhitelist(name: string, ip: string): Promise<IpEntity> {
        const newEntry = this.ipRepository.create({ name, ip });
        await this.ipRepository.save(newEntry);
        await this.refreshCache();
        return newEntry;
    }

    async updateWhitelistEntry(id: string, name?: string, ip?: string): Promise<IpEntity> {
        const entry = await this.ipRepository.findOne({ where: { id } });
        if (!entry) throw new NotFoundException(`IP entry with id ${id} not found`);

        if (name) entry.name = name;
        if (ip) entry.ip = ip;

        await this.ipRepository.save(entry);
        await this.refreshCache();
        return entry;
    }

    async removeFromWhitelist(id: string): Promise<void> {
        await this.ipRepository.delete(id);
        await this.refreshCache();
    }

    async findAll(): Promise<PaginationDto<IpEntity>> {
        const whitelist = await this.ipRepository.find();
        await this.cacheService.set(this.CACHE_KEY, whitelist);
        return new PaginationDto<IpEntity>(whitelist, 1, whitelist.length, whitelist.length, whitelist.length);
    }
}
