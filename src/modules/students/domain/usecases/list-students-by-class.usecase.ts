import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

@Injectable()
export class ListStudentsByClassUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(classId: string, teacherId: string): Promise<Student[]> {
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

    return this.studentRepository.findByClassId(classId);
  }
}
