import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleAuthService } from "./google-auth.service";
import { EmailService } from "../email/email.service";
import { CreateReviewDto } from "./dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private googleAuthService: GoogleAuthService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  frontendUrl = this.configService.get<string>("FRONTEND_URL");

  async getReviewFormData(code: string) {
    const qrCode = await this.prisma.qRCode.update({
      where: {
        code,
      },
      data: {
        scans: {
          increment: 1,
        },
        lastScanAt: new Date(),
      },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    if (!qrCode) {
      throw new NotFoundException("QR code not found");
    }

    const reviewFormData = {
      qrCodeId: qrCode.id,
      businessName: qrCode.user?.userProfile?.companyName,
      logo: qrCode.user?.userProfile?.logo,
    };

    return reviewFormData;
  }

  async submitReview(dto: CreateReviewDto) {
    const qrCode = await this.prisma.qRCode.findUnique({
      where: { id: dto.qrCodeId },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    if (!qrCode || !qrCode.user) {
      throw new NotFoundException("QR code not found");
    }

    if (!qrCode.user.userProfile?.googlePlaceId) {
      throw new NotFoundException(
        "Google Place ID not found for this business. Please contact support.",
      );
    }

    const state = Buffer.from(
      JSON.stringify({
        qrCodeId: qrCode.id,
        rating: dto.rating,
        comment: dto.comment,
        placeId: qrCode.user.userProfile.googlePlaceId,
      }),
    ).toString("base64");

    const redirectUrl = this.googleAuthService.generateAuthUrl(state);

    return { redirectUrl };
  }

  async handleGoogleCallback(code: string, state: string) {
    const { comment, rating, placeId, qrCodeId } = JSON.parse(
      Buffer.from(state, "base64").toString(),
    );

    const googleProfile = await this.googleAuthService.getProfileData(code);

    const qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      return { redirectUrl: `${this.frontendUrl}/review/failed` };
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment: comment || "",
        customerName: googleProfile.name,
        customerEmail: googleProfile.email,
        qrCodeId: qrCodeId,
        userId: qrCode.userId,
      },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    if (!review) {
      return { redirectUrl: `${this.frontendUrl}/review/failed` };
    }

    if (rating >= 4) {
      // const googleReviewUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
      const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
      return { redirectUrl: googleReviewUrl };
    } else {
      if (review.user?.userProfile) {
        await this.emailService.sendNegativeReviewAlert(review.user.email, {
          reviewId: review.id,
          rating: review.rating,
          comment: review.comment,
          customerEmail: review.customerEmail,
          customerName: review.customerName,
          businessName: review.user.userProfile.companyName,
        });
      }
      const redirectUrl = `${this.frontendUrl}/review/thank-you`;
      return { redirectUrl };
    }
  }
}
