import { Controller, Get, Post, Delete, Put, Body, Param, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { WhitelistService } from '@/modules/whitelist/whitelist.service';
import { CreateIpDto, UpdateIpDto } from '@/modules/whitelist/dto/ip.dto';
import { ApiPaginatedResponse } from '@/decorators/api-paginated-response.decorator';
import { IpEntity } from '@/modules/whitelist/entity/ip.entity';

@ApiTags('IP Whitelist')
@Controller('ip-whitelist')
export class IpWhitelistController {
    constructor(private readonly service: WhitelistService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách IP whitelist' })
    @ApiPaginatedResponse(IpEntity)
    findAll() {
        return this.service.findAll();
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Thêm IP vào whitelist' })
    @ApiResponse({ status: 201, description: 'Đã thêm IP vào whitelist' })
    add(@Body() dto: CreateIpDto) {
        return this.service.addToWhitelist(dto.name, dto.ip);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Cập nhật IP trong whitelist' })
    @ApiResponse({ status: 200, description: 'Đã cập nhật IP' })
    update(@Param('id', ParseIntPipe) id: string, @Body() dto: UpdateIpDto) {
        return this.service.updateWhitelistEntry(id, dto.name, dto.ip);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa IP khỏi whitelist' })
    @ApiResponse({ status: 200, description: 'Đã xóa IP' })
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.service.removeFromWhitelist(id);
    }
}
