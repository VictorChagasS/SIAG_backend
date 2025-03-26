import { Injectable } from '@nestjs/common';

import { Grade } from '@/modules/grades/domain/entities/grade.entity';
import { IGradeRepository } from '@/modules/grades/domain/repositories/grade-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaGradeRepository implements IGradeRepository {
  constructor(private prisma: PrismaService) {}

  async create(gradeData: Grade): Promise<Grade> {
    const createdGrade = await this.prisma.grade.upsert({
      where: {
        studentId_evaluationItemId: {
          studentId: gradeData.studentId,
          evaluationItemId: gradeData.evaluationItemId,
        },
      },
      update: {
        value: gradeData.value,
        comments: gradeData.comments,
      },
      create: {
        studentId: gradeData.studentId,
        evaluationItemId: gradeData.evaluationItemId,
        value: gradeData.value,
        comments: gradeData.comments,
      },
    });

    return createdGrade;
  }

  async upsertMany(gradesData: Grade[]): Promise<Grade[]> {
    // Como o Prisma não suporta upsertMany, vamos fazer em transação
    const result = await this.prisma.$transaction(
      gradesData.map((gradeData) => this.prisma.grade.upsert({
        where: {
          studentId_evaluationItemId: {
            studentId: gradeData.studentId,
            evaluationItemId: gradeData.evaluationItemId,
          },
        },
        update: {
          value: gradeData.value,
          comments: gradeData.comments,
        },
        create: {
          studentId: gradeData.studentId,
          evaluationItemId: gradeData.evaluationItemId,
          value: gradeData.value,
          comments: gradeData.comments,
        },
      })),
    );

    return result;
  }

  async findById(id: string): Promise<Grade | null> {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
    });

    if (!grade) return null;

    return grade;
  }

  async findByStudentAndEvaluationItem(
    studentId: string,
    evaluationItemId: string,
  ): Promise<Grade | null> {
    const grade = await this.prisma.grade.findUnique({
      where: {
        studentId_evaluationItemId: {
          studentId,
          evaluationItemId,
        },
      },
    });

    if (!grade) return null;

    return grade;
  }

  async findByEvaluationItem(evaluationItemId: string): Promise<Grade[]> {
    const grades = await this.prisma.grade.findMany({
      where: { evaluationItemId },
      orderBy: { createdAt: 'asc' },
    });

    return grades;
  }

  async findByStudentAndUnit(studentId: string, unitId: string): Promise<Grade[]> {
    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        evaluationItem: {
          unitId,
        },
      },
      include: {
        evaluationItem: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return grades;
  }

  async findByUnit(unitId: string): Promise<Grade[]> {
    const grades = await this.prisma.grade.findMany({
      where: {
        evaluationItem: {
          unitId,
        },
      },
      include: {
        evaluationItem: true,
        student: true,
      },
      orderBy: [
        { student: { name: 'asc' } },
        { evaluationItem: { name: 'asc' } },
      ],
    });

    return grades;
  }

  async update(id: string, gradeData: Partial<Grade>): Promise<Grade> {
    const updatedGrade = await this.prisma.grade.update({
      where: { id },
      data: {
        value: gradeData.value,
        comments: gradeData.comments,
      },
    });

    return updatedGrade;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.grade.delete({
      where: { id },
    });
  }
}
