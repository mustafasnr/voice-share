import * as React from "react"
import { Radio, Volume2, Settings, AudioWaveform } from "lucide-react"
import { useStore } from "../store/useStore"
import { useIntl } from "react-intl"

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

export function AppSidebar() {
  const { activeTab, setActiveTab } = useStore()
  const intl = useIntl()

  const items = [
    { id: "broadcast", label: intl.formatMessage({ id: "sidebar.broadcast" }), icon: Radio },
    { id: "listen", label: intl.formatMessage({ id: "sidebar.listen" }), icon: Volume2 },
    { id: "settings", label: intl.formatMessage({ id: "sidebar.settings" }), icon: Settings },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <AudioWaveform className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-lg">VoiceShare</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu className="gap-2 px-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => setActiveTab(item.id)}
                  tooltip={item.label}
                  className={`h-11 transition-all duration-200 ${isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-muted-foreground hover:bg-accent"
                    }`}
                >
                  <Icon className={`size-5 ${isActive ? "scale-110" : ""}`} />
                  <span className="font-semibold">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="mx-2 opacity-50" />

      <SidebarFooter className="py-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            v1.0.0-beta
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
