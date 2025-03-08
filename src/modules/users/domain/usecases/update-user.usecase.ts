import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user-repository.interface';

export interface IUpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, data: IUpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Se estiver atualizando o email, verifica se já existe
    if (data.email && data.email !== user.email) {
      const userWithEmail = await this.userRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new Error('Email já está em uso');
      }
    }

    // Se estiver atualizando a senha, faz o hash
    const updatedData: IUpdateUserDTO = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return this.userRepository.update(id, updatedData);
  }
}
