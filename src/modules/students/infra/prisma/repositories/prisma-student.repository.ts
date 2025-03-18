import { Injectable } from '@nestjs/common';

import { Student } from '@/modules/students/domain/entities/student.entity';
import { IStudentRepository, IStudentSearchOptions } from '@/modules/students/domain/repositories/student-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Prisma implementation of the Student Repository
 * Handles database operations for students using Prisma ORM
 *
 * @class PrismaStudentRepository
 * @implements {IStudentRepository}
 */
@Injectable()
export class PrismaStudentRepository implements IStudentRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new student in the database
   *
   * @param {Student} studentData - The student data to create
   * @returns {Promise<Student>} The created student
   */
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

  /**
   * Finds a student by its ID
   *
   * @param {string} id - The student ID
   * @returns {Promise<Student | null>} The student if found, null otherwise
   */
  async findById(id: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) return null;

    return student;
  }

  /**
   * Finds all students from a specific class, with optional search filtering
   * This method enables searching students by either name or registration number
   *
   * @param {string} classId - The class ID to search students for
   * @param {IStudentSearchOptions} [options] - Optional search parameters
   * @returns {Promise<Student[]>} Array of students matching the criteria
   */
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

  /**
   * Finds a student by registration number within a specific class
   *
   * @param {string} registration - The registration number to search for
   * @param {string} classId - The class ID to search in
   * @returns {Promise<Student | null>} The student if found, null otherwise
   */
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

  /**
   * Updates a student's information
   *
   * @param {string} id - The student ID to update
   * @param {Partial<Student>} studentData - The data to update
   * @returns {Promise<Student>} The updated student
   */
  async update(id: string, studentData: Partial<Student>): Promise<Student> {
    const { classId, ...updateData } = studentData;

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateData,
    });

    return updatedStudent;
  }

  /**
   * Deletes a student from the database
   *
   * @param {string} id - The student ID to delete
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({
      where: { id },
    });
  }
}
