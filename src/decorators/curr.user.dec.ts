import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CurrUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  if (!data) return req.user;

  return req.user[data];
});
