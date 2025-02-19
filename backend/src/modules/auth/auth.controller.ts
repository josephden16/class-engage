/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import { ZodValidationPipe } from "../../pipes/zodValidation.pipe";
import {
  loginUserSchema,
  RegisterUserDto,
  registerUserSchema,
  LoginUserDto,
} from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly cookieMaxAge = 7 * 24 * 60 * 60 * 1000;

  @Post("/signup")
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async signup(@Body() dto: RegisterUserDto) {
    return await this.authService.registerUser(dto);
  }

  @Post("/login")
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  async login(@Body() loginDto: LoginUserDto) {
    return await this.authService.login(loginDto);
  }

  @Get("/verify-email")
  async verifyEmail(@Query("token") token: string) {
    return await this.authService.verifyEmail({ token });
  }

  @Get("/refresh-token")
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Get("/whoami")
  async whoami(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }
    return this.authService.whoami(refreshToken);
  }

  @Post("logout")
  async logOut(@Res() res: Response) {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: this.cookieMaxAge,
      expires: new Date(),
    });
    res.status(200).end();
  }
}
