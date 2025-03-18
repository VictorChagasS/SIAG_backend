import {
  Body, Controller, Get, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { CalculateAllAveragesUseCase } from '../../domain/usecases/calculate-all-averages.usecase';
import { CalculateUnitAverageUseCase } from '../../domain/usecases/calculate-unit-average.usecase';
import { CreateGradeUseCase } from '../../domain/usecases/create-grade.usecase';
import { UpsertStudentGradesUseCase } from '../../domain/usecases/create-many-grades.usecase';
import { GetGradeUseCase } from '../../domain/usecases/get-grade.usecase';
import { GetGradesByUnitUseCase } from '../../domain/usecases/get-grades-by-unit.usecase';
import { GetStudentGradesByUnitUseCase } from '../../domain/usecases/get-student-grades-by-unit.usecase';
import { UpdateGradeUseCase } from '../../domain/usecases/update-grade.usecase';
import { AllAveragesResponseDto } from '../dtos/all-averages-response.dto';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { GradeResponseDto } from '../dtos/grade-response.dto';
import { UnitAverageResponseDto } from '../dtos/unit-average-response.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { UpsertStudentGradesDto } from '../dtos/upsert-student-grades.dto';

@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(
    private createGradeUseCase: CreateGradeUseCase,
    private upsertStudentGradesUseCase: UpsertStudentGradesUseCase,
    private updateGradeUseCase: UpdateGradeUseCase,
    private getGradeUseCase: GetGradeUseCase,
    private getGradesByUnitUseCase: GetGradesByUnitUseCase,
    private getStudentGradesByUnitUseCase: GetStudentGradesByUnitUseCase,
    private calculateUnitAverageUseCase: CalculateUnitAverageUseCase,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar nota',
    description: 'Cria uma nova nota para um estudante em um item de avaliação específico',
  })
  @ApiResponseWrapped(GradeResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para criar notas neste contexto', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Estudante ou item de avaliação não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async create(
  @Body() createGradeDto: CreateGradeDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const gradeCreated = await this.createGradeUseCase.execute({
      ...createGradeDto,
      teacherId: currentUser.sub,
    });

    return gradeCreated;
  }

  @Post('student/:studentId/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Inserir/atualizar múltiplas notas',
    description: 'Insere ou atualiza múltiplas notas para um estudante em vários itens de avaliação',
  })
  @ApiParam({ name: 'studentId', description: 'ID do estudante' })
  @ApiResponseWrapped(GradeResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para modificar notas neste contexto', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Estudante ou item de avaliação não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async upsertStudentGrades(
  @Param('studentId') studentId: string,
    @Body() upsertStudentGradesDto: UpsertStudentGradesDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const gradesUpserted = await this.upsertStudentGradesUseCase.execute({
      studentId,
      grades: upsertStudentGradesDto.grades,
      teacherId: currentUser.sub,
    });

    return gradesUpserted;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar nota',
    description: 'Atualiza uma nota existente',
  })
  @ApiParam({ name: 'id', description: 'ID da nota' })
  @ApiResponseWrapped(GradeResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar esta nota', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Nota não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async update(
  @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const gradeUpdated = await this.updateGradeUseCase.execute({
      id,
      ...updateGradeDto,
      teacherId: currentUser.sub,
    });

    return gradeUpdated;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obter nota por ID',
    description: 'Obtém uma nota específica pelo seu ID',
  })
  @ApiParam({ name: 'id', description: 'ID da nota' })
  @ApiResponseWrapped(GradeResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar esta nota', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Nota não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async getById(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const grade = await this.getGradeUseCase.execute(id, currentUser.sub);
    return grade;
  }

  @Get('unit/:unitId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar notas por unidade',
    description: 'Lista todas as notas de uma unidade específica',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiResponseWrapped(GradeResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar notas desta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async getByUnit(
  @Param('unitId') unitId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const grades = await this.getGradesByUnitUseCase.execute(unitId, currentUser.sub);
    return grades;
  }

  @Get('unit/:unitId/student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar notas de estudante por unidade',
    description: 'Lista todas as notas de um estudante específico em uma unidade específica',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiParam({ name: 'studentId', description: 'ID do estudante' })
  @ApiResponseWrapped(GradeResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar notas deste estudante', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade ou estudante não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  async getByUnitAndStudent(
  @Param('unitId') unitId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const grades = await this.getStudentGradesByUnitUseCase.execute(
      unitId,
      studentId,
      currentUser.sub,
    );
    return grades;
  }

  @Get('unit/:unitId/student/:studentId/average')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Calcular média de estudante por unidade',
    description: 'Calcula a média das notas de um estudante específico em uma unidade específica',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiParam({ name: 'studentId', description: 'ID do estudante' })
  @ApiResponseWrapped(UnitAverageResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar médias deste estudante', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade ou estudante não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  async calculateUnitAverage(
    @Param('unitId') unitId: string,
      @Param('studentId') studentId: string,
      @CurrentUser() currentUser: IJwtPayload,
  ): Promise<UnitAverageResponseDto> {
    const average = await this.calculateUnitAverageUseCase.execute(
      unitId,
      studentId,
      currentUser.sub,
    );
    return average as UnitAverageResponseDto;
  }

  @Get('class/:classId/all-averages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Calcular todas as médias da turma',
    description: 'Calcula as médias de todos os estudantes em todas as unidades de uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(AllAveragesResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar médias desta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async calculateAllAverages(
    @Param('classId') classId: string,
      @CurrentUser() currentUser: IJwtPayload,
  ): Promise<AllAveragesResponseDto> {
    const allAverages = await this.calculateAllAveragesUseCase.execute(
      currentUser.sub,
      classId,
    );
    return allAverages as AllAveragesResponseDto;
  }
}
