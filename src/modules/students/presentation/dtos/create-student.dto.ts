/**
 * Create Student DTO
 *
 * Data Transfer Object for creating new students within a class.
 * Contains the required data for student creation.
 *
 * @module StudentDTOs
 * @students DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

/**
 * DTO for handling student creation requests
 *
 * Contains the required name, registration, and optional email for creating a new student.
 * The class ID is provided via the route parameter rather than in this DTO.
 *
 * @class CreateStudentDto
 * @students Create
 */
export class CreateStudentDto {
  /**
   * Full name of the student
   * Required field for identification
   *
   * @students Property
   */
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  /**
   * Email address of the student (optional)
   * Used for communication purposes
   *
   * @students Property
   */
  @ApiProperty({
    description: 'E-mail do estudante (opcional)',
    example: 'joao.silva@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  /**
   * Registration number/identifier of the student
   * Must be unique within a class
   *
   * @students Property
   */
  @ApiProperty({
    description: 'Número de matrícula do estudante',
    example: '20230001',
  })
  @IsNotEmpty()
  @IsString()
    registration: string;
}
