import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Processor("email")
export class EmailProcessor {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(EmailProcessor.name);
  private emailFrom = this.configService.get("EMAIL_FROM");

  @Process("send-email")
  async handleSendEmail(
    job: Job<{
      recipient: string;
      subject: string;
      text?: string;
      template?: string;
      context?: Record<string, any>;
    }>,
  ) {
    const { recipient, subject, text, template, context } = job.data;

    this.logger.log(`Sending email to ${recipient} with subject "${subject}"`);
    await this.sendEmail({ recipient, subject, text, template, context });
    this.logger.log(`Email sent to ${recipient}`);
  }

  async sendEmail({
    recipient,
    subject,
    text,
    template,
    context,
  }: {
    recipient: string;
    subject: string;
    text?: string;
    template?: string;
    context?: Record<string, any>;
  }): Promise<void> {
    const mailOptions = {
      from: this.emailFrom,
      to: recipient,
      subject: subject,
      ...(text && { text }),
      ...(template && { template }),
      ...(context && { context }),
    };

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      this.logger.error("Failed to send email:", error);
      console.error(error);
      throw new Error("Email sending failed");
    }
  }
}
