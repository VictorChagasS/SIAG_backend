import { USER_REPOSITORY } from '../users/users.providers';
import { AuthenticateUserUseCase } from './usecases/authenticate-user.usecase';
import { JwtService } from '@nestjs/jwt';

export const authProviders = [
  {
    provide: AuthenticateUserUseCase,
    useFactory: (userRepository, jwtService: JwtService) => {
      return new AuthenticateUserUseCase(userRepository, jwtService);
    },
    inject: [USER_REPOSITORY, JwtService],
  },
]; 