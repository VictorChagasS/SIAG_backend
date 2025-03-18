import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para busca por nome nas turmas ativas do professor
 */
export class ActiveTeacherClassesQueryDto {
  @ApiProperty({
    description: 'Filtrar por nome da turma',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;
}
