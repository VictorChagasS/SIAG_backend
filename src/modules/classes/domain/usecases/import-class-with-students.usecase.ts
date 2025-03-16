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

export interface IImportClassWithStudentsDTO {
  teacherId: string;
  file: Buffer;
  existingClassId?: string; // Opcional: se fornecido, adiciona estudantes a uma turma existente
}

export interface IImportClassWithStudentsResult {
  class: Class;
  studentsAdded: number;
  studentsSkipped: number;
  errors: string[];
}

@Injectable()
export class ImportClassWithStudentsUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
  ) {}

  async execute(data: IImportClassWithStudentsDTO): Promise<IImportClassWithStudentsResult> {
    // Processar o arquivo Excel
    const workbook = new ExcelJS.Workbook();
    try {
      // Convertendo o Buffer para Uint8Array para compatibilidade
      const buffer = Buffer.from(data.file);
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (error) {
      throw new BadRequestException('Arquivo Excel inválido ou corrompido');
    }

    const worksheet = workbook.getWorksheet(1); // Pega a primeira planilha
    if (!worksheet) {
      throw new BadRequestException('Planilha não encontrada no arquivo');
    }

    let classToUse: Class;

    // Se um ID de turma existente foi fornecido, usar essa turma
    if (data.existingClassId) {
      const existingClass = await this.classRepository.findById(data.existingClassId);

      if (!existingClass) {
        throw new BadRequestException('Turma não encontrada');
      }

      // Verificar se o professor é o dono da turma
      if (existingClass.teacherId !== data.teacherId) {
        throw new BadRequestException('Você não tem permissão para adicionar estudantes a esta turma');
      }

      classToUse = existingClass;
    } else {
      // Caso contrário, extrair informações da turma do cabeçalho da planilha e criar uma nova
      const classInfo = this.extractClassInfoFromHeader(worksheet);

      // Verificar se já existe uma turma com o mesmo nome e período para este professor
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

      // Criar a nova turma
      const newClass = new Class({
        name: classInfo.name,
        code: classInfo.code,
        period: classInfo.period,
        teacherId: data.teacherId,
      });

      classToUse = await this.classRepository.create(newClass);
    }

    // Processar os estudantes da planilha
    const studentsResult = await this.processStudents(worksheet, classToUse.id);

    return {
      class: classToUse,
      studentsAdded: studentsResult.studentsAdded,
      studentsSkipped: studentsResult.studentsSkipped,
      errors: studentsResult.errors,
    };
  }

  private extractClassInfoFromHeader(worksheet: ExcelJS.Worksheet): { name: string; code: string; period: string } {
    // Tentar extrair informações do cabeçalho da planilha
    // Exemplo: "PLANILHA DE NOTAS" na primeira linha
    // "COMP0439 - ENGENHARIA DE SOFTWARE II - Turma: 02 (2024.2)" na segunda linha

    // Verificar a segunda linha para extrair informações da turma
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

    // Verificar se a linha 10 contém os cabeçalhos esperados (Matrícula e Nome)
    const headerRow = worksheet.getRow(10);
    // Encontrar as colunas de matrícula e nome
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

    if (matriculaColIndex === -1 || nomeColIndex === -1) {
      result.errors.push('Formato de planilha inválido. A linha 10 deve conter as colunas "Matrícula" e "Nome".');
      return result;
    }

    // Processar os estudantes a partir da linha 11
    const startRow = 11;
    const validRows = [];

    // Primeiro, coletamos todas as linhas válidas
    for (let rowIndex = startRow; rowIndex <= worksheet.rowCount; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);

      // Pular linhas vazias
      if (row.cellCount === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const matricula = String(row.getCell(matriculaColIndex).value || '').trim();
      const nome = String(row.getCell(nomeColIndex).value || '').trim();

      // Pular linhas sem matrícula ou nome
      if (!matricula || !nome) {
        // eslint-disable-next-line no-continue
        continue;
      }

      validRows.push({ rowIndex, matricula, nome });
    }

    // Agora processamos todas as linhas válidas de uma vez
    await Promise.all(validRows.map(async ({ rowIndex, matricula, nome }) => {
      try {
        // Verificar se o estudante já existe na turma
        const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
          matricula,
          classId,
        );

        if (existingStudent) {
          result.studentsSkipped += 1;
          return;
        }

        // Criar o novo estudante
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
