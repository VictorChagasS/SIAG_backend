import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

@Injectable()
export class GetStudentGradesByUnitUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
  ) {}

  async execute(unitId: string, studentId: string, teacherId: string): Promise<Grade[]> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(unitId);
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
        'Você não tem permissão para visualizar notas nesta turma',
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
        'Este estudante não pertence à turma da unidade',
      );
    }

    // Buscar todas as notas do estudante na unidade
    const grades = await this.gradeRepository.findByStudentAndUnit(studentId, unitId);

    return grades;
  }
}
