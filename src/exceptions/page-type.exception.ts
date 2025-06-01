import { BadRequestException } from '@nestjs/common';

export class PageTypeException extends BadRequestException {
    constructor(error?: string) {
        super('Page type is not supported', error);
    }
}
