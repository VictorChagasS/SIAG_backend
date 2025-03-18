/**
 * Import Class With Students Controller
 *
 * Controller responsible for handling HTTP requests related to importing
 * classes and their students from Excel files. This provides a convenient
 * way to create classes and add multiple students at once.
 *
 * @module ClassesController
 */
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
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody,
} from '@nestjs/swagger';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { ImportClassWithStudentsUseCase } from '@/modules/classes/domain/usecases/import-class-with-students.usecase';
import { ImportResultDto } from '@/modules/classes/presentation/dtos/import-result.dto';

@ApiTags('classes')
@Controller('classes')
/**
 * Controller for handling class and student import from Excel files
 *
 * Provides endpoints for:
 * - Creating a new class with students from an Excel file
 * - Adding students to an existing class from an Excel file
 *
 * @class ImportClassWithStudentsController
 */
export class ImportClassWithStudentsController {
  /**
   * Creates an ImportClassWithStudentsController instance with injected use cases
   *
   * @param {ImportClassWithStudentsUseCase} importClassWithStudentsUseCase - Use case for importing classes with students
   */
  constructor(
    private readonly importClassWithStudentsUseCase: ImportClassWithStudentsUseCase,
  ) {}

  /**
   * Imports a new class with students from an Excel file
   *
   * @param {IJwtPayload} currentUser - The authenticated user
   * @param {Express.Multer.File} file - The uploaded Excel file
   * @returns {Promise<Object>} Import result with class details and student counts
   * @throws {Error} If the file is not a valid Excel file or contains invalid data
   */
  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Importar nova turma com estudantes',
    description: 'Importa uma nova turma com estudantes a partir de um arquivo Excel',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo Excel (.xlsx ou .xls) com os dados da turma e estudantes',
        },
      },
    },
  })
  @ApiResponseWrapped(ImportResultDto)
  @ApiErrorResponse(400, 'Arquivo inválido ou dados incorretos', 'INVALID_DATA', 'Dados inválidos')
  @ApiErrorResponse(403, 'Acesso negado', 'FORBIDDEN', 'Acesso negado')
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

  /**
   * Imports students to an existing class from an Excel file
   *
   * @param {string} classId - ID of the existing class to add students to
   * @param {IJwtPayload} currentUser - The authenticated user
   * @param {Express.Multer.File} file - The uploaded Excel file
   * @returns {Promise<Object>} Import result with class details and student counts
   * @throws {Error} If the file is not a valid Excel file or contains invalid data
   * @throws {NotFoundException} If the class doesn't exist
   * @throws {ForbiddenException} If the user doesn't have permission to modify the class
   */
  @Post(':classId/import-students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Importar estudantes para turma existente',
    description: 'Importa estudantes para uma turma existente a partir de um arquivo Excel',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo Excel (.xlsx ou .xls) com os dados dos estudantes',
        },
      },
    },
  })
  @ApiResponseWrapped(ImportResultDto)
  @ApiErrorResponse(400, 'Arquivo inválido ou dados incorretos', 'INVALID_DATA', 'Dados inválidos')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(403, 'Você não tem permissão para acessar esta turma', 'FORBIDDEN', 'Acesso negado')
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

  /**
   * Validates if a file is an Excel spreadsheet
   *
   * Checks both the mimetype and file extension to determine if the file
   * is a valid Excel file (.xlsx or .xls)
   *
   * @param {string} mimetype - The MIME type of the file
   * @param {string} filename - The original filename with extension
   * @returns {boolean} True if the file is an Excel file, false otherwise
   * @private
   */
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
