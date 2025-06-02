import { Column, Entity, JoinColumn, ManyToOne, VirtualColumn } from 'typeorm';

import { AbstractEntity } from '@/common/abstract.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import { UserDto } from '@/modules/user/dtos/user.dto';
import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { RoleEntity } from '@/modules/role/role.entity';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, PageOptionsDto> {
    @Column({ type: 'varchar', unique: true })
    username: string;

    @Column({ type: 'varchar' })
    firstName: string;

    @Column({ type: 'varchar' })
    lastName: string;

    @Column({ unique: true, nullable: true, type: 'varchar' })
    email: string | null;

    @Column({ nullable: true, type: 'varchar' })
    phone: string | null;

    @Column({ nullable: true, type: 'varchar' })
    password: string | null; // nullable for oauth2 users

    @Column({ nullable: true, type: 'varchar' })
    avatar: string | null;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @VirtualColumn({
        query: (alias) => `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
    })
    fullName: string;

    @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;
}
