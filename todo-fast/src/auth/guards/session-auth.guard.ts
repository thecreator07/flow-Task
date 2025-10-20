import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session;

    if (!session || !session.user) {
      throw new UnauthorizedException("No active session found");
    }

    // Attach user to request for easy access in controllers
    (request as Request & { user: any }).user = session.user;

    return true;
  }
}
