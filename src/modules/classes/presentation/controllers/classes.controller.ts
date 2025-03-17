import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { AdminGuard } from '@/modules/auth/domain/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { ExportClassTemplateUseCase } from '@/modules/classes/domain/usecases/export-class-template.usecase';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';
import { ListActiveClassesUseCase } from '@/modules/classes/domain/usecases/list-active-classes.usecase';
import { ListActiveTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-active-teacher-classes.usecase';
import { ListClassesUseCase } from '@/modules/classes/domain/usecases/list-classes.usecase';
import { ListTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-teacher-classes.usecase';
import { UpdateClassFormulaUseCase } from '@/modules/classes/domain/usecases/update-class-formula.usecase';
import { UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';
import { CreateClassDto } from '@/modules/classes/presentation/dtos/create-class.dto';
import { UpdateClassFormulaDto } from '@/modules/classes/presentation/dtos/update-class-formula.dto';
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
    private readonly updateClassFormulaUseCase: UpdateClassFormulaUseCase,
    private readonly deleteClassUseCase: DeleteClassUseCase,
    private readonly exportClassTemplateUseCase: ExportClassTemplateUseCase,
  ) {}

  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportTemplate(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
    @Res() res: Response,
  ) {
    const templateBuffer = await this.exportClassTemplateUseCase.execute(id, currentUser.sub);

    // Obter a turma para usar no nome do arquivo
    const classEntity = await this.getClassUseCase.execute(id);

    // Formatar o nome do arquivo: nome_turma-turma-codigo-periodo.xlsx
    // Substituindo espaços por _ e removendo caracteres especiais
    const classNameSafe = classEntity.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    const classSectionSafe = classEntity.section || 1;
    const classCodeSafe = (classEntity.code || '').replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    const classPeriodSafe = classEntity.period.replace(/\./g, '_');

    const fileName = `${classNameSafe}-${classCodeSafe}-${classPeriodSafe}-${classSectionSafe}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': templateBuffer.length,
    });

    res.end(templateBuffer);
  }

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

    return classCreated;
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    const classes = await this.listClassesUseCase.execute();

    return classes;
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAllActive() {
    const classes = await this.listActiveClassesUseCase.execute();

    return classes;
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

  @Get('my-classes/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const classFound = await this.getClassUseCase.execute(id);

    return classFound;
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

  @Patch(':id/formula')
  @UseGuards(JwtAuthGuard)
  async updateFormula(
  @Param('id') id: string,
    @Body() updateClassFormulaDto: UpdateClassFormulaDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const classUpdated = await this.updateClassFormulaUseCase.execute(
      id,
      updateClassFormulaDto,
      currentUser.sub,
    );

    return classUpdated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const deletedClass = await this.deleteClassUseCase.execute(id);

    return deletedClass;
  }
}
