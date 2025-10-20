import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { ISessionUser } from "../interfaces/session.interface";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(private users: UsersService) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<ISessionUser> {
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, password: hash });
    return {
      id: user.id as string,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  async login(email: string, password: string): Promise<ISessionUser> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(password, (user as User).password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    return {
      id: user.id as string,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
