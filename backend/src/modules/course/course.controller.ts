import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import {
  CreateCourseDto,
  createCourseSchema,
  UpdateCourseDto,
  updateCourseSchema,
} from "./dto";
import { AllowAuthenticated, GetUser } from "src/shared/auth/auth.decorator";
import { AuthenticatedUser } from "src/shared/types";
import { ZodValidationPipe } from "src/pipes/zodValidation.pipe";

@Controller("courses")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @AllowAuthenticated()
  create(
    @Body(new ZodValidationPipe(createCourseSchema)) dto: CreateCourseDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.courseService.create(user.id, dto);
  }

  @Get()
  @AllowAuthenticated()
  findAll(@GetUser() user: AuthenticatedUser) {
    return this.courseService.findAll(user.id);
  }

  @Get(":id")
  @AllowAuthenticated()
  findOne(@Param("id") id: string) {
    return this.courseService.findOne(id);
  }

  @Put(":id")
  @AllowAuthenticated()
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCourseSchema)) dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, dto);
  }

  @Delete(":id")
  @AllowAuthenticated()
  remove(@Param("id") id: string) {
    return this.courseService.remove(id);
  }
}
