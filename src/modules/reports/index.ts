/**
 * Reports Module Index
 *
 * Central export point for the reports module components,
 * making them accessible to other modules in the application.
 *
 * @module Reports
 */
export * from './reports.module';
export * from './domain/usecases/generate-class-summary-report.usecase';
export * from './domain/usecases/generate-grade-distribution-report.usecase';
export * from './domain/usecases/generate-top-students-report.usecase';
export * from './domain/usecases/get-teacher-active-classes-report.usecase';
export * from './presentation/dtos/class-summary-report.dto';
export * from './presentation/dtos/grade-distribution-report.dto';
export * from './presentation/dtos/top-students-report.dto';
export * from './presentation/dtos/unit-statistics-report.dto';
export * from './presentation/dtos/teacher-active-classes-report.dto';
