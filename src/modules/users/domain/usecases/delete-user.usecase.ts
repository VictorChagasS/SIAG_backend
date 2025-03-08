import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../users.providers';
import { IUserRepository } from '../repositories/user-repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.userRepository.delete(id);
  }
}
