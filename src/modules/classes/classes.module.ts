import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { classesProviders } from '@/modules/classes/classes.providers';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';
import { ListActiveClassesUseCase } from '@/modules/classes/domain/usecases/list-active-classes.usecase';
import { ListActiveTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-active-teacher-classes.usecase';
import { ListClassesUseCase } from '@/modules/classes/domain/usecases/list-classes.usecase';
import { ListTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-teacher-classes.usecase';
import { UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';
import { ClassesController } from '@/modules/classes/presentation/controllers/classes.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ClassesController],
  providers: [
    CreateClassUseCase,
    GetClassUseCase,
    ListClassesUseCase,
    ListActiveClassesUseCase,
    ListTeacherClassesUseCase,
    ListActiveTeacherClassesUseCase,
    UpdateClassUseCase,
    DeleteClassUseCase,
    ...classesProviders,
  ],
  exports: [
    ...classesProviders,
  ],
})
export class ClassesModule {}
