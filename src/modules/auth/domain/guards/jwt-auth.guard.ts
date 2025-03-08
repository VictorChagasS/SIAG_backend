import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IJwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'TOKEN_NOT_PROVIDED',
        title: 'Token não fornecido',
        detail: ['É necessário fornecer um token de autenticação'],
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token);
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN_PAYLOAD',
          title: 'Token inválido',
          detail: ['O token não contém todas as informações necessárias'],
        });
      }
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        title: 'Token inválido',
        detail: ['O token fornecido é inválido ou expirou'],
      });
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
