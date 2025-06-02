import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';
// import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '@/common/dto/page.dto';
// import { FileNotImageException } from '@/exceptions/file-not-image.exception';
// import { ValidatorService } from '@/shared/services/validator.service';
// import { UserRegisterDto } from '../auth/dto/user-register.dto';
import type { UserDto } from '@/modules/user/dtos/user.dto';
import { UserEntity } from '@/modules/user/user.entity';
import { PageOptionsDto } from '@/common/dto/page-options.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        // private validatorService: ValidatorService,
    ) {}

    /**
     * Find single user
     */
    findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
        return this.userRepository.findOneBy(findData);
    }

    findByUsernameOrEmail(options: Partial<{ username: string; email: string }>): Promise<UserEntity | null> {
        const queryBuilder = this.userRepository.createQueryBuilder('user').leftJoinAndSelect<UserEntity, 'user'>('user.role', 'role');

        if (options.email) {
            queryBuilder.orWhere('user.email = :email', {
                email: options.email,
            });
        }

        if (options.username) {
            queryBuilder.orWhere('user.username = :username', {
                username: options.username,
            });
        }

        return queryBuilder.getOne();
    }

    // @Transactional()
    // async createUser(userRegisterDto: UserRegisterDto, file?: File): Promise<UserEntity> {
    //     const user = this.userRepository.create(userRegisterDto);

    //     if (file && !this.validatorService.isImage(file.mimetype)) {
    //         throw new FileNotImageException();
    //     }

    //     if (file) {
    //         user.avatar = '';
    //     }

    //     await this.userRepository.save(user);

    //     return user;
    // }

    async getUsers(pageOptionsDto: PageOptionsDto): Promise<PageDto<UserDto>> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

        return items.toPageDto(pageMetaDto);
    }

    async getUser(userId: Uuid): Promise<UserDto> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        queryBuilder.where('user.id = :userId', { userId });

        const userEntity = await queryBuilder.getOne();

        if (!userEntity) {
            throw new NotFoundException('User not found');
        }

        return userEntity.toDto();
    }
}
