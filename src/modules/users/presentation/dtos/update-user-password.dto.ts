import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ description: 'Senha atual do usuário' })
  @IsString()
  @MinLength(6)
    currentPassword: string;

  @ApiProperty({ description: 'Nova senha do usuário' })
  @IsString()
  @MinLength(6)
    newPassword: string;

  @ApiProperty({ description: 'Confirmação da nova senha' })
  @IsString()
  @MinLength(6)
    confirmPassword: string;
}
