/**
 * Admin Guard
 *
 * This guard protects routes that should only be accessible by admin users.
 * It works in conjunction with the JwtAuthGuard to first validate authentication
 * and then check if the authenticated user has admin privileges.
 *
 * @module AuthGuards
 */
import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Guard that restricts access to admin users only
 *
 * This guard first ensures that the request has a valid JWT token by using JwtAuthGuard
 * and then checks if the authenticated user has the isAdmin flag set to true.
 * If not, a ForbiddenException is thrown.
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @UseGuards(AdminGuard)
 * getAdminData() {
 *   return this.adminService.getSecretData();
 * }
 * ```
 *
 * @class AdminGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private jwtAuthGuard: JwtAuthGuard;

  /**
   * Creates an instance of AdminGuard
   *
   * Initializes a JwtAuthGuard to handle token verification
   * before performing admin checks
   *
   * @param {JwtService} jwtService - The JWT service for token validation
   */
  constructor(private jwtService: JwtService) {
    this.jwtAuthGuard = new JwtAuthGuard(jwtService);
  }

  /**
   * Determines if the current request is allowed to proceed
   *
   * First validates authentication using JwtAuthGuard, then checks
   * if the authenticated user has admin privileges.
   *
   * @param {ExecutionContext} context - The execution context (request info)
   * @returns {Promise<boolean>} True if access is granted, otherwise throws exception
   * @throws {ForbiddenException} If the user is not an admin
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First verify if the user is authenticated
    await this.jwtAuthGuard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user.isAdmin) {
      throw new ForbiddenException('Access denied. Only administrators can access this resource.');
    }

    return true;
  }
}
