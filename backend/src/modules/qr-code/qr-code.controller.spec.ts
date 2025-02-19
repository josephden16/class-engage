import { Test, TestingModule } from "@nestjs/testing";
import { QRCodeController } from "./qr-code.controller";

describe("QRCodeController", () => {
  let controller: QRCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QRCodeController],
    }).compile();

    controller = module.get<QRCodeController>(QRCodeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
