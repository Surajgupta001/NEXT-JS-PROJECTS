"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/use-signout";
import { authClient } from "@/lib/auth-client";
import {
  EllipsisVerticalIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  Tv2,
} from "lucide-react";
import Link from "next/link";

export function NavUser() {
  const { isMobile } = useSidebar();

  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = useSignOut();

  if (isPending || !session?.user) {
    return null;
  }

  const user = session.user;

  const initials =
    user.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const avatarUrl =
    user.image ||
    `https://avatar.vercel.sh/${encodeURIComponent(user.email)}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* User Trigger */}
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted"
              />
            }
          >
            <Avatar className="rounded-lg size-8">
              <AvatarImage
                src={avatarUrl}
                alt={user.name || "User"}
              />
              <AvatarFallback className="rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-medium truncate">
                {user.name}
              </span>

              <span className="text-xs truncate text-foreground/70">
                {user.email}
              </span>
            </div>

            <EllipsisVerticalIcon
              className="ml-auto size-4"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>

          {/* Dropdown */}
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Info */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="rounded-lg size-8">
                    <AvatarImage
                      src={avatarUrl}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-sm leading-tight text-left">
                    <span className="font-medium truncate">
                      {user.name}
                    </span>

                    <span className="text-xs truncate text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Navigation */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                  />
                }
              >
                <HomeIcon className="size-4" />
                <span>Home</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link
                    href="/admin"
                    className="flex items-center gap-2"
                  />
                }
              >
                <LayoutDashboardIcon className="size-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link
                    href="/courses"
                    className="flex items-center gap-2"
                  />
                }
              >
                <Tv2 className="size-4" />
                <span>Courses</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOutIcon className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}