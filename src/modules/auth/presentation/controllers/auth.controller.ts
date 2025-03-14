import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { AuthDto } from '../../domain/dtos/auth.dto';
import { AuthenticateUserUseCase } from '../../domain/usecases/authenticate-user.usecase';
import { GetMeUseCase } from '../../domain/usecases/get-me.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authDto: AuthDto) {
    return this.authenticateUserUseCase.execute({
      email: authDto.email,
      password: authDto.password,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: IJwtPayload) {
    return this.getMeUseCase.execute(user);
  }
}
