/**
 * Reports Module
 *
 * Centralizes all components related to generating various types of analytical reports,
 * including controllers, use cases, and their dependencies.
 *
 * @module Reports
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { GradesModule } from '@/modules/grades/grades.module';
import { StudentsModule } from '@/modules/students/students.module';
import { UnitsModule } from '@/modules/units/units.module';

import { GenerateClassSummaryReportUseCase } from './domain/usecases/generate-class-summary-report.usecase';
import { GenerateGradeDistributionReportUseCase } from './domain/usecases/generate-grade-distribution-report.usecase';
import { GenerateTopStudentsReportUseCase } from './domain/usecases/generate-top-students-report.usecase';
import { GenerateUnitStatisticsReportUseCase } from './domain/usecases/generate-unit-statistics-report.usecase';
import { GetTeacherActiveClassesReportUseCase } from './domain/usecases/get-teacher-active-classes-report.usecase';
import { ReportsController } from './presentation/controllers/reports.controller';

/**
 * Module that provides functionality for generating various analytical reports
 * about class performance, student achievements, and grade distributions.
 *
 * @class ReportsModule
 * @reports Module
 */
@Module({
  imports: [
    AuthModule,
    ClassesModule,
    GradesModule,
    StudentsModule,
    UnitsModule,
  ],
  controllers: [ReportsController],
  providers: [
    GenerateClassSummaryReportUseCase,
    GenerateGradeDistributionReportUseCase,
    GenerateTopStudentsReportUseCase,
    GenerateUnitStatisticsReportUseCase,
    GetTeacherActiveClassesReportUseCase,
  ],
  exports: [
    GenerateClassSummaryReportUseCase,
    GenerateGradeDistributionReportUseCase,
    GenerateTopStudentsReportUseCase,
    GenerateUnitStatisticsReportUseCase,
    GetTeacherActiveClassesReportUseCase,
  ],
})
export class ReportsModule {}
