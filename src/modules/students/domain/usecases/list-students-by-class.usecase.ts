import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateStudentAverageUseCase } from '@/modules/grades/domain/usecases/calculate-student-average.usecase';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { IStudentRepository } from '../repositories/student-repository.interface';
import { IStudentWithAverage } from '../types/student.types';

@Injectable()
export class ListStudentsByClassUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateStudentAverageUseCase: CalculateStudentAverageUseCase,
  ) {}

  async execute(classId: string, teacherId: string): Promise<IStudentWithAverage[]> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar os estudantes desta turma',
      );
    }

    // Buscar os estudantes
    const students = await this.studentRepository.findByClassId(classId);

    // Calcular a média de cada aluno
    const studentsWithAverages = await Promise.all(
      students.map(async (student) => {
        const average = await this.calculateStudentAverageUseCase.execute(
          student.id,
          classId,
          teacherId,
        );

        return {
          ...student,
          average: average.average,
        };
      }),
    );

    return studentsWithAverages;
  }
}
