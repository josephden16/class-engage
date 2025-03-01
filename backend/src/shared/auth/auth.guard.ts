import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import { PrismaService } from "../../modules/prisma/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private readonly accessTokenSecret = this.config.get<string>("JWT_SECRET");

  /**
   * Determines if the current request is authorized by calling
   * the authenticateUser and authorizeUser methods.
   * @param context - The current execution context of the request.
   * @returns {Promise<boolean>} - Whether the user is authorized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    await this.authenticateUser(req);
    return this.authorizeUser(req, context);
  }

  /**
   * Authenticates the user by checking the JWT in the request header.
   * Decodes the token, verifies it, and attaches the user info to the request.
   * @param req - The current request object.
   * @throws {UnauthorizedException} - If token is missing, invalid, or authentication fails.
   */
  private async authenticateUser(req: any): Promise<void> {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader || typeof bearerHeader !== "string") {
      throw new UnauthorizedException(
        "Authorization header is missing or invalid.",
      );
    }

    const token = bearerHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Token is missing.");
    }

    // TODO: Optional - Check if token is blacklisted

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.accessTokenSecret,
      }); // Verify the JWT token
      const id = payload?.id;

      if (!id) {
        throw new UnauthorizedException("Invalid token: ID not present.");
      }

      const user = await this.prisma.user.findUnique({ where: { id } }); // Fetch user from the database
      if (!user) {
        throw new UnauthorizedException("User not found.");
      }

      // Attach user info to the request object
      req.user = { id: user.id, role: user.role };
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token expired.");
      } else if (err.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Malformed token.");
      } else {
        throw new UnauthorizedException("Authentication failed.");
      }
    }
  }

  /**
   * Authorizes the user by checking if the user's role matches the required roles.
   * Logs a warning if the user attempts unauthorized access.
   * @param req - The current request object with the user info.
   * @param context - The execution context to get metadata like required roles.
   * @throws {UnauthorizedException} - If the user does not have the required permissions.
   * @returns {boolean} - Whether the user is authorized based on their role.
   */
  private authorizeUser(req: any, context: ExecutionContext): boolean {
    const requiredRoles = this.getMetadata<Role[]>("roles", context); // Retrieve required roles from metadata
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no roles are specified, allow access by default
    }

    if (!requiredRoles.includes(req.user.role)) {
      const ip = req.ip;
      Logger.warn(
        `Unauthorized attempt by user: ${req.user.id} from IP: ${ip}`,
      );
      throw new UnauthorizedException("Insufficient permissions.");
    }
    return true;
  }

  /**
   * Helper method to retrieve metadata such as required roles for a handler or class.
   * @param key - Metadata key.
   * @param context - The execution context to get handler and class.
   * @returns {T} - The retrieved metadata value.
   */
  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
