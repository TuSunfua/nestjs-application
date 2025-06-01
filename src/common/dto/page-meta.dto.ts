import { BooleanField, NumberField } from '@/decorators/field.decorators';
import { PageOptionsDto } from '@/common/dto/page-options.dto';

interface IPageMetaDto {
    pageOptionsDto: PageOptionsDto;
    itemCount: number;
}

export class PageMetaDto {
    @NumberField()
    readonly page: number;

    @NumberField()
    readonly take: number;

    @NumberField()
    readonly itemCount: number;

    @NumberField()
    readonly pageCount: number;

    @BooleanField()
    readonly hasPreviousPage: boolean;

    @BooleanField()
    readonly hasNextPage: boolean;

    constructor({ pageOptionsDto, itemCount }: IPageMetaDto) {
        this.page = pageOptionsDto.page;
        this.take = pageOptionsDto.take;
        this.itemCount = itemCount;
        this.pageCount = Math.ceil(this.itemCount / this.take);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }
}
