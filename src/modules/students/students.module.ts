import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { ClassesModule } from '../classes/classes.module';

import { CreateStudentUseCase } from './domain/usecases/create-student.usecase';
import { DeleteStudentUseCase } from './domain/usecases/delete-student.usecase';
import { GetStudentUseCase } from './domain/usecases/get-student.usecase';
import { ListStudentsByClassUseCase } from './domain/usecases/list-students-by-class.usecase';
import { UpdateStudentUseCase } from './domain/usecases/update-student.usecase';
import { PrismaStudentRepository } from './infra/prisma/repositories/prisma-student.repository';
import { StudentsController } from './presentation/controllers/students.controller';
import { STUDENT_REPOSITORY } from './students.providers';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ClassesModule),
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
