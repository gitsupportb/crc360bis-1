"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "Tableau de bord",
      active: pathname === "/dashboard",
    },
    {
      href: "/documents",
      label: "Documents",
      active: pathname === "/documents",
    },
    {
      href: "/import",
      label: "Importer",
      active: pathname === "/import",
    },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative h-12 w-48 mr-6">
          <div className="flex items-center">
            <Image src="/images/bcp-logo.jpg" alt="BCP Securities Services" fill style={{ objectFit: "contain" }} />
            <span className="sr-only">DOC SECURE</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-black dark:text-white" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="relative h-12 w-full mb-6">
              <div className="flex items-center">
                <Image src="/images/bcp-logo.jpg" alt="BCP Securities Services" fill style={{ objectFit: "contain" }} />
                <span className="sr-only">DOC SECURE</span>
              </div>
            </div>
            <nav className="flex flex-col space-y-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-black dark:text-white" : "text-muted-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
