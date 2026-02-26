import * as React from "react"
import { NavLink } from "react-router-dom"
import { Radio, Volume2, Settings, AudioWaveform } from "lucide-react"
import { useIntl } from "react-intl"
import { cn } from "../lib/utils"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const items = [
  { to: "/broadcast", labelId: "sidebar.broadcast", icon: Radio },
  { to: "/listen", labelId: "sidebar.listen", icon: Volume2 },
  { to: "/settings", labelId: "sidebar.settings", icon: Settings },
]

export function AppSidebar() {
  const intl = useIntl()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <AudioWaveform className="size-4" />
              </div>
              <span className="truncate font-bold text-sm">VoiceShare</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu className="gap-1 px-2">
          {items.map(({ to, labelId, icon: Icon }) => (
            <SidebarMenuItem key={to}>
              <NavLink to={to}>
                {({ isActive }) => (
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={intl.formatMessage({ id: labelId })}
                    className={cn(
                      "h-11 transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", isActive && "scale-110")} />
                    <span className="font-semibold">{intl.formatMessage({ id: labelId })}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="mx-2 opacity-50" />

      <SidebarFooter className="py-4 flex items-center justify-center">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          v1.0.0-beta
        </span>
      </SidebarFooter>
    </Sidebar>
  )
}
