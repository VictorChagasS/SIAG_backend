import { Module, forwardRef } from '@nestjs/common';

import { CreateUserUseCase } from '@/modules/users/domain/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/modules/users/domain/usecases/delete-user.usecase';
import { GetUserProfileUseCase } from '@/modules/users/domain/usecases/get-user-profile.usecase';
import { ListUsersUseCase } from '@/modules/users/domain/usecases/list-users.usecase';
import { UpdateUserUseCase } from '@/modules/users/domain/usecases/update-user.usecase';
import { UsersController } from '@/modules/users/presentation/controllers/users.controller';
import { usersProviders } from '@/modules/users/users.providers';

import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

import { ResetPasswordUseCase } from './domain/usecases/reset-password.usecase';
import { UpdateUserInfoUseCase } from './domain/usecases/update-user-info.usecase';
import { UpdateUserPasswordUseCase } from './domain/usecases/update-user-password.usecase';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MailModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserProfileUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateUserInfoUseCase,
    UpdateUserPasswordUseCase,
    ResetPasswordUseCase,
    ...usersProviders,
  ],
  exports: [
    CreateUserUseCase,
    ...usersProviders,
  ],
})
export class UsersModule {}
