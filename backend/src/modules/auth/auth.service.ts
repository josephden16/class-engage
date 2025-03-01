/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import { GlobalApiResponseDto } from "src/shared/dto/api-response.dto";
import { ConfigService } from "@nestjs/config";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { hashPassword } from "src/shared/helpers/helpers";
import { AuthTokenDto, LoginUserDto, RegisterUserDto } from "./dto";
import bcrypt from "bcryptjs";
import { removeProperties } from "src/shared/auth/util";

@Injectable()
export class AuthService {
  private readonly refreshTokenSecret =
    this.configService.get<string>("JWT_REFRESH_SECRET");
  private readonly accessTokenSecret =
    this.configService.get<string>("JWT_SECRET");
  private readonly jwtExpiryTime =
    this.configService.get<string>("JWT_EXPIRY_TIME");
  private readonly jwtRefreshExpiryTime = this.configService.get<string>(
    "JWT_EXPIRY_REFRESH_TIME",
  );

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh JWT tokens for the user.
   * @param email
   * @param id
   * @param role
   * @returns AuthTokenDto
   */
  async generateAuthToken(
    id: string,
    role: Role,
  ): Promise<AuthTokenDto | undefined> {
    const payload = { id, role };

    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.jwtExpiryTime,
        secret: this.accessTokenSecret,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.jwtRefreshExpiryTime,
        secret: this.refreshTokenSecret,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      console.error(err);
    }
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException("This account does not exist.");
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException("Wrong Credentials, try again.");
    }

    const tokens = await this.generateAuthToken(user.id, user.role);

    if (!tokens) {
      throw new InternalServerErrorException("Failed to generate auth tokens");
    }

    return {
      user: removeProperties(user, ["password"]),
      tokens,
    };
  }

  async registerUser(args: RegisterUserDto) {
    args.password = await bcrypt.hash(args.password, 10);

    const alreadyExistingUser = await this.prisma.user.findUnique({
      where: { email: args.email },
    });

    if (alreadyExistingUser) {
      throw new BadRequestException("User already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        ...args,
      },
    });

    const userData = removeProperties(user, ["password"]);

    return { ...userData };
  }

  async refreshToken(token: string): Promise<GlobalApiResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });

      if (!payload) throw new BadRequestException("Invalid refresh token");

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException(
          "Invalid or expired refresh token sent",
        );
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
        },
        { expiresIn: this.jwtExpiryTime, secret: this.accessTokenSecret },
      );

      const response: GlobalApiResponseDto = {
        message: "New access token sent",
        statusCode: HttpStatus.OK,
        data: { accessToken: newAccessToken },
      };
      return response;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token provided in request");
      } else if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException("The token sent is expired or invalid");
      } else {
        throw err;
      }
    }
  }

  async whoami(token: string): Promise<GlobalApiResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });

      if (!payload) throw new BadRequestException("Invalid refresh token");

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException(
          "Invalid or expired refresh token sent",
        );
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
        },
        { expiresIn: this.jwtExpiryTime, secret: this.accessTokenSecret },
      );

      const response: GlobalApiResponseDto = {
        message: "User and company details sent",
        statusCode: HttpStatus.OK,
        data: { user, token: newAccessToken },
      };
      return response;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token provided in request");
      } else if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException("The token sent is expired or invalid");
      } else {
        throw err;
      }
    }
  }

  async resetPassword(dto: any): Promise<GlobalApiResponseDto> {
    const { email, password } = dto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { password: true },
      });

      if (!user)
        throw new BadRequestException("Invalid details, please try again!");

      const hashedPassword = await hashPassword(password);
      const updatedUser = await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      const returnedUser = removeProperties(updatedUser, ["password"]);
      return {
        message: "Password updated successfully",
        statusCode: HttpStatus.OK,
        data: returnedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || "Server error, please try again",
      );
    }
  }

  async generateVerificationToken(payload: any, expiresIn: string) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn,
    });

    return accessToken;
  }
}
