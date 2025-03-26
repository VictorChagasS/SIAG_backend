/**
 * Reports Controller
 *
 * Provides API endpoints for generating various analytical reports about class performance,
 * including summary statistics, grade distributions, top students, and unit comparisons.
 *
 * @module Reports
 */
import {
  Controller, Get, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { GenerateClassSummaryReportUseCase } from '../../domain/usecases/generate-class-summary-report.usecase';
import { GenerateGradeDistributionReportUseCase } from '../../domain/usecases/generate-grade-distribution-report.usecase';
import { GenerateTopStudentsReportUseCase } from '../../domain/usecases/generate-top-students-report.usecase';
import { GenerateUnitStatisticsReportUseCase } from '../../domain/usecases/generate-unit-statistics-report.usecase';
import { GetTeacherActiveClassesReportUseCase } from '../../domain/usecases/get-teacher-active-classes-report.usecase';
import { ClassSummaryReportDto } from '../dtos/class-summary-report.dto';
import { GradeDistributionReportDto } from '../dtos/grade-distribution-report.dto';
import { TeacherActiveClassesReportDto } from '../dtos/teacher-active-classes-report.dto';
import { TopStudentsReportDto } from '../dtos/top-students-report.dto';
import { UnitStatisticsReportDto } from '../dtos/unit-statistics-report.dto';

/**
 * Controller handling requests for various class performance reports
 *
 * @class ReportsController
 * @reports Presentation
 */
@Controller('reports')
@ApiTags('Relatórios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  /**
   * Creates a controller instance with required use cases
   *
   * @param {GenerateClassSummaryReportUseCase} generateClassSummaryReportUseCase - Use case for generating class summary reports
   * @param {GenerateGradeDistributionReportUseCase} generateGradeDistributionReportUseCase - Use case for generating grade distribution reports
   * @param {GenerateTopStudentsReportUseCase} generateTopStudentsReportUseCase - Use case for generating top students reports
   * @param {GenerateUnitStatisticsReportUseCase} generateUnitStatisticsReportUseCase - Use case for generating unit statistics reports
   * @param {GetTeacherActiveClassesReportUseCase} getTeacherActiveClassesReportUseCase - Use case for getting active classes with averages
   */
  constructor(
    private readonly generateClassSummaryReportUseCase: GenerateClassSummaryReportUseCase,
    private readonly generateGradeDistributionReportUseCase: GenerateGradeDistributionReportUseCase,
    private readonly generateTopStudentsReportUseCase: GenerateTopStudentsReportUseCase,
    private readonly generateUnitStatisticsReportUseCase: GenerateUnitStatisticsReportUseCase,
    private readonly getTeacherActiveClassesReportUseCase: GetTeacherActiveClassesReportUseCase,
  ) {}

  /**
   * Generates a comprehensive summary report for a class
   *
   * @param {Request} req - Request object containing user information
   * @param {string} classId - ID of the class to generate a report for
   * @returns {Promise<ClassSummaryReportDto>} The generated class summary report
   */
  @Get('class-summary/:classId')
  @ApiOperation({ summary: 'Gerar relatório de resumo da turma', description: 'Gera um relatório com estatísticas gerais da turma, incluindo média geral, taxa de aprovação e total de alunos.' })
  @ApiParam({ name: 'classId', description: 'ID da turma', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso', type: ClassSummaryReportDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Proibido - professor não tem permissão para esta turma' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  async generateClassSummaryReport(
    @CurrentUser() currentUser: IJwtPayload,
      @Param('classId') classId: string,
  ): Promise<ClassSummaryReportDto> {
    const teacherId = currentUser.sub;
    return this.generateClassSummaryReportUseCase.execute(classId, teacherId);
  }

  /**
   * Generates a report on the distribution of grades for a class
   *
   * @param {Request} req - Request object containing user information
   * @param {string} classId - ID of the class to generate a report for
   * @param {string} [unitId] - Optional ID of a specific unit
   * @returns {Promise<GradeDistributionReportDto>} The generated grade distribution report
   */
  @Get('grade-distribution/:classId')
  @ApiOperation({ summary: 'Gerar relatório de distribuição de notas', description: 'Gera um relatório mostrando a distribuição das notas em diferentes faixas.' })
  @ApiParam({ name: 'classId', description: 'ID da turma', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({
    name: 'unitId', description: 'ID da unidade (opcional)', required: false, example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso', type: GradeDistributionReportDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Proibido - professor não tem permissão para esta turma' })
  @ApiResponse({ status: 404, description: 'Turma ou unidade não encontrada' })
  async generateGradeDistributionReport(
    @CurrentUser() currentUser: IJwtPayload,
      @Param('classId') classId: string,
      @Query('unitId') unitId?: string,
  ): Promise<GradeDistributionReportDto> {
    const teacherId = currentUser.sub;
    return this.generateGradeDistributionReportUseCase.execute(classId, teacherId, unitId);
  }

  /**
   * Generates a report on the top-performing students in a class
   *
   * @param {Request} req - Request object containing user information
   * @param {string} classId - ID of the class to generate a report for
   * @param {number} [count] - Number of top students to include (default: 10)
   * @param {string} [unitId] - Optional ID of a specific unit
   * @returns {Promise<TopStudentsReportDto>} The generated top students report
   */
  @Get('top-students/:classId')
  @ApiOperation({ summary: 'Gerar relatório dos melhores alunos', description: 'Gera um relatório com os alunos de melhor desempenho na turma ou em uma unidade específica.' })
  @ApiParam({ name: 'classId', description: 'ID da turma', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({
    name: 'count', description: 'Número de alunos a incluir (padrão: 10)', required: false, example: 5,
  })
  @ApiQuery({
    name: 'unitId', description: 'ID da unidade (opcional)', required: false, example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso', type: TopStudentsReportDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Proibido - professor não tem permissão para esta turma' })
  @ApiResponse({ status: 404, description: 'Turma ou unidade não encontrada' })
  async generateTopStudentsReport(
    @CurrentUser() currentUser: IJwtPayload,
      @Param('classId') classId: string,
      @Query('count') count?: number,
      @Query('unitId') unitId?: string,
  ): Promise<TopStudentsReportDto> {
    const teacherId = currentUser.sub;
    return this.generateTopStudentsReportUseCase.execute(classId, teacherId, count, unitId);
  }

  /**
   * Generates a detailed statistical report for each unit in a class
   *
   * @param {Request} req - Request object containing user information
   * @param {string} classId - ID of the class to generate a report for
   * @returns {Promise<UnitStatisticsReportDto>} The generated unit statistics report
   */
  @Get('unit-statistics/:classId')
  @ApiOperation({ summary: 'Gerar relatório de estatísticas por unidade', description: 'Gera um relatório com estatísticas básicas por unidade, incluindo nome, média, mediana, menor nota e maior nota.' })
  @ApiParam({ name: 'classId', description: 'ID da turma', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso', type: UnitStatisticsReportDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Proibido - professor não tem permissão para esta turma' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  async generateUnitStatisticsReport(
    @CurrentUser() currentUser: IJwtPayload,
      @Param('classId') classId: string,
  ): Promise<UnitStatisticsReportDto> {
    const teacherId = currentUser.sub;
    return this.generateUnitStatisticsReportUseCase.execute(classId, teacherId);
  }

  /**
   * Gera um relatório de todas as turmas ativas do professor com suas médias
   *
   * @param {IJwtPayload} currentUser - Informações do usuário atual
   * @returns {Promise<TeacherActiveClassesReportDto>} O relatório gerado com turmas ativas e médias
   */
  @Get('teacher-active-classes')
  @ApiOperation({ summary: 'Obter turmas ativas com médias', description: 'Retorna todas as turmas ativas do professor com as médias gerais e por unidade.' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso', type: TeacherActiveClassesReportDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getTeacherActiveClassesReport(
    @CurrentUser() currentUser: IJwtPayload,
  ): Promise<TeacherActiveClassesReportDto> {
    const teacherId = currentUser.sub;
    return this.getTeacherActiveClassesReportUseCase.execute(teacherId);
  }
}
