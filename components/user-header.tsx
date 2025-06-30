"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Settings,
  Monitor,
  Moon,
  Sun,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/lib/auth";
import { LusLogo } from "@/components/ui/lus-logo";

interface UserHeaderProps {
  className?: string;
}

export default function UserHeader({ className }: UserHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex items-center justify-between pl-4 pr-4 py-4 bg-card border-b ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-lg">
            <LusLogo
              className="h-8 w-8 text-primary-foreground"
              width={20}
              height={20}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">LUS</h1>
            <p className="text-sm text-muted-foreground">
              Localizador de Unidades de Saúde
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            Olá, {user.name.split(" ")[0]}!
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-full p-0"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Alternar tema</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
