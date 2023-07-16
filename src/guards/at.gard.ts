import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AtGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride("IsPublic", [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    return !!isPublic || super.canActivate(ctx);
  }
}
