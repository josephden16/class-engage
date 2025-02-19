import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EmailModule } from "../email/email.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [EmailModule],
})
export class AuthModule {}
