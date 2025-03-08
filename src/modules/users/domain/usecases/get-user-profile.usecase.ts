import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user-repository.interface';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
