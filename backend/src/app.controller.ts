import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { DisableResponseInterceptor } from "./interceptors/response.interceptor";

@Controller()
export class AppController {
  @Get("status")
  @DisableResponseInterceptor()
  getAppStatus(@Req() req: Request) {
    return {
      message: "Ok",
      timestamp: new Date().toISOString(),
      IP: req.ip,
      URL: req.originalUrl,
    };
  }
}
