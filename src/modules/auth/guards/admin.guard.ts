import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  private jwtAuthGuard: JwtAuthGuard;

  constructor(private jwtService: JwtService) {
    this.jwtAuthGuard = new JwtAuthGuard(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primeiro verifica se o usuário está autenticado
    await this.jwtAuthGuard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user.isAdmin) {
      throw new ForbiddenException('Acesso negado. Apenas administradores podem acessar este recurso.');
    }

    return true;
  }
}
