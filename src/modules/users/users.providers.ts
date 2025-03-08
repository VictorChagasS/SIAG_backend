import { PrismaUserRepository } from '@/modules/users/infra/prisma/repositories/prisma-user.repository';

export const USER_REPOSITORY = 'UserRepository';

export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
];
