import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

import { BaseEntity } from '@/common/entity/base-entity';

@Entity('whitelist')
export class IpEntity extends BaseEntity {
    @ApiProperty({ description: 'Name of the IP entry', example: 'Office Network' })
    @Column()
    name: string;

    @ApiProperty({ description: 'IP address or CIDR notation', example: '192.168.1.0/24)' })
    @Column({ unique: true })
    ip: string;
}
