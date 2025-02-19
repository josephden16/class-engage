import bcrypt from "bcryptjs";
import { createObjectCsvStringifier } from "csv-writer";
import { authenticator, totp } from "otplib";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(32, "Password must be no more than 32 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number");

export const hashPassword = async (password: string) => {
  const validation = passwordSchema.safeParse(password);

  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", "),
    );
  }
  try {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    return hashedPassword;
  } catch {
    throw new Error("Failed to hash password.");
  }
};

export const isPasswordValid = async (
  password: string,
  userPassword: string,
) => {
  try {
    const validPassword = bcrypt.compareSync(password, userPassword);
    return validPassword;
  } catch {
    throw new Error("error validating password");
  }
};

export const otpGenerator = async () => {
  const secret = authenticator.generateSecret(24);

  totp.options = { digits: 6, step: 600 };

  const otp = totp.generate(secret);

  return { otp, secret };
};

export const verifyOtp = (otp: string, secret: string) => {
  const isValid = totp.check(otp, secret);
  return isValid;
};

export const convertToCsv = (jsonData: any[]) => {
  if (jsonData.length === 0) {
    return "";
  }

  const keys = Object.keys(jsonData[0]);
  const csvStringifier = createObjectCsvStringifier({
    header: keys.map((key) => ({ id: key, title: key })),
  });

  const header = csvStringifier.getHeaderString();
  const records = csvStringifier.stringifyRecords(jsonData);

  return header + records;
};

export const formatCurrency = (amount: number, currency: string) => {
  const options = {
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Use the Intl.NumberFormat to format the amount based on currency
  const formatter = new Intl.NumberFormat("en-US", options);
  return formatter.format(amount);
};
