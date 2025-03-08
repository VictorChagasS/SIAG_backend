import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

import { authProviders } from './auth.providers';
import { AdminGuard } from './domain/guards/admin.guard';
import { JwtAuthGuard } from './domain/guards/jwt-auth.guard';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    AdminGuard,
  ],
})
export class AuthModule {}
