import {
  Inject, Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

export interface ICreateStudentDTO {
  name: string;
  email?: string;
  registration: string;
  classId: string;
  teacherId: string; // ID do professor que está criando o estudante
}

@Injectable()
export class CreateStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(data: ICreateStudentDTO): Promise<Student> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(data.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== data.teacherId) {
      throw new ConflictException(
        'Você não tem permissão para adicionar estudantes a esta turma',
      );
    }

    // Verificar se já existe um estudante com a mesma matrícula na turma
    const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
      data.registration,
      data.classId,
    );

    if (existingStudent) {
      throw new ConflictException(
        'Já existe um estudante com esta matrícula nesta turma',
      );
    }

    const newStudent = new Student({
      name: data.name,
      email: data.email,
      registration: data.registration,
      classId: data.classId,
    });

    return this.studentRepository.create(newStudent);
  }
}
