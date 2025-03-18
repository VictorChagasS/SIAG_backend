import { ApiProperty } from '@nestjs/swagger';

export class ClassImportInfoDto {
  @ApiProperty({
    description: 'ID da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
    name: string;

  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    nullable: true,
  })
    code: string | null;

  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
  })
    period: string;
}

export class ImportDataDto {
  @ApiProperty({
    description: 'Informações da turma',
    type: ClassImportInfoDto,
  })
    class: ClassImportInfoDto;

  @ApiProperty({
    description: 'Número de estudantes adicionados',
    example: 25,
  })
    studentsAdded: number;

  @ApiProperty({
    description: 'Número de estudantes ignorados (já existentes)',
    example: 2,
  })
    studentsSkipped: number;

  @ApiProperty({
    description: 'Lista de erros encontrados',
    type: [String],
    example: ['Aluno com matrícula 12345 já existe'],
  })
    errors: string[];
}

export class ImportResultDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Turma criada com sucesso a partir da planilha',
  })
    message: string;

  @ApiProperty({
    description: 'Dados da importação',
    type: ImportDataDto,
  })
    data: ImportDataDto;
}
