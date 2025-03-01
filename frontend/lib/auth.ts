"use client";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_ROUTES } from "./routes";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: any, password: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result && result.error) {
        if (result.error === "CredentialsSignin") {
          setError(
            "Oops! The email or password you entered is incorrect. Please check your credentials and try again."
          );
        } else {
          setError(
            "Oops! We weren't able to process your login request. Please try again later."
          );
        }
        return false;
      }

      router.push(APP_ROUTES.DASHBOARD);
      return true;
    } catch (err) {
      setError("An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut({});
  };

  const authFetch = async (
    url: string | URL | Request,
    options: RequestInit = {}
  ) => {
    const authSession = await getSession();

    if (!authSession?.accessToken) {
      throw new Error("No access token available");
    }

    const headers = {
      Authorization: `Bearer ${authSession?.accessToken}`,
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  return {
    user: session?.user,
    accessToken: session?.accessToken,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading" || loading,
    login,
    logout,
    error,
    authFetch,
  };
}
