import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { InstitutionResponseDto } from './institution-response.dto';

export class InstitutionsSearchResponseDto {
  @ApiProperty({
    description: 'Lista de instituições encontradas',
    type: [InstitutionResponseDto],
  })
  @Type(() => InstitutionResponseDto)
    items: InstitutionResponseDto[];
}
