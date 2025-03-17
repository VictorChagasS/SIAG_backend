import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { IGradeRepository } from '../repositories/grade-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

interface IUnitAverageResult {
  unitId: string;
  unitName: string;
  average: number;
}

interface IStudentAverageResult {
  studentId: string;
  studentName: string;
  average: number;
  unitAverages: IUnitAverageResult[];
}

@Injectable()
export class CalculateStudentAverageUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
  ) {}

  async execute(studentId: string, classId: string, teacherId: string): Promise<IStudentAverageResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para calcular médias nesta turma',
      );
    }

    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se o estudante pertence à turma
    if (student.classId !== classId) {
      throw new ForbiddenException(
        'Este estudante não pertence à turma',
      );
    }

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        studentId,
        studentName: student.name,
        average: 0,
        unitAverages: [],
      };
    }

    // Calcular a média do estudante em cada unidade
    const unitAverages = await Promise.all(
      units.map(async (unit) => {
        // Buscar todos os itens avaliativos da unidade
        const evaluationItems = await this.evaluationItemRepository.findByUnitId(unit.id);

        // Buscar todas as notas do estudante na unidade
        const grades = await this.gradeRepository.findByStudentAndUnit(studentId, unit.id);

        // Calcular a média do estudante na unidade
        let unitAverage = 0;

        if (unit.typeFormula === 'simple') {
          // Cálculo de média simples (média aritmética)
          if (grades.length > 0) {
            const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
            unitAverage = sum / grades.length;
          }
        } else if (unit.typeFormula === 'personalized' && unit.averageFormula) {
          try {
            // Preparar as variáveis para a fórmula personalizada
            const variables = {};
            evaluationItems.forEach((item, index) => {
              const grade = grades.find((g) => g.evaluationItemId === item.id);
              const value = grade ? grade.value : 0;
              variables[`N${index + 1}`] = value;
            });

            // Avaliar a fórmula personalizada
            const formula = unit.averageFormula;
            let formulaWithValues = formula;

            // Substituir as variáveis pelos valores
            Object.entries(variables).forEach(([name, value]) => {
              const regex = new RegExp(name, 'g');
              formulaWithValues = formulaWithValues.replace(regex, value.toString());
            });

            // Avaliar a fórmula
            // eslint-disable-next-line no-eval
            unitAverage = eval(formulaWithValues);
          } catch (error) {
            throw new Error(`Erro ao calcular a média personalizada para o estudante ${student.name} na unidade ${unit.name}: ${error.message}`);
          }
        }

        return {
          unitId: unit.id,
          unitName: unit.name,
          average: Math.round(unitAverage * 100) / 100,
        };
      }),
    );

    // Calcular a média geral do estudante usando a fórmula da classe
    let studentAverage = 0;

    if (unitAverages.length > 0) {
      if (classEntity.typeFormula === 'simple') {
        // Média simples das unidades
        const sum = unitAverages.reduce((acc, unit) => acc + unit.average, 0);
        studentAverage = sum / unitAverages.length;
      } else if (classEntity.typeFormula === 'personalized' && classEntity.averageFormula) {
        try {
          // Preparar as variáveis para a fórmula personalizada
          const variables = {};
          unitAverages.forEach((unit, index) => {
            variables[`N${index + 1}`] = unit.average;
            variables[`u${index + 1}`] = unit.average;
          });

          // Avaliar a fórmula personalizada
          const formula = classEntity.averageFormula;
          let formulaWithValues = formula;

          // Substituir as variáveis pelos valores
          Object.entries(variables).forEach(([name, value]) => {
            const regex = new RegExp(name, 'g');
            formulaWithValues = formulaWithValues.replace(regex, value.toString());
          });

          // Avaliar a fórmula
          // eslint-disable-next-line no-eval
          studentAverage = eval(formulaWithValues);
        } catch (error) {
          throw new Error(`Erro ao calcular a média personalizada para o estudante ${student.name}: ${error.message}`);
        }
      }

      // Arredondar para 2 casas decimais
      studentAverage = Math.round(studentAverage * 100) / 100;
    }

    return {
      studentId,
      studentName: student.name,
      average: studentAverage,
      unitAverages,
    };
  }
}
