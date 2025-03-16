import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { ImportClassWithStudentsUseCase } from '@/modules/classes/domain/usecases/import-class-with-students.usecase';

@Controller('classes')
export class ImportClassWithStudentsController {
  constructor(
    private readonly importClassWithStudentsUseCase: ImportClassWithStudentsUseCase,
  ) {}

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importNewClass(
  @CurrentUser() currentUser: IJwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    // Verificar manualmente se o tipo de arquivo é Excel
    if (!this.isExcelFile(file.mimetype, file.originalname)) {
      throw new Error('O arquivo deve ser uma planilha Excel (.xlsx ou .xls)');
    }

    const result = await this.importClassWithStudentsUseCase.execute({
      teacherId: currentUser.sub,
      file: file.buffer,
    });

    return {
      message: 'Turma criada com sucesso a partir da planilha',
      data: {
        class: {
          id: result.class.id,
          name: result.class.name,
          code: result.class.code,
          period: result.class.period,
        },
        studentsAdded: result.studentsAdded,
        studentsSkipped: result.studentsSkipped,
        errors: result.errors,
      },
    };
  }

  @Post(':classId/import-students')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importStudentsToExistingClass(
  @Param('classId') classId: string,
    @CurrentUser() currentUser: IJwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    // Verificar manualmente se o tipo de arquivo é Excel
    if (!this.isExcelFile(file.mimetype, file.originalname)) {
      throw new Error('O arquivo deve ser uma planilha Excel (.xlsx ou .xls)');
    }

    const result = await this.importClassWithStudentsUseCase.execute({
      teacherId: currentUser.sub,
      existingClassId: classId,
      file: file.buffer,
    });

    return {
      message: 'Estudantes importados com sucesso para a turma',
      data: {
        class: {
          id: result.class.id,
          name: result.class.name,
          code: result.class.code,
          period: result.class.period,
        },
        studentsAdded: result.studentsAdded,
        studentsSkipped: result.studentsSkipped,
        errors: result.errors,
      },
    };
  }

  private isExcelFile(mimetype: string, filename: string): boolean {
    // Verificar pelo MIME type
    const validMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ];

    if (validMimeTypes.includes(mimetype)) {
      return true;
    }

    // Verificar pela extensão do arquivo
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension === 'xlsx' || extension === 'xls';
  }
}
