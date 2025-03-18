import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { AuthResponseDto } from '../../domain/dtos/auth-response.dto';
import { AuthDto } from '../../domain/dtos/auth.dto';
import { UserMeResponseDto } from '../../domain/dtos/user-me-response.dto';
import { AuthenticateUserUseCase } from '../../domain/usecases/authenticate-user.usecase';
import { GetMeUseCase } from '../../domain/usecases/get-me.usecase';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Realiza o login do usuário e retorna um token JWT' })
  @ApiBody({ type: AuthDto })
  @ApiResponseWrapped(AuthResponseDto)
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    'Credenciais inválidas',
    'INVALID_CREDENTIALS',
    'Credenciais inválidas',
  )
  async login(@Body() authDto: AuthDto) {
    return this.authenticateUserUseCase.execute({
      email: authDto.email,
      password: authDto.password,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obter dados do usuário logado', description: 'Retorna as informações do usuário autenticado' })
  @ApiResponseWrapped(UserMeResponseDto)
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    'Token inválido ou expirado',
    'UNAUTHORIZED',
    'Não autorizado',
  )
  @ApiErrorResponse(
    HttpStatus.NOT_FOUND,
    'Usuário não encontrado',
    'USER_NOT_FOUND',
    'Usuário não encontrado',
  )
  async me(@CurrentUser() user: IJwtPayload) {
    return this.getMeUseCase.execute(user);
  }
}
