/**
 * Students Module
 *
 * Module responsible for handling student management.
 * Provides functionality for creating, retrieving, updating, and deleting students,
 * as well as listing students for a specific class.
 *
 * @module StudentsModule
 * @students Module
 */
import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { GradesModule } from '@/modules/grades/grades.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateStudentUseCase } from './domain/usecases/create-student.usecase';
import { DeleteStudentUseCase } from './domain/usecases/delete-student.usecase';
import { GetStudentUseCase } from './domain/usecases/get-student.usecase';
import { ListStudentsByClassUseCase } from './domain/usecases/list-students-by-class.usecase';
import { UpdateStudentUseCase } from './domain/usecases/update-student.usecase';
import { PrismaStudentRepository } from './infra/prisma/repositories/prisma-student.repository';
import { StudentsController } from './presentation/controllers/students.controller';
import { STUDENT_REPOSITORY } from './students.providers';

/**
 * Module for managing students
 *
 * This module provides functionality to create, read, update, and delete students,
 * as well as listing students for specific classes. It also handles relationships
 * between students, classes, and grades.
 *
 * @class StudentsModule
 * @students NestModule
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => GradesModule),
    AuthModule,
  ],
  controllers: [StudentsController],
  providers: [
    {
      provide: STUDENT_REPOSITORY,
      useClass: PrismaStudentRepository,
    },
    CreateStudentUseCase,
    GetStudentUseCase,
    ListStudentsByClassUseCase,
    UpdateStudentUseCase,
    DeleteStudentUseCase,
  ],
  exports: [STUDENT_REPOSITORY],
})
export class StudentsModule {}
