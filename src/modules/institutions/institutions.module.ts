import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { InstitutionsController } from './institutions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionsController],
})
export class InstitutionsModule {}
