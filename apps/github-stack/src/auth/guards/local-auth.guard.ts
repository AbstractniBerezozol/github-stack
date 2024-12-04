import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {}
