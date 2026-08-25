"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/hooks/use-signout";
import { BookOpen, ChevronDownIcon, Home, LayoutDashboardIcon, LogOut } from "lucide-react";
import Link from "next/link";

interface iAppProps {
    name: string;
    email: string;
    image: string;
};

export default function UserDropdown({ name, email, image }: iAppProps) {

    const handleSignOut = useSignOut();

    return (
        <DropdownMenu>
            {/* Trigger */}
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="h-auto gap-2 p-1 hover:bg-transparent"
                    />
                }
            >
                <Avatar className="size-9">
                    <AvatarImage src={image} alt={`${name}'s profile`} />
                    <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <ChevronDownIcon
                    size={16}
                    className="opacity-60"
                    aria-hidden="true"
                />
            </DropdownMenuTrigger>
            {/* Dropdown */}
            <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                {/* User Information + Navigation */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col min-w-0 gap-1">
                        <span className="text-sm font-semibold truncate">{name}</span>
                        <span className="text-xs font-normal truncate text-muted-foreground">{email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        render={
                            <Link
                                href="/"
                                className="flex items-center w-full gap-2"
                            />
                        }
                    >
                        <Home size={16} className="opacity-60" aria-hidden="true" />
                        <span>Home</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        render={
                            <Link
                                href="/courses"
                                className="flex items-center w-full gap-2"
                            />
                        }
                    >
                        <BookOpen size={16} className="opacity-60" aria-hidden="true" />
                        <span>Courses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        render={
                            <Link
                                href="/dashboard"
                                className="flex items-center w-full gap-2"
                            />
                        }
                    >
                        <LayoutDashboardIcon size={16} className="opacity-60" aria-hidden="true" />
                        <span>Dashboard</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/* Logout */}
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut size={16} className="opacity-60" aria-hidden="true" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
