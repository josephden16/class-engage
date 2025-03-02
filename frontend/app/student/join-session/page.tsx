"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { APP_ROUTES } from "@/lib/routes";
import api from "@/lib/axios";

type FormValues = {
  invitationCode: string;
  fullName: string;
  matricNumber: string;
};

export default function JoinSessionInvitation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("invitationCode");

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/sessions/join", {
        invitationCode: data.invitationCode,
        name: data.fullName,
        matricNo: data.matricNumber,
      });

      const { sessionId, studentSessionId } = response.data.data;
      sessionStorage.setItem("studentSessionId", studentSessionId);
      router.push(`${APP_ROUTES.STUDENT_LIVE_SESSION}/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to join session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitationCode">Invitation Code</Label>
              <Input
                id="invitationCode"
                defaultValue={invitationCode as string}
                placeholder="Enter the invitation code"
                {...register("invitationCode", {
                  required: "Invitation code is required.",
                })}
              />
              {errors.invitationCode && (
                <p className="text-red-600 text-sm">
                  {errors.invitationCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required.",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters.",
                  },
                })}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricNumber">Matric Number</Label>
              <Input
                id="matricNumber"
                placeholder="Enter your matric number"
                {...register("matricNumber", {
                  required: "Matric number is required.",
                  minLength: {
                    value: 5,
                    message: "Matric number must be at least 5 characters.",
                  },
                  pattern: {
                    value: /^[0-9]{5,6}$/,
                    message: "Enter a valid matric number.",
                  },
                })}
              />
              {errors.matricNumber && (
                <p className="text-red-600 text-sm">
                  {errors.matricNumber.message}
                </p>
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />{" "}
              {isLoading ? "Joining..." : "Join Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
