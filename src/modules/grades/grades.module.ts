import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { EvaluationItemsModule } from '@/modules/evaluation-items/evaluation-items.module';
import { StudentsModule } from '@/modules/students/students.module';
import { UnitsModule } from '@/modules/units/units.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CalculateAllAveragesUseCase } from './domain/usecases/calculate-all-averages.usecase';
import { CalculateClassAverageUseCase } from './domain/usecases/calculate-class-average.usecase';
import { CalculateStudentAverageUseCase } from './domain/usecases/calculate-student-average.usecase';
import { CalculateUnitAverageUseCase } from './domain/usecases/calculate-unit-average.usecase';
import { CreateGradeUseCase } from './domain/usecases/create-grade.usecase';
import { UpsertStudentGradesUseCase } from './domain/usecases/create-many-grades.usecase';
import { GetGradeUseCase } from './domain/usecases/get-grade.usecase';
import { GetGradesByUnitUseCase } from './domain/usecases/get-grades-by-unit.usecase';
import { GetStudentGradesByUnitUseCase } from './domain/usecases/get-student-grades-by-unit.usecase';
import { UpdateGradeUseCase } from './domain/usecases/update-grade.usecase';
import { GRADE_REPOSITORY } from './grades.providers';
import { PrismaGradeRepository } from './infra/prisma/repositories/prisma-grade.repository';
import { GradesController } from './presentation/controllers/grades.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => UnitsModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => EvaluationItemsModule),
    AuthModule,
  ],
  controllers: [GradesController],
  providers: [
    {
      provide: GRADE_REPOSITORY,
      useClass: PrismaGradeRepository,
    },
    CreateGradeUseCase,
    UpsertStudentGradesUseCase,
    UpdateGradeUseCase,
    GetGradeUseCase,
    GetGradesByUnitUseCase,
    GetStudentGradesByUnitUseCase,
    CalculateUnitAverageUseCase,
    CalculateClassAverageUseCase,
    CalculateAllAveragesUseCase,
    CalculateStudentAverageUseCase,
  ],
  exports: [GRADE_REPOSITORY, CalculateStudentAverageUseCase, CalculateClassAverageUseCase, CalculateAllAveragesUseCase],
})
export class GradesModule {}
