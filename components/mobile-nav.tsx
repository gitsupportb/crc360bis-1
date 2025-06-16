"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600" aria-label="Toggle menu">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-600" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-6 p-4">
            <Link
              href="#"
              className="text-gray-800 hover:text-orange-500 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-gray-800 hover:text-orange-500 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="#"
              className="text-gray-800 hover:text-orange-500 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#"
              className="text-gray-800 hover:text-orange-500 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors w-full mt-4">
              Client Portal
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
