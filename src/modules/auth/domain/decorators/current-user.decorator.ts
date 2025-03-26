/**
 * Current User Decorator
 *
 * This custom parameter decorator extracts the authenticated user information
 * from the request object, which is set by the JWT Auth Guard after
 * validating the JWT token.
 *
 * @module AuthDecorators
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IJwtPayload } from '../types/jwt-payload.type';

/**
 * A parameter decorator that extracts the authenticated user from the request
 *
 * Used in controller methods to access the current authenticated user's information
 * that was decoded from the JWT token and validated by the JwtAuthGuard.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: IJwtPayload) {
 *   return this.userService.findById(user.sub);
 * }
 * ```
 *
 * @returns {IJwtPayload} The JWT payload containing user information
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
