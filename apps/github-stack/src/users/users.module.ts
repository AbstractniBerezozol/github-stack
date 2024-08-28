import { Module } from '@nestjs/common'
import { UsersService } from './service/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './domain/entity/user.entity'
import { UsersController } from './controller/users.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
