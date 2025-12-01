import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthMiddleware } from './auth.middleware';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OwnerGuard } from './owner.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'minhaSecretKey',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService, JwtAuthGuard, OwnerGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard, OwnerGuard, RolesGuard],
})
export class AuthModule {}
