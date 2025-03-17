import { Student } from '../entities/student.entity';

export interface IStudentWithAverage extends Student {
  average: number;
}
