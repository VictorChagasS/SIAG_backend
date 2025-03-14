import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

export interface IUpdateStudentDTO {
  name?: string;
  email?: string;
  registration?: string;
}

@Injectable()
export class UpdateStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, data: IUpdateStudentDTO, teacherId: string): Promise<Student> {
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
        'Você não tem permissão para atualizar estudantes desta turma',
      );
    }

    // Se estiver atualizando a matrícula, verificar se já existe outro estudante com a mesma matrícula na turma
    if (data.registration && data.registration !== student.registration) {
      const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
        data.registration,
        student.classId,
      );

      if (existingStudent && existingStudent.id !== id) {
        throw new ConflictException(
          'Já existe um estudante com esta matrícula nesta turma',
        );
      }
    }

    return this.studentRepository.update(id, data);
  }
}
