import {
  Inject, Injectable, ForbiddenException, NotFoundException,
} from '@nestjs/common';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

interface IGradeItem {
  evaluationItemId: string;
  value: number;
  comments?: string;
}

interface IUpsertStudentGradesRequest {
  studentId: string;
  grades: IGradeItem[];
  teacherId: string;
}

@Injectable()
export class UpsertStudentGradesUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute({
    studentId,
    grades,
    teacherId,
  }: IUpsertStudentGradesRequest): Promise<Grade[]> {
    if (grades.length === 0) {
      return [];
    }

    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(student.classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor tem permissão para a turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Você não tem permissão para criar ou atualizar notas nesta turma');
    }

    // Criar ou atualizar as notas
    const gradesToUpsert = grades.map((grade) => ({
      id: undefined,
      studentId,
      evaluationItemId: grade.evaluationItemId,
      value: grade.value,
      comments: grade.comments,
      createdAt: undefined,
      updatedAt: undefined,
    }));

    const upsertedGrades = await this.gradeRepository.upsertMany(gradesToUpsert);

    return upsertedGrades;
  }
}
