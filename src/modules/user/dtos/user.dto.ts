import { AbstractDto } from '@/common/dto/abstract.dto';
import { BooleanFieldOptional, EmailFieldOptional, PhoneFieldOptional, StringFieldOptional } from '@/decorators/field.decorators';
import type { UserEntity } from '@/modules/user/user.entity';

export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
    @StringFieldOptional()
    username?: string;

    @StringFieldOptional()
    firstName?: string | null;

    @StringFieldOptional()
    lastName?: string | null;

    @EmailFieldOptional({ nullable: true })
    email?: string | null;

    @PhoneFieldOptional({ nullable: true })
    phone?: string | null;

    @StringFieldOptional({ nullable: true })
    avatar?: string | null;

    @BooleanFieldOptional()
    isActive?: boolean;

    constructor(user: UserEntity, options?: UserDtoOptions) {
        super(user);
        this.username = user.username;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.phone = user.phone;
        this.avatar = user.avatar;
        this.isActive = options?.isActive ?? user.isActive;
    }
}
