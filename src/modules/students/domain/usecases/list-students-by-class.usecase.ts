import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateStudentAverageUseCase } from '@/modules/grades/domain/usecases/calculate-student-average.usecase';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { IStudentRepository, IStudentSearchOptions } from '../repositories/student-repository.interface';
import { IStudentWithAverage } from '../types/student.types';

export interface IListStudentsByClassParams {
  classId: string;
  teacherId: string;
  search?: string;
}

@Injectable()
export class ListStudentsByClassUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateStudentAverageUseCase: CalculateStudentAverageUseCase,
  ) {}

  async execute({
    classId,
    teacherId,
    search,
  }: IListStudentsByClassParams): Promise<IStudentWithAverage[]> {
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

    // Opções de busca
    const options: IStudentSearchOptions = {
      search,
    };

    // Buscar os estudantes
    const students = await this.studentRepository.findByClassId(classId, options);

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
