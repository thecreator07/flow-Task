import { Role } from "../auth/enums/role.enum";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface IUserDocument extends IUser {
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role?: Role;
}
