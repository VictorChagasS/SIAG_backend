import {
  Inject, Injectable, ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user-repository.interface';

export interface ICreateUserDTO {
  name: string;
  email: string;
  password: string;
  institutionId: string;
  isAdmin?: boolean;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: ICreateUserDTO): Promise<User> {
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists) {
      throw new ConflictException({
        code: 'USER_ALREADY_EXISTS',
        title: 'Usuário já existe',
        detail: ['Um usuário com este email já está cadastrado'],
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isAdmin: data.isAdmin || false,
      institutionId: data.institutionId,
    });

    return this.userRepository.create(user);
  }
}
