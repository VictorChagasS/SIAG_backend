import {
  Inject, Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

interface ICreateGradeRequest {
  studentId: string;
  evaluationItemId: string;
  value: number;
  comments?: string;
  teacherId: string;
}

@Injectable()
export class CreateGradeUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute({
    studentId,
    evaluationItemId,
    value,
    comments,
    teacherId,
  }: ICreateGradeRequest): Promise<Grade> {
    // Verificar se o item avaliativo existe
    const evaluationItem = await this.evaluationItemRepository.findById(evaluationItemId);
    if (!evaluationItem) {
      throw new NotFoundException('Item avaliativo não encontrado');
    }

    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(evaluationItem.unitId);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(unit.classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para criar notas nesta turma',
      );
    }

    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se o estudante pertence à turma
    if (student.classId !== classEntity.id) {
      throw new ForbiddenException(
        'Este estudante não pertence à turma do item avaliativo',
      );
    }

    // Verificar se já existe uma nota para este estudante e item avaliativo
    const existingGrade = await this.gradeRepository.findByStudentAndEvaluationItem(
      studentId,
      evaluationItemId,
    );

    if (existingGrade) {
      throw new ConflictException(
        'Já existe uma nota para este estudante e item avaliativo',
      );
    }

    // Criar a nota
    const grade = await this.gradeRepository.create({
      id: undefined,
      studentId,
      evaluationItemId,
      value,
      comments,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return grade;
  }
}
