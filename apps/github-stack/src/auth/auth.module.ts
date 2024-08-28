import { Module } from '@nestjs/common'
import { AuthController } from './controller/auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { User } from '../users/domain/entity/user.entity'
import { UsersService } from '../users/service/users.service'
import { AuthService } from './service/auth.service'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { SendingEmailService } from '../github-ineraction/service/sending-email.service'
import { HttpModule } from '@nestjs/axios'
import { GitRepository } from '../github-ineraction/domain/entity/repository.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    TypeOrmModule.forFeature([User, GitRepository]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    JwtRefreshStrategy,
    SendingEmailService,
  ],
})
export class AuthModule {}
