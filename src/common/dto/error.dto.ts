import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
    @ApiProperty()
    status: number;

    @ApiProperty()
    path: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty()
    message: string;

    @ApiProperty({ type: [String] })
    details: string[];
}
