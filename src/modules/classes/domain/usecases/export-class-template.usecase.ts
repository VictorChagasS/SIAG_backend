import * as path from 'path';

import {
  ForbiddenException, Inject, Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { IClassRepository } from '../repositories/class-repository.interface';

import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';

@Injectable()
export class ExportClassTemplateUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

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
      throw new BadRequestException('É necessário ter pelo menos 3 unidades para exportar o template');
    }

    // Caminho para o arquivo template.xlsx
    const templatePath = path.resolve(process.cwd(), 'src/shared/utils/template.xlsx');

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
