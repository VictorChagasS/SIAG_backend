import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserInfoDto } from '../../presentation/dtos/update-user-info.dto';
import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user-repository.interface';

@Injectable()
export class UpdateUserInfoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: UpdateUserInfoDto): Promise<{ before: User; after: User }> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.usersRepository.update(userId, data);

    return {
      before: user,
      after: updatedUser,
    };
  }
}
