import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { SessionRolesGuard } from "../auth/guards/session-roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { Session } from "src/auth/decorators/session.decorator";
import type { ISessionUser, IUser } from "../interfaces";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SessionAuthGuard)
  @Get("me")
  async me(@Session() user: ISessionUser): Promise<IUser | null> {
    return this.usersService.findById(user.id);
  }

  // @Roles(Role.ADMIN,Role.MANAGER )
  // @UseGuards(SessionRolesGuard)
  // @UseGuards(SessionAuthGuard)
  @Get("list")
  list(): Promise<IUser[]> {
    return this.usersService.listAll();
  }
}
