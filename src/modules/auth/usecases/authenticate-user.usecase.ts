import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IUserRepository } from '../../users/domain/repositories/user-repository.interface';

export interface IAuthenticateUserDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(data: IAuthenticateUserDTO): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }
}
