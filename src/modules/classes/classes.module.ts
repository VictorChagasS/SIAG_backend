import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '@/modules/auth/auth.module';
import { classesProviders } from '@/modules/classes/classes.providers';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';
import { ImportClassWithStudentsUseCase } from '@/modules/classes/domain/usecases/import-class-with-students.usecase';
import { ListActiveClassesUseCase } from '@/modules/classes/domain/usecases/list-active-classes.usecase';
import { ListActiveTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-active-teacher-classes.usecase';
import { ListClassesUseCase } from '@/modules/classes/domain/usecases/list-classes.usecase';
import { ListTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-teacher-classes.usecase';
import { UpdateClassFormulaUseCase } from '@/modules/classes/domain/usecases/update-class-formula.usecase';
import { UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';
import { ClassesController } from '@/modules/classes/presentation/controllers/classes.controller';
import { ImportClassWithStudentsController } from '@/modules/classes/presentation/controllers/import-class-with-students.controller';
import { StudentsModule } from '@/modules/students/students.module';
import { UnitsModule } from '@/modules/units/units.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => UnitsModule),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [
    ClassesController,
    ImportClassWithStudentsController,
  ],
  providers: [
    CreateClassUseCase,
    GetClassUseCase,
    ListClassesUseCase,
    ListActiveClassesUseCase,
    ListTeacherClassesUseCase,
    ListActiveTeacherClassesUseCase,
    UpdateClassUseCase,
    UpdateClassFormulaUseCase,
    DeleteClassUseCase,
    ImportClassWithStudentsUseCase,
    ...classesProviders,
  ],
  exports: [
    ...classesProviders,
  ],
})
export class ClassesModule {}
