import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Response, Request as ExpressRequest } from "express";
import { SessionAuthGuard } from "./guards/session-auth.guard";
import { Session } from "./decorators/session.decorator";
import type {
  IAuthResponse,
  IUserInfoResponse,
  ISessionUser,
} from "../interfaces";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    const user = await this.auth.register(dto.name, dto.email, dto.password);

    // Store user in session
    req.session.user = user;
    
    console.log('Register - Session ID:', req.sessionID);
    console.log('Register - Session user set:', !!req.session.user);
    console.log('Register - Cookie settings:', req.session.cookie);

    return {
      success: true,
      message: "User registered and logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    const user = await this.auth.login(dto.email, dto.password);

    // Store user in session
    req.session.user = user;
    
    console.log('Login - Session ID:', req.sessionID);
    console.log('Login - Session user set:', !!req.session.user);
    console.log('Login - Cookie settings:', req.session.cookie);

    return {
      success: true,
      message: "User logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @UseGuards(SessionAuthGuard)
  @Post("logout")
  logout(@Req() req: ExpressRequest, @Res() res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({
          success: false,
          message: "Failed to logout",
        });
      }
      // Clear the session cookie
      res.clearCookie('sessionId', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  }

  @UseGuards(SessionAuthGuard)
  @Post("me")
  me(@Session() user: ISessionUser, @Req() req: ExpressRequest): IUserInfoResponse {
    console.log('Me endpoint - Session ID:', req.sessionID);
    console.log('Me endpoint - Session user:', !!req.session.user);
    console.log('Me endpoint - User from decorator:', !!user);
    
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      user: user,
    };
  }
}
