import { Injectable } from '@nestjs/common';

import { Student } from '@/modules/students/domain/entities/student.entity';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
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

  async findByClassId(classId: string): Promise<Student[]> {
    const students = await this.prisma.student.findMany({
      where: { classId },
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
    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: studentData,
    });

    return updatedStudent;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({
      where: { id },
    });
  }
}
