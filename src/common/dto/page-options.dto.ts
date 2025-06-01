import { SortType } from '@/constants/sort-type';
import { EnumFieldOptional, NumberFieldOptional, StringFieldOptional } from '@/decorators/field.decorators';

export class PageOptionsDto {
    @EnumFieldOptional(() => SortType, {
        default: SortType.ASC,
    })
    readonly order!: SortType;

    @NumberFieldOptional({
        minimum: 1,
        default: 1,
        int: true,
    })
    readonly page!: number;

    @NumberFieldOptional({
        minimum: 1,
        maximum: 50,
        default: 10,
        int: true,
    })
    readonly take!: number;

    get skip(): number {
        return (this.page - 1) * this.take;
    }

    @StringFieldOptional()
    readonly q?: string;
}
