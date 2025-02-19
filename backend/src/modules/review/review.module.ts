import { Module } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { EmailModule } from "../email/email.module";
import { ConfigService } from "@nestjs/config";
import { PublicReviewController } from "./public-review.controller";
import { ReviewController } from "./review.controller";
import { GoogleAuthService } from "./google-auth.service";

@Module({
  imports: [EmailModule],
  providers: [ReviewService, ConfigService, GoogleAuthService],
  controllers: [PublicReviewController, ReviewController],
})
export class ReviewModule {}
