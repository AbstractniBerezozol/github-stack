import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { Reflector } from "@nestjs/core";
import { Roles, ROLES_KEY } from "../domain/decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler()
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }
    return this.checkRoles(user.roles, requiredRoles);
  }

  private checkRoles(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }
}
