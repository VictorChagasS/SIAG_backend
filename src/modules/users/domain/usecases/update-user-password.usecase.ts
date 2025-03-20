import {
  BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

import { UpdateUserPasswordDto } from '../../presentation/dtos/update-user-password.dto';
import { USER_REPOSITORY } from '../../users.providers';
import { IUserRepository } from '../repositories/user-repository.interface';

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: UpdateUserPasswordDto): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Verifica se a nova senha e a confirmação são iguais
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestException('A nova senha e a confirmação não coincidem');
    }

    // Hash da nova senha
    const hashedPassword = await hash(data.newPassword, 10);

    // Atualiza a senha
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
}
