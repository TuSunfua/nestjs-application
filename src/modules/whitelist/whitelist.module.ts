import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistService } from './whitelist.service';
import { IpWhitelistController } from './whitelist.controller';
import { IpEntity } from './entity/ip.entity';
import { CacheModule } from '@/modules/cache/cache.module';

@Module({
    imports: [TypeOrmModule.forFeature([IpEntity]), CacheModule],
    controllers: [IpWhitelistController],
    providers: [WhitelistService],
    exports: [WhitelistService],
})
export class WhitelistModule {}
