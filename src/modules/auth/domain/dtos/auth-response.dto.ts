import { ApiProperty } from '@nestjs/swagger';

class UserDto {
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
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
    accessToken: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: UserDto,
  })
    user: UserDto;
}
