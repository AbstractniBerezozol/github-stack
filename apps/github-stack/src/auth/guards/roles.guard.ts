import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '../../users/domain/enum/roles.enum'
import { Roles } from '../domain/decorator/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>(Roles, context.getHandler())
    const request = context.switchToHttp().getRequest()
    const user = request.user
    return this.checkRoles(user.roles, roles)
  }

  private checkRoles(userRole: UserRole, roles: UserRole[]): boolean {
    switch (userRole) {
      case UserRole.ADMIN:
        return roles.includes(UserRole.ADMIN)

      case UserRole.MODERATOR:
        return roles.includes(UserRole.MODERATOR)

      default:
        return roles.includes(UserRole.USER)
    }
  }
}
