import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

@Injectable()
export class GetStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    return student;
  }
}
