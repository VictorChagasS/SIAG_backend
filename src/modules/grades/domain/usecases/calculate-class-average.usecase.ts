import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { IGradeRepository } from '../repositories/grade-repository.interface';

interface IClassAverageResult {
  classId: string;
  className: string;
  studentAverages: Array<{
    studentId: string;
    studentName: string;
    studentRegistration: string;
    average: number;
    unitAverages: Array<{
      unitId: string;
      unitName: string;
      average: number;
    }>;
  }>;
}

@Injectable()
export class CalculateClassAverageUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
  ) {}

  async execute(classId: string, teacherId: string): Promise<IClassAverageResult> {
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

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        classId,
        className: classEntity.name,
        studentAverages: [],
      };
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    if (students.length === 0) {
      return {
        classId,
        className: classEntity.name,

        studentAverages: [],
      };
    }

    // Calcular a média de cada estudante em cada unidade
    const studentAverages = await Promise.all(
      students.map(async (student) => {
        const unitAverages = await Promise.all(
          units.map(async (unit) => {
            // Buscar todas as notas do estudante na unidade
            const grades = await this.gradeRepository.findByStudentAndUnit(student.id, unit.id);

            // Calcular a média da unidade
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
                grades.forEach((grade) => {
                  // Usar o ID do item avaliativo como variável na fórmula
                  variables[`item_${grade.evaluationItemId}`] = grade.value;
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
                // Em caso de erro, usar média simples
                if (grades.length > 0) {
                  const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
                  unitAverage = sum / grades.length;
                }
              }
            }

            // Arredondar para 2 casas decimais
            unitAverage = Math.round(unitAverage * 100) / 100;

            return {
              unitId: unit.id,
              unitName: unit.name,
              average: unitAverage,
            };
          }),
        );

        // Calcular a média geral do estudante
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
              unitAverages.forEach((unitAvg, index) => {
                // Usar o nome da unidade como variável na fórmula
                const varName = unitAvg.unitName.replace(/\s+/g, '_').toLowerCase();
                variables[varName] = unitAvg.average;
                // Também disponibilizar por índice (u1, u2, etc.)
                variables[`u${index + 1}`] = unitAvg.average;
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
              // Em caso de erro, usar média simples
              const sum = unitAverages.reduce((acc, unit) => acc + unit.average, 0);
              studentAverage = sum / unitAverages.length;
            }
          }
        }

        // Arredondar para 2 casas decimais
        studentAverage = Math.round(studentAverage * 100) / 100;

        return {
          studentId: student.id,
          studentName: student.name,
          studentRegistration: student.registration,
          average: studentAverage,
          unitAverages,
        };
      }),
    );

    return {
      classId,
      className: classEntity.name,
      studentAverages,
    };
  }
}
