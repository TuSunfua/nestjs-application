import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '@/common/abstract.entity';
import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { PermissionType } from '@/constants/permission-type';
import { UseDto } from '@/decorators/use-dto.decorator';
import { RoleDto } from '@/modules/role/dtos/role.dto';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: 'roles' })
@UseDto(RoleDto)
export class RoleEntity extends AbstractEntity<RoleDto, PageOptionsDto> {
    @Column({ type: 'varchar' })
    name: string;

    @Column({
        type: 'enum',
        enum: PermissionType,
        array: true,
        default: [],
    })
    permissions: PermissionType[];

    @Column({ nullable: true, type: 'varchar' })
    description: string | null;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => UserEntity, (user) => user.role, { onDelete: 'RESTRICT' })
    users: UserEntity[];
}
