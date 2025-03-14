import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { IStudentRepository } from '../repositories/student-repository.interface';

@Injectable()
export class DeleteStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, teacherId: string): Promise<void> {
    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(student.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir estudantes desta turma',
      );
    }

    await this.studentRepository.delete(id);
  }
}
