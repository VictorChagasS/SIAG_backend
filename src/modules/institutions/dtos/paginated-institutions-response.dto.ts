import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { InstitutionResponseDto } from './institution-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginatedInstitutionsResponseDto {
  @ApiProperty({
    description: 'Lista de instituições',
    type: [InstitutionResponseDto],
  })
  @Type(() => InstitutionResponseDto)
    items: InstitutionResponseDto[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMetaDto,
  })
  @Type(() => PaginationMetaDto)
    meta: PaginationMetaDto;
}
