import { JwtService } from '@nestjs/jwt';

import { USER_REPOSITORY } from '../users/users.providers';

import { AuthenticateUserUseCase } from './domain/usecases/authenticate-user.usecase';
import { GetMeUseCase } from './domain/usecases/get-me.usecase';

export const authProviders = [
  {
    provide: AuthenticateUserUseCase,
    useFactory: (userRepository, jwtService: JwtService) => new AuthenticateUserUseCase(userRepository, jwtService),
    inject: [USER_REPOSITORY, JwtService],
  },
  {
    provide: GetMeUseCase,
    useFactory: (userRepository) => new GetMeUseCase(userRepository),
    inject: [USER_REPOSITORY],
  },
];
