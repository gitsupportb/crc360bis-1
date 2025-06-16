"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/app/rsense/lib/utils"
import {
  Shield,
  TrendingUp,
  Wallet,
  AlertTriangle,
  FileBarChart,
  BarChart3,
  FileSpreadsheet,
  Upload,
  Users,
  Settings,
} from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const riskManagementItems = [
  {
    title: "Risque de Marché",
    href: "/rsense/risks/market",
    description: "Gestion et suivi des risques liés aux activités de marché",
    icon: TrendingUp,
  },
  {
    title: "Risque de Liquidité",
    href: "/rsense/risks/liquidity",
    description: "Surveillance des ratios de liquidité et stress tests",
    icon: Wallet,
  },
  {
    title: "Risque de Contrepartie",
    href: "/rsense/risks/counterparty",
    description: "Évaluation et suivi des expositions aux contreparties",
    icon: Shield,
  },
  {
    title: "Risque Opérationnel",
    href: "/rsense/risks/operational",
    description: "Gestion des incidents et contrôles opérationnels",
    icon: AlertTriangle,
  },
  {
    title: "Stress Tests Global",
    href: "/rsense/risks/stress-tests",
    description: "Analyse des stress tests réglementaires",
    icon: FileBarChart,
  },
]

const additionalItems = [
  {
    title: "Analytics",
    href: "/rsense/analytics",
    description: "Analyses et tableaux de bord",
    icon: BarChart3,
  },
  {
    title: "Upload",
    href: "/rsense/upload",
    description: "Téléchargement de fichiers",
    icon: Upload,
  },
  {
    title: "Users",
    href: "/rsense/users",
    description: "Gestion des utilisateurs",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/rsense/settings",
    description: "Paramètres et configuration",
    icon: Settings,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Link
        href="/rsense"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          padding: '6px 12px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.1)',
          transition: 'background 0.2s'
        }}
      >
        Dashboard
      </Link>

      <NavigationMenu>
        <NavigationMenuList>
          {/* Risk Management */}
          <NavigationMenuItem>
            <NavigationMenuTrigger style={{
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '6px 12px',
              borderRadius: '4px'
            }}>
              <Shield className="mr-2 h-4 w-4" />
              Gestion des Risques
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {riskManagementItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          pathname === item.href && "bg-accent",
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>



          {/* Additional Features */}
          <NavigationMenuItem>
            <NavigationMenuTrigger style={{
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '6px 12px',
              borderRadius: '4px'
            }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Outils
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                {additionalItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          pathname === item.href && "bg-accent",
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
