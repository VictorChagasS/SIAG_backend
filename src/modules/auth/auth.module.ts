/**
 * Authentication Module
 *
 * Responsible for managing user authentication in the system, including login,
 * token validation and administrative permission checks.
 *
 * This module integrates with the users module and configures JWT for
 * stateless authentication based on tokens.
 *
 * @module AuthModule
 */
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

import { authProviders } from './auth.providers';
import { AdminGuard } from './domain/guards/admin.guard';
import { JwtAuthGuard } from './domain/guards/jwt-auth.guard';
import { AuthController } from './presentation/controllers/auth.controller';

/**
 * NestJS Authentication Module
 *
 * Defines dependencies, providers, controllers and exports related to user authentication.
 *
 * @class AuthModule
 */
@Module({
  imports: [
    // Circular dependency with the users module to resolve mutual dependencies
    forwardRef(() => UsersModule),
    // Configuration of JWT for authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }, // Token expires in 1 day
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Providers defined in the auth.providers.ts file
    ...authProviders,
    // Guards for route protection
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [
    // Export the JWT module and guards for use in other modules
    JwtModule,
    JwtAuthGuard,
    AdminGuard,
  ],
})
export class AuthModule {}
