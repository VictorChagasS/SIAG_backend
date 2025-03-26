/**
 * Evaluation Items Module
 *
 * Module responsible for handling evaluation item management.
 * Evaluation items are individual assessment elements within units,
 * such as tests, assignments, projects, etc.
 *
 * @module EvaluationItemsModule
 * @evaluation-items Module
 */
import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { UnitsModule } from '@/modules/units/units.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateEvaluationItemUseCase } from './domain/usecases/create-evaluation-item.usecase';
import { DeleteEvaluationItemUseCase } from './domain/usecases/delete-evaluation-item.usecase';
import { GetEvaluationItemUseCase } from './domain/usecases/get-evaluation-item.usecase';
import { ListEvaluationItemsByUnitUseCase } from './domain/usecases/list-evaluation-items-by-unit.usecase';
import { UpdateEvaluationItemUseCase } from './domain/usecases/update-evaluation-item.usecase';
import { EVALUATION_ITEM_REPOSITORY } from './evaluation-items.providers';
import { PrismaEvaluationItemRepository } from './infra/prisma/repositories/prisma-evaluation-item.repository';
import { EvaluationItemsController } from './presentation/controllers/evaluation-items.controller';

/**
 * Module for managing evaluation items
 *
 * This module provides functionality to create, read, update, and delete evaluation items,
 * as well as listing evaluation items for specific units. Evaluation items represent
 * individual assessments like tests, assignments, or projects within an academic unit.
 *
 * @class EvaluationItemsModule
 * @evaluation-items NestModule
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => UnitsModule),
    AuthModule,
  ],
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
