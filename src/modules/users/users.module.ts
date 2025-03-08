import { Module, forwardRef } from '@nestjs/common';

import { CreateUserUseCase } from '@/modules/users/domain/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/modules/users/domain/usecases/delete-user.usecase';
import { GetUserProfileUseCase } from '@/modules/users/domain/usecases/get-user-profile.usecase';
import { ListUsersUseCase } from '@/modules/users/domain/usecases/list-users.usecase';
import { UpdateUserUseCase } from '@/modules/users/domain/usecases/update-user.usecase';
import { UsersController } from '@/modules/users/presentation/controllers/users.controller';
import { usersProviders } from '@/modules/users/users.providers';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserProfileUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ...usersProviders,
  ],
  exports: [
    CreateUserUseCase,
    ...usersProviders,
  ],
})
export class UsersModule {}
