import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

import { CalculateStudentAverageUseCase } from './calculate-student-average.usecase';

interface IUnitAverageResult {
  unitId: string;
  unitName: string;
  average: number;
}

interface IStudentAverageResult {
  studentId: string;
  studentName: string;
  average: number;
  unitAverages: IUnitAverageResult[];
}

interface IAllAveragesResult {
  classId: string;
  className: string;
  studentAverages: IStudentAverageResult[];
}

@Injectable()
export class CalculateAllAveragesUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateStudentAverageUseCase: CalculateStudentAverageUseCase,
  ) {}

  async execute(teacherId: string, classId: string): Promise<IAllAveragesResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para calcular médias nesta turma',
      );
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    if (students.length === 0) {
      return {
        classId,
        className: classEntity.name,
        studentAverages: [],
      };
    }

    // Calcular a média para cada estudante
    const studentAverages = await Promise.all(
      students.map(async (student) => {
        const average = await this.calculateStudentAverageUseCase.execute(
          student.id,
          classId,
          teacherId,
        );

        return {
          studentId: student.id,
          studentName: student.name,
          average: average.average,
          unitAverages: average.unitAverages,
        };
      }),
    );

    return {
      classId,
      className: classEntity.name,
      studentAverages,
    };
  }
}
