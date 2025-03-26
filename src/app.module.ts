import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DocumentationModule } from '@/documentation/documentation.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { EvaluationItemsModule } from '@/modules/evaluation-items/evaluation-items.module';
import { GradesModule } from '@/modules/grades/grades.module';
import { InstitutionsModule } from '@/modules/institutions/institutions.module';
import { ReportsModule } from '@/modules/reports/reports.module';
import { StudentsModule } from '@/modules/students/students.module';
import { UnitsModule } from '@/modules/units/units.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ClassesModule,
    InstitutionsModule,
    StudentsModule,
    UnitsModule,
    EvaluationItemsModule,
    GradesModule,
    ReportsModule,
    DocumentationModule,
    MailModule,
  ],
})
export class AppModule {}
