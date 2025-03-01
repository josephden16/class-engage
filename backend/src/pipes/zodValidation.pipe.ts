import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema<any>) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        throw new BadRequestException({
          message: "Invalid or incomplete details sent",
          errors: formattedErrors,
        });
      }
      throw error;
    }
  }

  private formatZodErrors(error: any) {
    // return error.errors.map((err) => err.message).join(', ');
    return error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  }
}
