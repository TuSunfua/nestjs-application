import { AbstractDto } from '@/common/dto/abstract.dto';
import { PermissionType } from '@/constants/permission-type';
import { BooleanFieldOptional, EnumFieldOptional, StringFieldOptional } from '@/decorators/field.decorators';
import { RoleEntity } from '@/modules/role/role.entity';

export type RoleDtoOptions = Partial<{ isActive: boolean }>;

export class RoleDto extends AbstractDto {
    @StringFieldOptional()
    name?: string;

    @EnumFieldOptional(() => PermissionType, {
        isArray: true,
    })
    permissions?: PermissionType[];

    @StringFieldOptional({ nullable: true })
    description?: string | null;

    @BooleanFieldOptional()
    isActive?: boolean;

    constructor(role: RoleEntity, options?: RoleDtoOptions) {
        super(role);
        this.name = role.name;
        this.description = role.description;
        this.permissions = role.permissions;
        this.isActive = options?.isActive ?? role.isActive;
    }
}
