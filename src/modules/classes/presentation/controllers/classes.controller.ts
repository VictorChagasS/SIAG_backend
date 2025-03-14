import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { AdminGuard } from '@/modules/auth/domain/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';
import { ListActiveClassesUseCase } from '@/modules/classes/domain/usecases/list-active-classes.usecase';
import { ListActiveTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-active-teacher-classes.usecase';
import { ListClassesUseCase } from '@/modules/classes/domain/usecases/list-classes.usecase';
import { ListTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-teacher-classes.usecase';
import { UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';
import { CreateClassDto } from '@/modules/classes/presentation/dtos/create-class.dto';
import { UpdateClassDto } from '@/modules/classes/presentation/dtos/update-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly createClassUseCase: CreateClassUseCase,
    private readonly getClassUseCase: GetClassUseCase,
    private readonly listClassesUseCase: ListClassesUseCase,
    private readonly listActiveClassesUseCase: ListActiveClassesUseCase,
    private readonly listTeacherClassesUseCase: ListTeacherClassesUseCase,
    private readonly listActiveTeacherClassesUseCase: ListActiveTeacherClassesUseCase,
    private readonly updateClassUseCase: UpdateClassUseCase,
    private readonly deleteClassUseCase: DeleteClassUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
  @Body() createClassDto: CreateClassDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    // O teacherId será sempre o ID do usuário atual (professor)
    const teacherId = currentUser.sub;

    const classCreated = await this.createClassUseCase.execute({
      name: createClassDto.name,
      code: createClassDto.code,
      period: createClassDto.period,
      teacherId,
    });

    return {
      id: classCreated.id,
      name: classCreated.name,
      code: classCreated.code,
      period: classCreated.period,
      createdAt: classCreated.createdAt,
      updatedAt: classCreated.updatedAt,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    const classes = await this.listClassesUseCase.execute();

    return classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      code: classItem.code,
      period: classItem.period,
      createdAt: classItem.createdAt,
      updatedAt: classItem.updatedAt,
    }));
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAllActive() {
    const classes = await this.listActiveClassesUseCase.execute();

    return classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      code: classItem.code,
      period: classItem.period,
      createdAt: classItem.createdAt,
      updatedAt: classItem.updatedAt,
    }));
  }

  @Get('my-classes')
  @UseGuards(JwtAuthGuard)
  async findAllByTeacher(@CurrentUser() currentUser: IJwtPayload) {
    const classes = await this.listTeacherClassesUseCase.execute(currentUser.sub);

    return classes;
  }

  @Get('my-classes/active')
  @UseGuards(JwtAuthGuard)
  async findAllActiveByTeacher(@CurrentUser() currentUser: IJwtPayload) {
    const classes = await this.listActiveTeacherClassesUseCase.execute(currentUser.sub);

    return classes;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const classFound = await this.getClassUseCase.execute(id);

    return {
      id: classFound.id,
      name: classFound.name,
      code: classFound.code,
      period: classFound.period,
      createdAt: classFound.createdAt,
      updatedAt: classFound.updatedAt,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
  @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const classUpdated = await this.updateClassUseCase.execute(
      id,
      updateClassDto,
      currentUser.sub,
    );

    return classUpdated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const deletedClass = await this.deleteClassUseCase.execute(id);

    return {
      message: 'Classe excluída com sucesso',
      data: {
        id: deletedClass.id,
        name: deletedClass.name,
        code: deletedClass.code,
        period: deletedClass.period,
        createdAt: deletedClass.createdAt,
        updatedAt: deletedClass.updatedAt,
      },
    };
  }
}
