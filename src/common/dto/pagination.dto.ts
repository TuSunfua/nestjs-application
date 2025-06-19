import { ApiProperty } from '@nestjs/swagger';

export class PaginationOptionsDto {
    @ApiProperty({ type: 'number', example: 1 })
    page: number;

    @ApiProperty({ type: 'number', example: 10 })
    limit: number;

    @ApiProperty({
        type: 'object',
        properties: {
            field: { type: 'string', example: 'createdAt' },
            order: { type: 'string', enum: ['ASC', 'DESC'], example: 'DESC' },
        },
        required: [],
    })
    sort?: {
        field: string;
        order: 'ASC' | 'DESC';
    };

    @ApiProperty({ type: 'string', example: 'search term', required: false })
    search?: string;

    @ApiProperty({ type: 'object', additionalProperties: true, required: [] })
    filter?: Record<string, any>;
}

export class PaginationMeta {
    @ApiProperty() page: number;
    @ApiProperty() itemCount: number;
    @ApiProperty() pageCount: number;
    @ApiProperty() hasPrevPage: boolean;
    @ApiProperty() hasNextPage: boolean;
}

export class PaginationDto<T> {
    @ApiProperty({ isArray: true })
    items: T[];

    @ApiProperty({ type: PaginationMeta })
    pagination: PaginationMeta;

    constructor(items: T[], page: number, itemCount: number, total: number, limit: number) {
        this.items = items;
        this.pagination = {
            page,
            itemCount,
            pageCount: Math.ceil(total / limit),
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(total / limit),
        };
    }
}
