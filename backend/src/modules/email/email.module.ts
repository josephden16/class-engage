import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { BullModule } from "@nestjs/bull";
import { EmailProcessor } from "./email.processor";
import { EmailQueue } from "./email.queue";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "email",
    }),
  ],
  exports: [EmailService],
  providers: [EmailService, EmailProcessor, EmailQueue],
})
export class EmailModule {}
