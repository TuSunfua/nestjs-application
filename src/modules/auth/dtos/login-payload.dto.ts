import { ClassField } from '@/decorators/field.decorators';
import { UserDto } from '@/modules/user/dtos/user.dto';
import { TokenPayloadDto } from '@/modules/auth/dtos/token-payload.dto';

export class LoginPayloadDto {
    @ClassField(() => UserDto)
    user: UserDto;

    @ClassField(() => TokenPayloadDto)
    accessToken: TokenPayloadDto;

    constructor(user: UserDto, token: TokenPayloadDto) {
        this.user = user;
        this.accessToken = token;
    }
}
