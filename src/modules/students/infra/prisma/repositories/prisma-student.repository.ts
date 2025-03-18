import { Injectable } from '@nestjs/common';

import { Student } from '@/modules/students/domain/entities/student.entity';
import { IStudentRepository, IStudentSearchOptions } from '@/modules/students/domain/repositories/student-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaStudentRepository implements IStudentRepository {
  constructor(private prisma: PrismaService) {}

  async create(studentData: Student): Promise<Student> {
    const createdStudent = await this.prisma.student.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        registration: studentData.registration,
        classId: studentData.classId,
      },
    });

    return createdStudent;
  }

  async findById(id: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) return null;

    return student;
  }

  async findByClassId(
    classId: string,
    options?: IStudentSearchOptions,
  ): Promise<Student[]> {
    const { search } = options || {};

    const whereClause: any = { classId };

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          registration: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const students = await this.prisma.student.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    return students;
  }

  async findByRegistrationAndClassId(
    registration: string,
    classId: string,
  ): Promise<Student | null> {
    const student = await this.prisma.student.findFirst({
      where: {
        registration,
        classId,
      },
    });

    if (!student) return null;

    return student;
  }

  async update(id: string, studentData: Partial<Student>): Promise<Student> {
    const { classId, ...updateData } = studentData;

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateData,
    });

    return updatedStudent;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({
      where: { id },
    });
  }
}
