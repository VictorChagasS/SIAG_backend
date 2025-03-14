import { Student } from '../entities/student.entity';

export interface IStudentRepository {
  create(studentData: Student): Promise<Student>;
  findById(id: string): Promise<Student | null>;
  findByClassId(classId: string): Promise<Student[]>;
  findByRegistrationAndClassId(registration: string, classId: string): Promise<Student | null>;
  update(id: string, studentData: Partial<Student>): Promise<Student>;
  delete(id: string): Promise<void>;
}
