import { BadRequestException } from '@nestjs/common';

export class FileNotImageException extends BadRequestException {
    constructor(error?: string) {
        super('File is not image', error);
    }
}
