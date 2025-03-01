"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";
import { usePathname } from "next/navigation";

export default function DashboardNavigation() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-primary text-primary-foreground p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-8">
        <Image src="/ui-logo.jpeg" alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold">ClassEngage</span>
      </div>
      <Link
        href={APP_ROUTES.DASHBOARD}
        className={`block py-2 px-4 text-primary rounded ${
          APP_ROUTES.DASHBOARD === pathname
            ? "bg-secondary"
            : "hover:bg-secondary/10 text-white"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href={APP_ROUTES.PROFILE}
        className={`block py-2 px-4 text-primary rounded ${
          APP_ROUTES.PROFILE === pathname
            ? "bg-secondary"
            : "hover:bg-secondary/10 text-white"
        }`}
      >
        Profile & Settings
      </Link>
      <Button
        onClick={logout}
        variant="ghost"
        className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-secondary/50"
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </nav>
  );
}
