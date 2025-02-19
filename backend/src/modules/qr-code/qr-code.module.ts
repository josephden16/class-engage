import { Module } from "@nestjs/common";
import { QRCodeService } from "./qr-code.service";
import { QRCodeController } from "./qr-code.controller";

@Module({
  providers: [QRCodeService],
  controllers: [QRCodeController],
})
export class QrCodeModule {}
