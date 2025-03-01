import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { BullModule } from "@nestjs/bull";
import { AppController } from "./app.controller";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { ApiLoggerMiddleware } from "./middlewares/apiLogger.middleware";
import { PrismaModule } from "./modules/prisma/prisma.module";
import config from "./shared/config/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./modules/auth/auth.module";
import { CourseModule } from "./modules/course/course.module";
import { SessionsModule } from "./modules/session/session.module";

const JWT_MAX_AGE = 20 * 60 * 60;

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
    PrismaModule,
    AuthModule,
    CourseModule,
    SessionsModule,
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
