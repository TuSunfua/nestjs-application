import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginationDto } from '@/common/dto/pagination.dto';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) =>
    applyDecorators(
        ApiExtraModels(PaginationDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginationDto) },
                    {
                        properties: {
                            items: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
