import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';

import { ResetPasswordDto } from '../../presentation/dtos/reset-password.dto';
import { USER_REPOSITORY } from '../../users.providers';
import { IUserRepository } from '../repositories/user-repository.interface';

import { MailService } from '@/modules/mail/domain/services/mail.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: IUserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(data: ResetPasswordDto): Promise<void> {
    const user = await this.usersRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Gera uma nova senha aleatória
    const newPassword = Math.random().toString(36).slice(-8);

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualiza a senha do usuário
    await this.usersRepository.update(user.id, { password: hashedPassword });

    // Envia o email com a nova senha
    await this.mailService.sendPasswordReset({
      to: user.email,
      name: user.name,
      password: newPassword,
    });
  }
}
