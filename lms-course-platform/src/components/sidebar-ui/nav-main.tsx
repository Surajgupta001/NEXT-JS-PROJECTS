"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { CirclePlusIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentType } from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: ComponentType<{ className?: string }>
  }[]
}) {

  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {pathname.startsWith('/admin') && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="duration-200 ease-linear min-w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                render={
                  <Link href='/admin/courses/create' className="flex items-center gap-2"></Link>
                }
              >
                <CirclePlusIcon />
                <span>Quick Create</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={
                  <Link
                    href={item.url}
                    className={cn(pathname === item.url && "bg-accent text-accent-foreground")}
                  >
                    {item.icon && (() => {
                      const Icon = item.icon
                      return <Icon className={cn(pathname === item.url && 'text-primary')} />
                    })()}
                    <span>{item.title}</span>
                  </Link>
                }
              >
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
