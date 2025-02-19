import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { PrismaClientExceptionFilter } from "nestjs-prisma";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ZodFilter } from "./filters/zod.filter";
import { CorsConfig, NestConfig } from "./shared/config/config.interface";
import { API_PREFIX } from "./shared/constants/global.constants";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new ZodFilter());
  app.setGlobalPrefix(API_PREFIX);

  app.use(cookieParser());
  const redisClient = createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(`${process.env.REDIS_PORT}`),
      connectTimeout: 10000,
    },
    legacyMode: false,
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "hex:",
  });

  // Prisma Client Exception Filter for unhandled exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>("nest");
  const corsConfig = configService.get<CorsConfig>("cors");

  if (corsConfig!.enabled) {
    app.enableCors({
      origin: ["http://localhost:3000"],
      credentials: true,
    });

    app.set("trust proxy", 1);
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "secret",
        resave: false,
        saveUninitialized: false,
        store: redisStore,
      }),
    );

    await app.listen(process.env.PORT || nestConfig!.port || 5000);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  }
}

bootstrap();
