import { Reflector } from '@nestjs/core'
import { UserRole } from '../../../users/domain/enum/roles.enum'

export const Roles = Reflector.createDecorator<UserRole[]>()
