import { Grade } from '../entities/grade.entity';

export interface IGradeRepository {
  create(gradeData: Grade): Promise<Grade>;
  upsertMany(gradesData: Grade[]): Promise<Grade[]>;
  findById(id: string): Promise<Grade | null>;
  findByStudentAndEvaluationItem(studentId: string, evaluationItemId: string): Promise<Grade | null>;
  findByEvaluationItem(evaluationItemId: string): Promise<Grade[]>;
  findByStudentAndUnit(studentId: string, unitId: string): Promise<Grade[]>;
  findByUnit(unitId: string): Promise<Grade[]>;
  update(id: string, gradeData: Partial<Grade>): Promise<Grade>;
  delete(id: string): Promise<void>;
}
