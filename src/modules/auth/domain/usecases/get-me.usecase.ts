import { Injectable, NotFoundException } from '@nestjs/common';

import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

import { IJwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class GetMeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(user: IJwtPayload) {
    const userInfo = await this.userRepository.findById(user.sub);

    if (!userInfo) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        title: 'Usuário não encontrado',
        detail: ['O usuário solicitado não foi encontrado'],
      });
    }

    const { password, ...userRest } = userInfo;

    return userRest;
  }
}
