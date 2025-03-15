import { Module } from '@nestjs/common';

import { CreateEvaluationItemUseCase } from './domain/usecases/create-evaluation-item.usecase';
import { DeleteEvaluationItemUseCase } from './domain/usecases/delete-evaluation-item.usecase';
import { GetEvaluationItemUseCase } from './domain/usecases/get-evaluation-item.usecase';
import { ListEvaluationItemsByUnitUseCase } from './domain/usecases/list-evaluation-items-by-unit.usecase';
import { UpdateEvaluationItemUseCase } from './domain/usecases/update-evaluation-item.usecase';
import { EVALUATION_ITEM_REPOSITORY } from './evaluation-items.providers';
import { PrismaEvaluationItemRepository } from './infra/prisma/repositories/prisma-evaluation-item.repository';
import { EvaluationItemsController } from './presentation/controllers/evaluation-items.controller';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { UnitsModule } from '@/modules/units/units.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClassesModule, UnitsModule, AuthModule],
  controllers: [EvaluationItemsController],
  providers: [
    {
      provide: EVALUATION_ITEM_REPOSITORY,
      useClass: PrismaEvaluationItemRepository,
    },
    CreateEvaluationItemUseCase,
    GetEvaluationItemUseCase,
    ListEvaluationItemsByUnitUseCase,
    UpdateEvaluationItemUseCase,
    DeleteEvaluationItemUseCase,
  ],
  exports: [EVALUATION_ITEM_REPOSITORY],
})
export class EvaluationItemsModule {}
