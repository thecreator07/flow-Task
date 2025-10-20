import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ISessionUser } from "../../interfaces/session.interface";
import { Request } from "express";

export const Session = createParamDecorator(
  (
    data: keyof ISessionUser | undefined,
    ctx: ExecutionContext,
  ): ISessionUser | string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const session = request.session;

    if (!session || !session.user) {
      return null;
    }

    return data ? (session.user[data] as string) : session.user;
  },
);

export const GetSession = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const session = request.session;

    if (data) {
      return (session as Record<string, any>)?.[data];
    }
    return session;
  },
);