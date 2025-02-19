import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { QRCodeService } from "./qr-code.service";
import { CreateQRCodeDto, PaginationDto, UpdateQRCodeDto } from "./dto";
import { AllowAuthenticated, GetUser } from "src/shared/auth/auth.decorator";
import { AuthenticatedUser } from "src/shared/types";

@Controller("qr-codes")
export class QRCodeController {
  constructor(private qrCodeService: QRCodeService) {}

  @Post()
  @AllowAuthenticated("Company")
  create(@GetUser() user: AuthenticatedUser, @Body() dto: CreateQRCodeDto) {
    return this.qrCodeService.create(user.id, dto);
  }

  @Get()
  @AllowAuthenticated("Company")
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.qrCodeService.findAll(user.id, paginationDto);
  }

  @Get(":id")
  @AllowAuthenticated("Company")
  findOne(@GetUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.qrCodeService.findOne(user.id, id);
  }

  @Put(":id")
  @AllowAuthenticated("Company")
  update(
    @GetUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateQRCodeDto,
  ) {
    return this.qrCodeService.update(user.id, id, dto);
  }

  @Delete(":id")
  @AllowAuthenticated("Company")
  delete(
    @GetUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.qrCodeService.delete(user.id, id);
  }
}
