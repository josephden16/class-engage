import { Controller, Post, Get, Body, Query, Param, Res } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { Response } from "express";
import { CreateReviewDto } from "./dto";

@Controller("public/reviews")
export class PublicReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get("form/:code")
  async showReviewForm(@Param("code") code: string) {
    const reviewFormData = await this.reviewService.getReviewFormData(code);
    return reviewFormData;
  }

  @Post("submit")
  async submitReview(@Body() dto: CreateReviewDto) {
    const { redirectUrl } = await this.reviewService.submitReview(dto);
    return { redirectUrl };
  }

  @Get("callback")
  async handleGoogleCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ) {
    const { redirectUrl } = await this.reviewService.handleGoogleCallback(
      code,
      state,
    );

    return res.redirect(redirectUrl);
  }
}
