import { PrismaClassRepository } from '@/modules/classes/infra/prisma/repositories/prisma-class.repository';

export const CLASS_REPOSITORY = 'ClassRepository';

export const classesProviders = [
  {
    provide: CLASS_REPOSITORY,
    useClass: PrismaClassRepository,
  },
];
