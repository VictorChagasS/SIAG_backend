import {
  Body, Controller, Get, Param, Post, Put, UseGuards,
} from '@nestjs/common';

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
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { UpsertStudentGradesDto } from '../dtos/upsert-student-grades.dto';

// Interfaces para os tipos de retorno
interface IUnitAverageResult {
  studentId: string;
  studentName: string;
  unitId: string;
  unitName: string;
  average: number;
  grades: Array<{
    evaluationItemId: string;
    evaluationItemName: string;
    value: number;
  }>;
}

interface IAllAveragesResult {
  classId: string;
  className: string;
  studentAverages: Array<{
    studentId: string;
    studentName: string;
    average: number;
    unitAverages: Array<{
      unitId: string;
      unitName: string;
      average: number;
    }>;
  }>;
}

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
  async getById(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const grade = await this.getGradeUseCase.execute(id, currentUser.sub);
    return grade;
  }

  @Get('unit/:unitId')
  @UseGuards(JwtAuthGuard)
  async getByUnit(
  @Param('unitId') unitId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const grades = await this.getGradesByUnitUseCase.execute(unitId, currentUser.sub);
    return grades;
  }

  @Get('unit/:unitId/student/:studentId')
  @UseGuards(JwtAuthGuard)
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
  async calculateUnitAverage(
    @Param('unitId') unitId: string,
      @Param('studentId') studentId: string,
      @CurrentUser() currentUser: IJwtPayload,
  ): Promise<IUnitAverageResult> {
    const average = await this.calculateUnitAverageUseCase.execute(
      unitId,
      studentId,
      currentUser.sub,
    );
    return average as IUnitAverageResult;
  }

  @Get('class/:classId/all-averages')
  @UseGuards(JwtAuthGuard)
  async calculateAllAverages(
    @Param('classId') classId: string,
      @CurrentUser() currentUser: IJwtPayload,
  ): Promise<IAllAveragesResult> {
    const allAverages = await this.calculateAllAveragesUseCase.execute(
      currentUser.sub,
      classId,
    );
    return allAverages as IAllAveragesResult;
  }
}
