/**
 * Providers for the authentication module
 *
 * This file defines the providers (providers) for the authentication module
 * that are injected into the NestJS container to create use cases related to authentication.
 *
 * @module AuthProviders
 */
import { JwtService } from '@nestjs/jwt';

import { USER_REPOSITORY } from '../users/users.providers';

import { AuthenticateUserUseCase } from './domain/usecases/authenticate-user.usecase';
import { GetMeUseCase } from './domain/usecases/get-me.usecase';

/**
 * Array of providers for the authentication module
 *
 * Contains the definition of how the use cases will be instantiated,
 * their dependencies and how they will be injected into the NestJS container.
 */
export const authProviders = [
  {
    provide: AuthenticateUserUseCase,
    useFactory: (userRepository, jwtService: JwtService) => new AuthenticateUserUseCase(userRepository, jwtService),
    inject: [USER_REPOSITORY, JwtService], // Injects the user repository and JWT service
  },
  {
    provide: GetMeUseCase,
    useFactory: (userRepository) => new GetMeUseCase(userRepository),
    inject: [USER_REPOSITORY], // Injects only the user repository
  },
];
