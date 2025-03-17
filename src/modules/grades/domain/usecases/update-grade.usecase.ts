import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

interface IUpdateGradeRequest {
  id: string;
  value: number;
  comments?: string;
  teacherId: string;
}

@Injectable()
export class UpdateGradeUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute({
    id,
    value,
    comments,
    teacherId,
  }: IUpdateGradeRequest): Promise<Grade> {
    // Verificar se a nota existe
    const grade = await this.gradeRepository.findById(id);
    if (!grade) {
      throw new NotFoundException('Nota não encontrada');
    }

    // Verificar se o item avaliativo existe
    const evaluationItem = await this.evaluationItemRepository.findById(grade.evaluationItemId);
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
        'Você não tem permissão para atualizar notas nesta turma',
      );
    }

    // Atualizar a nota
    const updatedGrade = await this.gradeRepository.update(id, {
      value,
      comments,
    });

    return updatedGrade;
  }
}
