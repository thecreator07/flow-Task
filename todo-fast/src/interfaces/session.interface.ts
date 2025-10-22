import { IUser } from "./user.interface";

export interface ISessionUser extends IUser {
  // Session-specific user data
  sessionId?: string;
}

export interface ISessionData {
  user?: ISessionUser;
}

// Express Session interface
declare module "express-session" {
  interface SessionData {
    user?: ISessionUser;
  }
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  user: IUser;
}

export interface ILogoutResponse {
  success: boolean;
  message: string;
}

export interface IUserInfoResponse {
  success: boolean;
  user?: IUser;
  message?: string;
}
