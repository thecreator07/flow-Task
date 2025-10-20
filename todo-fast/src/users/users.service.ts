import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import type { IUser } from "../interfaces";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).select("+password");
  }

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    return {
      id: user.id as string,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async listAll(): Promise<IUser[]> {
    const users = await this.userModel.find();
    return users.map((user) => ({
      id: user.id as string,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  }
}
