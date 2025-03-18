import { IPaginatedResult, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';

import { Class } from '../entities/class.entity';

export interface IClassRepository {
  create(classData: Class): Promise<Class>;
  findById(id: string): Promise<Class | null>;
  findByTeacherId(teacherId: string, options?: IPaginationNamePeriodSearchOptions): Promise<IPaginatedResult<Class>>;
  findActiveByTeacherId(teacherId: string, name?: string): Promise<Class[]>;
  findAll(): Promise<Class[]>;
  findAllActive(): Promise<Class[]>;
  update(id: string, classData: Partial<Class>): Promise<Class>;
  delete(id: string): Promise<void>;
  findByNamePeriodAndTeacher(name: string, period: string, teacherId: string, section?: number): Promise<Class | null>;
}
