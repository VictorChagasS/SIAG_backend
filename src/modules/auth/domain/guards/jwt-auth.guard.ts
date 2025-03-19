/**
 * JWT Authentication Guard
 *
 * This guard protects routes that require authentication by validating
 * the JWT token provided in the Authorization header. It extracts the token,
 * verifies its signature, and decodes the user information.
 *
 * @module AuthGuards
 */
import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IJwtPayload } from '../types/jwt-payload.type';

/**
 * Guard that validates JWT tokens and protects authenticated routes
 *
 * This guard extracts the JWT token from the Authorization header,
 * validates it using JwtService, and makes the decoded payload available
 * in the request object for later use in route handlers.
 *
 * @example
 * ```typescript
 * @Get('protected')
 * @UseGuards(JwtAuthGuard)
 * getProtectedData() {
 *   return this.service.getProtectedData();
 * }
 * ```
 *
 * @class JwtAuthGuard
 * @implements {CanActivate}
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Creates an instance of JwtAuthGuard
   *
   * @param {JwtService} jwtService - The JWT service for token validation
   */
  constructor(private jwtService: JwtService) {}

  /**
   * Determines if the current request is allowed to proceed
   *
   * Extracts the JWT token from the request, validates it,
   * and attaches the decoded user information to the request object.
   *
   * @param {ExecutionContext} context - The execution context (request info)
   * @returns {Promise<boolean>} True if authentication is valid
   * @throws {UnauthorizedException} If token is missing, invalid, or expired
   */
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

  /**
   * Extracts the JWT token from the Authorization header
   *
   * Looks for a Bearer token in the Authorization header and
   * returns just the token part (without the "Bearer" prefix).
   *
   * @private
   * @param {Request} request - The HTTP request object
   * @returns {string | undefined} The extracted token or undefined if not found
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
