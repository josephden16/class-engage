import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class EmailQueue {
  constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

  async addEmailToQueue(emailData: {
    recipient: string;
    subject: string;
    text?: string;
    template?: string;
    context?: Record<string, any>;
  }) {
    await this.emailQueue.add("send-email", emailData, {
      attempts: 3, // Retry up to 3 times in case of failure
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }
}
