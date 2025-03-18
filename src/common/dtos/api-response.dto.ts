import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Mensagem de sucesso da operação',
    example: 'Operação realizada com sucesso',
  })
    message: string;

  @ApiProperty({
    description: 'Dados retornados pela operação',
  })
  @Type((options) => (options?.newObject as any)?.resultType)
    result: T;

  constructor(partial?: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
