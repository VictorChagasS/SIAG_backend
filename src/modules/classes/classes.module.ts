/**
 * Classes Module
 *
 * Responsible for managing classes (courses) in the system, including creation, listing,
 * updating, and deletion. This module also handles class-related operations like
 * importing students, exporting templates, and formula calculation.
 *
 * This module integrates with Auth, Students, Units, and Grades modules to provide
 * comprehensive class management functionality.
 *
 * @module ClassesModule
 */
import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '@/modules/auth/auth.module';
import { classesProviders } from '@/modules/classes/classes.providers';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { ExportClassTemplateUseCase } from '@/modules/classes/domain/usecases/export-class-template.usecase';
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
import { GradesModule } from '@/modules/grades/grades.module';
import { StudentsModule } from '@/modules/students/students.module';
import { UnitsModule } from '@/modules/units/units.module';

/**
 * NestJS Classes Module
 *
 * Defines the dependencies, providers, controllers, and exports related
 * to class management functionality in the academic system.
 *
 * @class ClassesModule
 */
@Module({
  imports: [
    // Circular dependencies with related modules
    forwardRef(() => AuthModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => UnitsModule),
    forwardRef(() => GradesModule),
    // File upload configuration for importing class data
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
    // Use cases for class management
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
    ExportClassTemplateUseCase,
    // Repository providers
    ...classesProviders,
  ],
  exports: [
    // Exports for use in other modules
    ...classesProviders,
    GetClassUseCase,
    ListClassesUseCase,
    ListActiveClassesUseCase,
    ListTeacherClassesUseCase,
    ListActiveTeacherClassesUseCase,
    ExportClassTemplateUseCase,
  ],
})
export class ClassesModule {}
