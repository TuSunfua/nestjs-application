import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('cache/status')
    getCacheStatus() {
        return this.appService.getCacheStatus();
    }

    @Post('cache/:key')
    async setCache(@Param('key') key: string, @Body('value') value: any, @Query('ttl') ttl?: string) {
        const ttlSeconds = ttl ? parseInt(ttl, 10) : undefined;
        await this.appService.setCache(key, value, ttlSeconds);
        return { message: 'Cache set successfully', key };
    }

    @Get('cache/:key')
    async getCache(@Param('key') key: string) {
        const value = await this.appService.getCache(key);
        return { key, value, found: value !== null };
    }

    @Delete('cache/:key')
    async deleteCache(@Param('key') key: string) {
        await this.appService.deleteCache(key);
        return { message: 'Cache deleted successfully', key };
    }

    @Delete('cache')
    async clearCache() {
        await this.appService.clearCache();
        return { message: 'Cache cleared successfully' };
    }
}
