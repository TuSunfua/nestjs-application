import { Controller, Get, HttpCode, HttpStatus, Query, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { ApiPageResponse } from '@/decorators/api-page-response.decorator';
import { Auth, UUIDParam } from '@/decorators/http.decorators';
import { User } from '@/decorators/user.decorator';
import { PermissionType } from '@/constants/permission-type';
import { UserDto } from '@/modules/user/dtos/user.dto';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('admin')
    @Auth([PermissionType.ADMIN_READ])
    @HttpCode(HttpStatus.OK)
    async admin(@User() user: UserEntity) {
        return {
            user,
        };
    }

    @Get()
    @Auth([PermissionType.USER_READ])
    @HttpCode(HttpStatus.OK)
    @ApiPageResponse({
        description: 'Get users list',
        type: PageDto,
    })
    getUsers(
        @Query(new ValidationPipe({ transform: true }))
        pageOptionsDto: PageOptionsDto,
    ): Promise<PageDto<UserDto>> {
        return this.userService.getUsers(pageOptionsDto);
    }

    @Get(':id')
    @Auth([PermissionType.USER_READ])
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get users list',
        type: UserDto,
    })
    getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
        return this.userService.getUser(userId);
    }
}
