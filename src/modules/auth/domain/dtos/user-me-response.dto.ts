import { ApiProperty } from '@nestjs/swagger';

export class UserMeResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
    name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
    email: string;

  @ApiProperty({
    description: 'Indica se o usuário é administrador',
    example: false,
  })
    isAdmin: boolean;

  @ApiProperty({
    description: 'Período atual do usuário',
    example: '2025.2',
    nullable: true,
  })
    currentPeriod: string | null;

  @ApiProperty({
    description: 'ID da instituição do usuário',
    example: '1234',
  })
    institutionId: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2023-01-01T00:00:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização do usuário',
    example: '2023-01-01T00:00:00.000Z',
  })
    updatedAt: Date;
}
