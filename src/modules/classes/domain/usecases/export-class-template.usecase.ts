/**
 * Export Class Template Use Case
 *
 * This use case handles the generation and export of class templates with student
 * information and grade averages in Excel format.
 *
 * @module ClassUseCases
 */
import * as path from 'path';

import {
  ForbiddenException, Inject, Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Use case for exporting class data to an Excel template
 *
 * Handles the creation of an Excel file containing class information,
 * student data, and grade averages based on a predefined template.
 *
 * @class ExportClassTemplateUseCase
 */
@Injectable()
export class ExportClassTemplateUseCase {
  /**
   * Creates an instance of ExportClassTemplateUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Use case for calculating student grade averages
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

  /**
   * Executes the class template export process
   *
   * Generates an Excel file with class and student information based on a predefined template.
   * Validates that the class exists, the teacher has permission, and there are sufficient units.
   *
   * @param {string} classId - ID of the class to export
   * @param {string} teacherId - ID of the teacher requesting the export (for authorization)
   * @returns {Promise<Buffer>} Excel file as a buffer
   * @throws {NotFoundException} If the class doesn't exist
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @throws {BadRequestException} If there aren't at least 3 units
   */
  async execute(classId: string, teacherId: string): Promise<Buffer> {
    // Buscar os dados da turma
    const classEntity = await this.classRepository.findById(classId);

    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Você não tem permissão para exportar esta turma');
    }

    // Obter as médias dos alunos usando o CalculateAllAveragesUseCase
    const classAverages = await this.calculateAllAveragesUseCase.execute(teacherId, classId);

    // Verificar se existem pelo menos 3 unidades
    const anyStudent = classAverages.studentAverages[0];
    if (!anyStudent || anyStudent.unitAverages.length < 3) {
      throw new BadRequestException('É necessário ter pelo menos 3 unidades e 10 alunos para exportar a turma');
    }

    // Caminho para o arquivo template.xlsx
    const templatePath = path.resolve(process.cwd(), 'src/common/utils/template.xlsx');

    try {
      // Criar um novo workbook
      const workbook = new ExcelJS.Workbook();

      // Carregar o template
      await workbook.xlsx.readFile(templatePath);

      // Obter a primeira worksheet
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('Planilha não encontrada no template');
      }

      // Formatar o cabeçalho da turma: "CÓDIGO - NOME TURMA EM MAIÚSCULO - Turma: (Section) (Período)"
      const headerText = `${classEntity.code || ''} - ${classEntity.name.toUpperCase()} - Turma: 0${classEntity.section || 1} (${classEntity.period})`;

      // Inserir na linha 3
      const headerCell = worksheet.getCell('B3');
      headerCell.value = headerText;

      // Preencher os dados dos alunos e suas médias
      if (classAverages.studentAverages.length > 0) {
        classAverages.studentAverages.forEach((student, index) => {
          // A linha inicial é 11, e cada aluno ocupa uma linha
          const row = 11 + index;

          // Coluna B para matrícula do aluno
          worksheet.getCell(`B${row}`).value = student.studentRegistration;

          // Coluna C para nome do aluno
          worksheet.getCell(`C${row}`).value = student.studentName;

          // Preencher apenas as três primeiras unidades (D, E, F)
          for (let unitIndex = 0; unitIndex < 3 && unitIndex < student.unitAverages.length; unitIndex += 1) {
            const unitAverage = student.unitAverages[unitIndex];
            // Convertemos o índice da unidade para a coluna correspondente (D=0, E=1, F=2)
            const col = String.fromCharCode(68 + unitIndex); // 68 é o código ASCII para 'D'
            worksheet.getCell(`${col}${row}`).value = unitAverage.average;
          }
        });
      }

      // Converter para buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return Buffer.from(buffer);
    } catch (error) {
      throw new Error(`Erro ao processar o arquivo de template: ${error.message}`);
    }
  }
}
