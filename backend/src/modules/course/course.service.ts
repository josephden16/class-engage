import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(lecturerId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseCode: dto.courseCode,
        lecturerId,
      },
    });
  }

  async findAll(lecturerId: string) {
    return this.prisma.course.findMany({ where: { lecturerId } });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
