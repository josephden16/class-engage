import { Injectable } from "@nestjs/common";
import { EmailQueue } from "./email.queue";
import { ConfigService } from "@nestjs/config";
import * as handlebars from "handlebars";
import { handlebarHelpers } from "./helpers";

@Injectable()
export class EmailService {
  constructor(
    private emailQueue: EmailQueue,
    private configService: ConfigService,
  ) {
    Object.entries(handlebarHelpers).forEach(([name, helper]) => {
      handlebars.registerHelper(name, helper);
    });
  }

  async sendVerificationEmail(
    recipientEmail: string,
    context: {
      name: string;
      token: string;
      url: string;
    },
  ): Promise<void> {
    const subject = "Please verify your account";

    await this.emailQueue.addEmailToQueue({
      recipient: recipientEmail,
      subject,
      template: "registration",
      context,
    });
  }

  async sendNegativeReviewAlert(
    recipientEmail: string,
    context: {
      reviewId: string;
      rating: number;
      comment: string;
      businessName: string;
      customerName: string;
      customerEmail: string;
    },
  ): Promise<void> {
    const subject = "Negative review alert";

    const emailContext = {
      ...context,
      dashboardUrl: `${this.configService.get<string>("FRONTEND_URL")}/reviews/${context.reviewId}`,
    };

    await this.emailQueue.addEmailToQueue({
      recipient: recipientEmail,
      subject,
      template: "negative-review-alert",
      context: emailContext,
    });
  }
}
