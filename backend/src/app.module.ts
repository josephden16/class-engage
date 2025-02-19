import path, { join } from "path";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from "@nestjs/bull";
import * as aws from "@aws-sdk/client-ses";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { AppController } from "./app.controller";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { ApiLoggerMiddleware } from "./middlewares/apiLogger.middleware";
import { PrismaModule } from "./modules/prisma/prisma.module";
import config from "./shared/config/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { EmailModule } from "./modules/email/email.module";
import { AuthModule } from "./modules/auth/auth.module";
import { WebhookModule } from "./modules/webhook/webhook.module";
import { QrCodeModule } from "./modules/qr-code/qr-code.module";
import { ReviewModule } from "./modules/review/review.module";

const JWT_MAX_AGE = 20 * 60 * 60;

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  },
});

const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: "secret",
      signOptions: { expiresIn: JWT_MAX_AGE },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: redisPort,
        password: process.env.REDIS_PASSWORD || "",
      },
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        SES: { ses, aws },
        sendingRate: 1,
        maxConnections: 1,
      },
      defaults: {
        from: "Clisha Review <no-reply@clishareview.com>",
      },
      template: {
        dir: join(__dirname, "./emails"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: path.join(__dirname, "emails", "partials"),
          options: {
            strict: true,
          },
        },
      },
      preview: false,
    }),
    PrismaModule,
    EmailModule,
    WebhookModule,
    AuthModule,
    WebhookModule,
    QrCodeModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes("*");
  }
}
