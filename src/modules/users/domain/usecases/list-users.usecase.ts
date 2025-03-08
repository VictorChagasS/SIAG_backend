import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user-repository.interface';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    // Aqui você implementaria a lógica para buscar todos os usuários
    // Como não temos esse método no repositório, vamos simular retornando um array vazio
    // Em uma implementação real, você adicionaria um método findAll() ao repositório
    return [];
  }
}
