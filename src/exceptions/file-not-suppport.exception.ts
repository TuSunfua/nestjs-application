import { HttpException, HttpStatus } from '@nestjs/common';

export class FileNotSupportException extends HttpException {
    constructor(message: string = 'File type not supported') {
        super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
}
