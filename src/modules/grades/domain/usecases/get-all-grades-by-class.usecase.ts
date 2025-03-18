import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { IGradeRepository } from '../repositories/grade-repository.interface';

interface IGradeDetailResult {
  id: string;
  value: number;
  studentId: string;
  studentName: string;
  evaluationItemId: string;
  evaluationItemName: string;
  unitId: string;
  unitName: string;
}

interface IClassGradesResult {
  classId: string;
  className: string;
  grades: IGradeDetailResult[];
}

@Injectable()
export class GetAllGradesByClassUseCase {
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

  async execute(classId: string, teacherId: string): Promise<IClassGradesResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar as notas desta turma',
      );
    }

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    if (students.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todos os itens avaliativos das unidades
    const evaluationItems = await Promise.all(
      units.map(async (unit) => {
        const items = await this.evaluationItemRepository.findByUnitId(unit.id);
        return items;
      }),
    );

    // Achatar o array de arrays
    const flattenedEvaluationItems = evaluationItems.flat();

    if (flattenedEvaluationItems.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todas as notas dos estudantes para os itens avaliativos
    const grades = await Promise.all(
      students.map(async (student) => {
        // Para cada estudante, buscar as notas de todas as unidades
        const studentGrades = await Promise.all(
          units.map(async (unit) => {
            const gradesForUnit = await this.gradeRepository.findByStudentAndUnit(student.id, unit.id);
            return gradesForUnit;
          }),
        );

        // Achatar o array de arrays
        return studentGrades.flat();
      }),
    );

    // Achatar o array de arrays novamente
    const flattenedGrades = grades.flat();

    if (flattenedGrades.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Mapear as notas para o formato de resposta detalhado
    const gradeDetails = flattenedGrades.map((grade) => {
      const evaluationItem = flattenedEvaluationItems.find((item) => item.id === grade.evaluationItemId);
      const unit = evaluationItem ? units.find((u) => u.id === evaluationItem.unitId) : null;
      const student = students.find((s) => s.id === grade.studentId);

      return {
        id: grade.id,
        value: grade.value,
        studentId: grade.studentId,
        studentName: student ? student.name : 'Estudante Desconhecido',
        evaluationItemId: grade.evaluationItemId,
        evaluationItemName: evaluationItem ? evaluationItem.name : 'Item Avaliativo Desconhecido',
        unitId: evaluationItem ? evaluationItem.unitId : 'Unidade Desconhecida',
        unitName: unit ? unit.name : 'Unidade Desconhecida',
      };
    });

    return {
      classId,
      className: classEntity.name,
      grades: gradeDetails,
    };
  }
}
