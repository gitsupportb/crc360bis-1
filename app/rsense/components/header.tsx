import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aT4YYTB5H2OJfKbXvvbH5WmflwI7BR.png"
          alt="BCP2S Logo"
          width={120}
          height={40}
          className="mr-8"
        />
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

