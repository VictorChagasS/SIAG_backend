import { ApiProperty } from '@nestjs/swagger';

class ErrorDetailDto {
  @ApiProperty({
    description: 'Código do erro',
    example: 'INVALID_CREDENTIALS',
  })
    code: string;

  @ApiProperty({
    description: 'Título do erro',
    example: 'Credenciais inválidas',
  })
    title: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: ['Email ou senha incorretos'],
    type: [String],
  })
    detail: string[];
}

export class ApiErrorDto {
  @ApiProperty({
    description: 'Lista de erros',
    type: [ErrorDetailDto],
  })
    errors: ErrorDetailDto[];
}
