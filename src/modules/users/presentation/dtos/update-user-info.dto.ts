import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsOptional, IsString, Matches,
} from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserInfoDto extends PartialType(PickType(CreateUserDto, ['name', 'institutionId'] as const)) {
  @ApiProperty({
    description: 'Período atual do usuário (formato: YYYY.S, ex: 2024.1)',
    example: '2024.1',
    required: false,
  })

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}\.[1-2]$/, {
    message: 'O período deve estar no formato YYYY.S, onde Y é o ano e S é o semestre (1 ou 2)',
  })
    currentPeriod?: string;
}
