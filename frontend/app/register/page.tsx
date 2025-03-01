"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signUpUser } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const router = useRouter();
  const [signupError, setSignupError] = useState("");

  const onSubmit = async (data: any) => {
    try {
      setSignupError("");
      await signUpUser(data);
      router.push(APP_ROUTES.DASHBOARD);
    } catch (error: any) {
      setSignupError(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div>
          <img
            src="/ui-logo.jpeg"
            alt="University of Ibadan Logo"
            className="mx-auto mt-6 w-20"
          />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up for a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName?.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName?.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {errors.email?.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password?.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword?.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Department"
                {...register("department", {
                  required: "Department is required",
                })}
              />
              {errors.department && (
                <p className="text-red-500 text-sm">
                  {errors.department?.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Input
                id="faculty"
                placeholder="Faculty"
                {...register("faculty", { required: "Faculty is required" })}
              />
              {errors.faculty && (
                <p className="text-red-500 text-sm">
                  {errors.faculty?.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                {...register("agreedToTerms", {
                  required: "You must agree to the terms",
                })}
              />
              <Label htmlFor="terms">I agree to Terms and Conditions</Label>
            </div>
            {errors.agreedToTerms && (
              <p className="text-red-500 text-sm">
                {errors.agreedToTerms?.message as string}
              </p>
            )}
            {signupError && (
              <p className="text-red-500 text-sm">{signupError}</p>
            )}

            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full my-3"
            >
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-black hover:underline">
              login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
