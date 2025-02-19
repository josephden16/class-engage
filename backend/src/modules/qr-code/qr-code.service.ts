import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateQRCodeDto, CreateQRCodeDto, PaginationDto } from "./dto";
import * as QRCode from "qrcode";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";

@Injectable()
export class QRCodeService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private async generateUniqueQRCodeData(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}-${random}`;
  }

  private async generateQRCodeURL(code: string): Promise<string> {
    const baseUrl = this.config.get("FRONTEND_URL");
    const reviewUrl = `${baseUrl}/review/${code}`;
    return await QRCode.toDataURL(reviewUrl);
  }

  async create(userId: string, dto: CreateQRCodeDto) {
    const code = await this.generateUniqueQRCodeData();

    const qrCode = await this.prisma.qRCode.create({
      data: {
        userId,
        code,
        label: dto.label,
      },
    });

    return {
      ...qrCode,
      qrCodeUrl: await this.generateQRCodeURL(code),
    };
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    try {
      const { sort, filter } = paginationDto;
      let { page = 1, limit = 20 } = paginationDto;
      page = Number(page) || 1;
      limit = Number(limit) || 20;

      const resultsLimit = Math.min(Math.max(1, limit), 100);

      const [sortField, sortOrder] = sort
        ? sort.split(":")
        : [undefined, undefined];

      const where: any = { userId };
      if (filter) {
        const filters = filter.split(",");
        filters.forEach((filter) => {
          const [filterField, filterValue] = filter.split(":");
          if (filterField === "userId") {
          } else {
            where[filterField] = { equals: filterValue };
          }
        });
      }

      const results = await this.prisma.qRCode.findMany({
        skip: (page - 1) * limit,
        take: resultsLimit,
        orderBy: sortField ? { [sortField]: sortOrder } : undefined,
        where: {
          ...where,
        },
      });

      const [totalResults, totalQRCodes] = await this.prisma.$transaction([
        this.prisma.qRCode.count({ where }),
        this.prisma.qRCode.count({
          where: { userId },
        }),
      ]);

      const qrCodes = await Promise.all(
        results.map(async (qrCode) => ({
          ...qrCode,
          qrCodeUrl: await this.generateQRCodeURL(qrCode.code),
        })),
      );

      return {
        page,
        limit,
        totalResults,
        totalQRCodes,
        results: qrCodes,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException("Error fetching QR codes");
      }
      throw new InternalServerErrorException("Error retrieving QR codes");
    }
  }

  async findOne(userId: string, id: string) {
    const qrCode = await this.prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new NotFoundException("QR code not found");
    }

    return {
      ...qrCode,
      qrCodeUrl: await this.generateQRCodeURL(qrCode.code),
    };
  }

  async update(userId: string, id: string, dto: UpdateQRCodeDto) {
    const qrCode = await this.prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new NotFoundException("QR code not found");
    }

    const updated = await this.prisma.qRCode.update({
      where: { id },
      data: dto,
    });

    return {
      ...updated,
      qrCodeUrl: await this.generateQRCodeURL(updated.code),
    };
  }

  async incrementScan(code: string): Promise<void> {
    await this.prisma.qRCode.update({
      where: { code },
      data: {
        scans: { increment: 1 },
        lastScanAt: new Date(),
      },
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    const qrCode = await this.prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new NotFoundException("QR code not found");
    }

    await this.prisma.qRCode.delete({
      where: { id },
    });
  }
}
