/**
 * Classes Controller
 *
 * Controller responsible for handling HTTP requests related to classes management.
 * Provides endpoints for creating, reading, updating, and deleting classes,
 * as well as specialized operations like exporting templates and updating formulas.
 *
 * @module ClassesController
 */
import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Res, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { AdminGuard } from '@/modules/auth/domain/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';
import { DeleteClassUseCase } from '@/modules/classes/domain/usecases/delete-class.usecase';
import { DownloadClassTemplateUseCase } from '@/modules/classes/domain/usecases/download-class-template.usecase';
import { ExportClassTemplateUseCase } from '@/modules/classes/domain/usecases/export-class-template.usecase';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';
import { ListActiveClassesUseCase } from '@/modules/classes/domain/usecases/list-active-classes.usecase';
import { ListActiveTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-active-teacher-classes.usecase';
import { ListClassesUseCase } from '@/modules/classes/domain/usecases/list-classes.usecase';
import { ListTeacherClassesUseCase } from '@/modules/classes/domain/usecases/list-teacher-classes.usecase';
import { UpdateClassFormulaUseCase } from '@/modules/classes/domain/usecases/update-class-formula.usecase';
import { UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';
import { ClassResponseDto } from '@/modules/classes/presentation/dtos/class-response.dto';
import { CreateClassDto } from '@/modules/classes/presentation/dtos/create-class.dto';
import { UpdateClassFormulaDto } from '@/modules/classes/presentation/dtos/update-class-formula.dto';
import { UpdateClassDto } from '@/modules/classes/presentation/dtos/update-class.dto';

import { Class } from '../../domain/entities/class.entity';
import { ActiveTeacherClassesQueryDto } from '../dto/active-teacher-classes-query.dto';
import { ListTeacherClassesQueryDto } from '../dto/list-teacher-classes-query.dto';
import { PaginatedClassResponseDto } from '../dtos/paginated-class-response.dto';

@ApiTags('classes')
@Controller('classes')
/**
 * Controller for handling class-related HTTP requests
 *
 * Provides endpoints for class management operations including:
 * - Creating, reading, updating, and deleting classes
 * - Listing classes with various filters
 * - Exporting class data as Excel templates
 * - Managing class grade formulas
 *
 * @class ClassesController
 */
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
    private readonly downloadClassTemplateUseCase: DownloadClassTemplateUseCase,
  ) {}

  @Get('template')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Baixar template vazio',
    description: 'Baixa um arquivo Excel com o template vazio para registro de notas',
  })
  @ApiErrorResponse(500, 'Erro ao processar arquivo de template', 'SERVER_ERROR', 'Erro interno')
  async downloadTemplate(@Res() res: Response) {
    const templateBuffer = await this.downloadClassTemplateUseCase.execute();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template.xlsx"',
      'Content-Length': templateBuffer.length,
    });

    res.end(templateBuffer);
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Exportar template da turma',
    description: 'Exporta um arquivo Excel com o template da turma contendo as médias dos alunos',
  })
  @ApiParam({ name: 'id', description: 'ID da turma' })
  @ApiErrorResponse(403, 'Você não tem permissão para exportar esta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'É necessário ter pelo menos 3 unidades para exportar o template', 'INVALID_DATA', 'Dados inválidos')
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
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Criar turma', description: 'Cria uma nova turma' })
  @ApiResponseWrapped(ClassResponseDto)
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
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
      section: createClassDto.section,
      teacherId,
    });

    return classCreated;
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar todas as turmas', description: 'Lista todas as turmas (requer privilégios de administrador)' })
  @ApiResponseWrapped(ClassResponseDto, true)
  @ApiErrorResponse(403, 'Acesso negado', 'FORBIDDEN', 'Acesso negado')
  async findAll() {
    const classes = await this.listClassesUseCase.execute();

    return classes;
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar turmas ativas', description: 'Lista todas as turmas ativas (requer privilégios de administrador)' })
  @ApiResponseWrapped(ClassResponseDto, true)
  @ApiErrorResponse(403, 'Acesso negado', 'FORBIDDEN', 'Acesso negado')
  async findAllActive() {
    const classes = await this.listActiveClassesUseCase.execute();

    return classes;
  }

  @Get('my-classes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar turmas do professor', description: 'Lista todas as turmas do professor atual' })
  @ApiResponseWrapped(PaginatedClassResponseDto)
  async findAllByTeacher(
  @CurrentUser() currentUser: IJwtPayload,
    @Query() query: ListTeacherClassesQueryDto,
  ) {
    const result = await this.listTeacherClassesUseCase.execute({
      teacherId: currentUser.sub,
      ...query,
    });

    return result;
  }

  @Get('my-classes/active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar turmas ativas do professor', description: 'Lista todas as turmas ativas do professor atual' })
  @ApiResponseWrapped(ClassResponseDto, true)
  async findAllActiveByTeacher(
  @CurrentUser() currentUser: IJwtPayload,
    @Query() query: ActiveTeacherClassesQueryDto,
  ) {
    const classes = await this.listActiveTeacherClassesUseCase.execute({
      teacherId: currentUser.sub,
      ...query,
    });

    return classes;
  }

  @Get('my-classes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obter turma do professor', description: 'Obtém uma turma específica do professor atual pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da turma' })
  @ApiResponseWrapped(ClassResponseDto)
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async findOne(@Param('id') id: string) {
    const classFound = await this.getClassUseCase.execute(id);

    return classFound;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Atualizar turma', description: 'Atualiza uma turma existente' })
  @ApiParam({ name: 'id', description: 'ID da turma' })
  @ApiResponseWrapped(ClassResponseDto)
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar esta turma', 'FORBIDDEN', 'Acesso negado')
  async update(
  @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const newClass = new Class({
      name: updateClassDto.name,
      code: updateClassDto.code,
      period: updateClassDto.period,
      section: updateClassDto.section,
      teacherId: currentUser.sub,
    });
    const classUpdated = await this.updateClassUseCase.execute(
      id,
      newClass,
      currentUser.sub,
    );

    return classUpdated;
  }

  @Patch(':id/formula')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Atualizar fórmula da turma', description: 'Atualiza a fórmula de cálculo de média da turma' })
  @ApiParam({ name: 'id', description: 'ID da turma' })
  @ApiResponseWrapped(ClassResponseDto)
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar esta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(400, 'Fórmula inválida', 'INVALID_FORMULA', 'Fórmula inválida')
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
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remover turma', description: 'Remove uma turma existente' })
  @ApiParam({ name: 'id', description: 'ID da turma' })
  @ApiResponseWrapped(ClassResponseDto)
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(403, 'Você não tem permissão para remover esta turma', 'FORBIDDEN', 'Acesso negado')
  async remove(@Param('id') id: string) {
    const deletedClass = await this.deleteClassUseCase.execute(id);

    return deletedClass;
  }
}
