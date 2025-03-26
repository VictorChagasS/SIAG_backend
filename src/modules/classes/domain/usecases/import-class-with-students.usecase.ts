import {
  Inject, Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { Student } from '@/modules/students/domain/entities/student.entity';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * DTO for importing a class with students from an Excel file
 *
 * Contains the necessary data for importing a class and its students
 * from an Excel file.
 *
 * @interface IImportClassWithStudentsDTO
 */
export interface IImportClassWithStudentsDTO {
  teacherId: string;
  file: Buffer;
  existingClassId?: string; // Opcional: se fornecido, adiciona estudantes a uma turma existente
}

/**
 * Result object for importing a class with students
 *
 * Contains the imported class, the number of students added,
 * the number of students skipped, and any errors encountered.
 *
 * @interface IImportClassWithStudentsResult
 */
export interface IImportClassWithStudentsResult {
  class: Class;
  studentsAdded: number;
  studentsSkipped: number;
  errors: string[];
}

/**
 * Use case for importing a class with students from an Excel file
 *
 * Handles the import of a class and its students from an Excel file,
 * including validation and processing of the data.
 *
 * @Injectable()
 */
@Injectable()
export class ImportClassWithStudentsUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
  ) {}

  async execute(data: IImportClassWithStudentsDTO): Promise<IImportClassWithStudentsResult> {
    // Load the Excel file
    const workbook = new ExcelJS.Workbook();
    try {
      // Convert the Buffer to Uint8Array for compatibility
      const buffer = Buffer.from(data.file);
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (error) {
      throw new BadRequestException('Arquivo Excel inválido ou corrompido');
    }

    const worksheet = workbook.getWorksheet(1); // Get the first worksheet
    if (!worksheet) {
      throw new BadRequestException('Planilha não encontrada no arquivo');
    }

    let classToUse: Class;

    // If an existing class ID was provided, use that class
    if (data.existingClassId) {
      const existingClass = await this.classRepository.findById(data.existingClassId);

      if (!existingClass) {
        throw new BadRequestException('Turma não encontrada');
      }

      // Check if the teacher is the owner of the class
      if (existingClass.teacherId !== data.teacherId) {
        throw new BadRequestException('You do not have permission to add students to this class');
      }

      classToUse = existingClass;
    } else {
      // Otherwise, extract class information from the header of the worksheet and create a new class
      const classInfo = this.extractClassInfoFromHeader(worksheet);

      // Check if a class with the same name and period already exists for this teacher
      const existingClass = await this.classRepository.findByNamePeriodAndTeacher(
        classInfo.name,
        classInfo.period,
        data.teacherId,
      );

      if (existingClass) {
        throw new ConflictException(
          'Você já possui uma turma com este nome neste período',
        );
      }

      // Create the new class
      const newClass = new Class({
        name: classInfo.name,
        code: classInfo.code,
        period: classInfo.period,
        teacherId: data.teacherId,
      });

      classToUse = await this.classRepository.create(newClass);
    }

    // Process the students from the worksheet
    const studentsResult = await this.processStudents(worksheet, classToUse.id);

    return {
      class: classToUse,
      studentsAdded: studentsResult.studentsAdded,
      studentsSkipped: studentsResult.studentsSkipped,
      errors: studentsResult.errors,
    };
  }

  private extractClassInfoFromHeader(worksheet: ExcelJS.Worksheet): { name: string; code: string; period: string } {
    // Try to extract information from the header of the worksheet
    // Example: "PLANILHA DE NOTAS" in the first row
    // "COMP0439 - ENGENHARIA DE SOFTWARE II - Turma: 02 (2024.2)" in the second row

    // Check the second row to extract class information
    const infosClass = worksheet.getRow(3).values[2].split(' - ');
    const code = String(infosClass[0]);
    const name = String(infosClass[1]);
    const rest = String(infosClass[2]).split('Turma: ')[1];
    const period = rest.split(' ')[1].replace(/[()]/g, '');

    if (!period.match(/^\d{4}\.\d$/)) {
      throw new BadRequestException('Período inválido');
    }

    if (!code.match(/^[A-Z0-9]+$/)) {
      throw new BadRequestException('Código da turma inválido');
    }

    return { name, code, period };
  }

  private async processStudents(worksheet: ExcelJS.Worksheet, classId: string) {
    const result = {
      studentsAdded: 0,
      studentsSkipped: 0,
      errors: [],
    };

    // Check if the 10th row contains the expected headers (Matrícula and Nome)
    const headerRow = worksheet.getRow(10);
    // Find the columns of matrícula and nome
    let matriculaColIndex = -1;
    let nomeColIndex = -1;

    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const value = String(cell.value).toLowerCase().trim();
      if (value === 'matrícula') {
        matriculaColIndex = colNumber;
      } else if (value === 'nome') {
        nomeColIndex = colNumber;
      }
    });

    // If the columns are not found, return an error
    if (matriculaColIndex === -1 || nomeColIndex === -1) {
      result.errors.push('Formato de planilha inválido. A linha 10 deve conter as colunas "Matrícula" e "Nome".');
      return result;
    }

    // Process the students from the 11th row
    const startRow = 11;
    const validRows = [];

    // First, collect all valid rows
    for (let rowIndex = startRow; rowIndex <= worksheet.rowCount; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);

      // Skip empty rows
      if (row.cellCount === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const matricula = String(row.getCell(matriculaColIndex).value || '').trim();
      const nome = String(row.getCell(nomeColIndex).value || '').trim();

      // Skip rows without matrícula or nome
      if (!matricula || !nome) {
        // eslint-disable-next-line no-continue
        continue;
      }

      validRows.push({ rowIndex, matricula, nome });
    }

    // Now process all valid rows at once
    await Promise.all(validRows.map(async ({ rowIndex, matricula, nome }) => {
      try {
        // Check if the student already exists in the class
        const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
          matricula,
          classId,
        );

        if (existingStudent) {
          result.studentsSkipped += 1;
          return;
        }

        // Create the new student
        const newStudent = new Student({
          name: nome,
          registration: matricula,
          classId,
        });

        await this.studentRepository.create(newStudent);
        result.studentsAdded += 1;
      } catch (error) {
        result.errors.push(`Linha ${rowIndex}: ${error.message}`);
        result.studentsSkipped += 1;
      }
    }));

    return result;
  }
}
