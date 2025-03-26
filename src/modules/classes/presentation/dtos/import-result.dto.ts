/**
 * Import Result DTOs
 *
 * Data Transfer Objects for class import operation results.
 * Contains DTOs for the class information, import data, and overall result.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the imported class information
 *
 * Contains basic information about the class that was created or updated
 * during the import process.
 *
 * @class ClassImportInfoDto
 */
export class ClassImportInfoDto {
  /**
   * Unique identifier for the imported class
   */
  @ApiProperty({
    description: 'ID da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  /**
   * Name of the imported class
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
    name: string;

  /**
   * Code/identifier of the imported class
   * Can be null if not provided
   */
  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    nullable: true,
  })
    code: string | null;

  /**
   * Academic period of the imported class
   * Format: "YYYY.N" (e.g., "2025.2")
   */
  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
  })
    period: string;
}

/**
 * DTO for detailed import operation data
 *
 * Contains statistics and details about the import operation,
 * including information about the class and students.
 *
 * @class ImportDataDto
 */
export class ImportDataDto {
  /**
   * Information about the imported class
   */
  @ApiProperty({
    description: 'Informações da turma',
    type: ClassImportInfoDto,
  })
    class: ClassImportInfoDto;

  /**
   * Number of students successfully added during import
   */
  @ApiProperty({
    description: 'Número de estudantes adicionados',
    example: 25,
  })
    studentsAdded: number;

  /**
   * Number of students skipped (usually due to already existing)
   */
  @ApiProperty({
    description: 'Número de estudantes ignorados (já existentes)',
    example: 2,
  })
    studentsSkipped: number;

  /**
   * List of error messages encountered during import
   */
  @ApiProperty({
    description: 'Lista de erros encontrados',
    type: [String],
    example: ['Aluno com matrícula 12345 já existe'],
  })
    errors: string[];
}

/**
 * DTO for the overall import operation result
 *
 * Top-level response object for class import operations,
 * containing a success message and detailed import data.
 *
 * @class ImportResultDto
 */
export class ImportResultDto {
  /**
   * Success message for the import operation
   */
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Turma criada com sucesso a partir da planilha',
  })
    message: string;

  /**
   * Detailed data about the import operation
   */
  @ApiProperty({
    description: 'Dados da importação',
    type: ImportDataDto,
  })
    data: ImportDataDto;
}
