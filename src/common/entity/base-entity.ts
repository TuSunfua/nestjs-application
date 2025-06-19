import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'; 
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
    @ApiProperty({ description: 'Unique identifier for the entity', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Creation timestamp of the entity',  format: 'date-time', example: '2023-10-01T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp of the entity', format: 'date-time', example: '2023-10-01T12:00:00Z' })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ApiProperty({ description: 'Deletion timestamp of the entity', format: 'date-time', example: '2023-10-01T12:00:00Z', nullable: true })
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}
