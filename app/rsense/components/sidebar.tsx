"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, FileSpreadsheet, Home, Settings, Shield, Upload, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "Risques",
    icon: Shield,
    href: "/risks",
    submenu: [
      { title: "Risque de Marché", href: "/risks/market" },
      { title: "Risque de Liquidité", href: "/risks/liquidity" },
      { title: "Risque de Contrepartie", href: "/risks/counterparty" },
      { title: "Risque Opérationnel", href: "/risks/operational" },
    ],
  },
  {
    title: "Reporting",
    icon: FileSpreadsheet,
    href: "/reporting",
    submenu: [
      { title: "Reporting BAM", href: "/reporting/Bam" },
      { title: "Reporting AMMC", href: "/reporting/ammc" },
    ],
  },
  {
    title: "Upload",
    icon: Upload,
    href: "/upload",
  },
  {
    title: "Analyses",
    icon: BarChart3,
    href: "/analyses",
  },
  {
    title: "Utilisateurs",
    icon: Users,
    href: "/users",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://mediafinance.gbp.ma/Style%20Library/assets/images/logo.svg"
            alt="BCP2S Logo"
            width={200}
            height={50}
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href} className="mb-4">
              <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href)} tooltip={item.title}>
                <Link href={item.href} className="flex items-center font-bold">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.submenu && (pathname === item.href || pathname.startsWith(item.href)) && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <SidebarMenuButton key={subitem.href} asChild isActive={pathname === subitem.href} size="sm">
                      <Link href={subitem.href} className="font-bold">{subitem.title}</Link>
                    </SidebarMenuButton>
                  ))}
                </div>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">© 2024 BCP2S</span>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
