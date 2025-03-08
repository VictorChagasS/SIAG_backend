import {
  Body, Controller, Post, HttpCode, HttpStatus,
} from '@nestjs/common';

import { AuthDto } from '../dtos/auth.dto';
import { AuthenticateUserUseCase } from '../usecases/authenticate-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authDto: AuthDto) {
    return this.authenticateUserUseCase.execute({
      email: authDto.email,
      password: authDto.password,
    });
  }
}
