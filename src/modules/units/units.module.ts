import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { EvaluationItemsModule } from '@/modules/evaluation-items/evaluation-items.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateUnitUseCase } from './domain/usecases/create-unit.usecase';
import { DeleteUnitUseCase } from './domain/usecases/delete-unit.usecase';
import { GetUnitUseCase } from './domain/usecases/get-unit.usecase';
import { ListUnitsByClassUseCase } from './domain/usecases/list-units-by-class.usecase';
import { UpdateUnitFormulaUseCase } from './domain/usecases/update-unit-formula.usecase';
import { UpdateUnitUseCase } from './domain/usecases/update-unit.usecase';
import { UpsertUnitUseCase } from './domain/usecases/upsert-unit.usecase';
import { PrismaUnitRepository } from './infra/prisma/repositories/prisma-unit.repository';
import { UnitsController } from './presentation/controllers/units.controller';
import { UNIT_REPOSITORY } from './units.providers';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => EvaluationItemsModule),
    AuthModule,
  ],
  controllers: [UnitsController],
  providers: [
    {
      provide: UNIT_REPOSITORY,
      useClass: PrismaUnitRepository,
    },
    CreateUnitUseCase,
    GetUnitUseCase,
    ListUnitsByClassUseCase,
    UpdateUnitUseCase,
    DeleteUnitUseCase,
    UpsertUnitUseCase,
    UpdateUnitFormulaUseCase,
  ],
  exports: [UNIT_REPOSITORY],
})
export class UnitsModule {}
