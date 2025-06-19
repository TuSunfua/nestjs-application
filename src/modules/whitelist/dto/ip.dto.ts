import { IsString, Matches } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const IP_CIDR_REGEX = /^(\d{1,3}\.){3}\d{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

class BaseIpDto {
    @ApiProperty({ example: 'Office Network', description: 'Tên mô tả IP' })
    @IsString()
    name: string;

    @ApiProperty({ example: '192.168.1.0/24', description: 'IP hoặc CIDR' })
    @IsString()
    @Matches(IP_CIDR_REGEX, {
        message: 'ip phải là địa chỉ IP hợp lệ hoặc CIDR (ví dụ: 192.168.1.0/24)',
    })
    ip: string;
}

export class CreateIpDto extends BaseIpDto {}
export class UpdateIpDto extends PartialType(BaseIpDto) {}
