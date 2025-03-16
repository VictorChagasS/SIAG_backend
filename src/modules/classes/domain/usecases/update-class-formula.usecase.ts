import {
  Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';

import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';
import { validatePersonalizedFormula } from '@/shared/utils/formula-validators';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class, ITypeFormula } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

export interface IUpdateClassFormulaDTO {
  formula?: string;
  typeFormula: ITypeFormula;
}

@Injectable()
export class UpdateClassFormulaUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
  ) {}

  async execute(id: string, data: IUpdateClassFormulaDTO, teacherId: string): Promise<Class> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(id);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta turma',
      );
    }

    // Buscar as unidades da turma (necessário para ambos os tipos de fórmula)
    const units = await this.unitRepository.findByClassId(id);

    if (units.length === 0) {
      throw new BadRequestException('Não é possível definir uma fórmula sem unidades. Crie pelo menos uma unidade primeiro.');
    }

    const formula = data.formula || '';
    const { typeFormula } = data;

    if (typeFormula === 'personalized') {
      // Validar se a fórmula foi fornecida
      if (!formula || formula.trim() === '') {
        throw new BadRequestException('Para fórmulas personalizadas, é necessário fornecer a fórmula.');
      }

      // Validar se a fórmula respeita a quantidade de unidades e é uma expressão matemática válida
      validatePersonalizedFormula(formula, units.length);
    }

    // Atualizar a fórmula de cálculo e o tipo de fórmula
    return this.classRepository.update(id, {
      averageFormula: formula,
      typeFormula,
    });
  }
}
