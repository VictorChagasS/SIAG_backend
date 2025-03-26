/**
 * Update Student DTO
 *
 * Data Transfer Object for updating existing students.
 * Contains optional fields that can be updated.
 *
 * @module StudentDTOs
 * @students DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling student update requests
 *
 * Contains optional fields that can be updated for a student.
 * All fields are optional since updates may modify only specific attributes.
 *
 * @class UpdateStudentDto
 * @students Update
 */
export class UpdateStudentDto {
  /**
   * Updated full name of the student
   * Optional field that can be updated
   *
   * @students Property
   */
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'João da Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  /**
   * Updated email address of the student
   * Optional field that can be updated
   *
   * @students Property
   */
  @ApiProperty({
    description: 'E-mail do estudante',
    example: 'joao.silva@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  /**
   * Updated registration number/identifier of the student
   * Optional field that can be updated
   * Must remain unique within a class if changed
   *
   * @students Property
   */
  @ApiProperty({
    description: 'Número de matrícula do estudante',
    example: '20230001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A matrícula deve ser uma string' })
    registration?: string;
}
