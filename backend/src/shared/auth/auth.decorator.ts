import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";

import { Role } from "@prisma/client";
import { AuthGuard } from "./auth.guard";
import { AuthenticatedUser } from "../types";

export const AllowAuthenticated = (...roles: Role[]) =>
  applyDecorators(SetMetadata("roles", roles), UseGuards(AuthGuard));

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
