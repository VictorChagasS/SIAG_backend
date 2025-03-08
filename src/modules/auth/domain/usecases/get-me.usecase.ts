import { Injectable, NotFoundException } from '@nestjs/common';

import { IJwtPayload } from '../types/jwt-payload.type';

import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

@Injectable()
export class GetMeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(user: IJwtPayload) {
    console.log(user.exp, user.iat, user.sub);
    const userInfo = await this.userRepository.findById(user.sub);

    if (!userInfo) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        title: 'Usuário não encontrado',
        detail: ['O usuário solicitado não foi encontrado'],
      });
    }

    return {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      isAdmin: userInfo.isAdmin,
      institutionId: userInfo.institutionId,
      createdAt: userInfo.createdAt,
      updatedAt: userInfo.updatedAt,
    };
  }
}
