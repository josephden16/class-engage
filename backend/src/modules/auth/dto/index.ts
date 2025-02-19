import { TimeFormat } from "@prisma/client";
import { z } from "zod";

export const registerUserSchema = z
  .object({
    email: z
      .string()
      .email()
      .transform((email) => email.toLowerCase()),
    password: z.string().min(6).max(32),
    firstName: z.string(),
    lastName: z.string(),
    profile: z.object({
      gender: z.enum(["Male", "Female"]),
      companyName: z.string(),
      language: z.string(),
      location: z.string().optional(),
      websiteUrl: z.string().optional(),
      timeZone: z.string().optional(),
      timeFormat: z.nativeEnum(TimeFormat).optional(),
      googlePlaceId: z.string().optional(),
    }),
  })
  .required();
export type RegisterUserDto = z.infer<typeof registerUserSchema>;

export const loginUserSchema = registerUserSchema.pick({
  email: true,
  password: true,
});
export type LoginUserDto = z.infer<typeof loginUserSchema>;

export const authTokenSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .required();
export type AuthTokenDto = z.infer<typeof authTokenSchema>;

export const sendOtpSchema = registerUserSchema.pick({
  email: true,
});
export type SendOtpDto = z.infer<typeof sendOtpSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(32),
  otp: z.string(),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = resetPasswordSchema.pick({
  email: true,
  otp: true,
});
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export const verifyOtpSchema = resetPasswordSchema.pick({
  email: true,
  otp: true,
});
export type verifyOtpDto = z.infer<typeof verifyOtpSchema>;
