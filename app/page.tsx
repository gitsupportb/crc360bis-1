"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Dashboard() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const handleCardClick = (cardId: string) => {
    setActiveCard(cardId)
    setTimeout(() => setActiveCard(null), 600)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative h-24 w-72">
              <Image src="/logo.png" alt="BCP Securities Services" fill className="object-contain" priority />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/rep-watch"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              Rep Watch
            </Link>
            <Link
              href="/amlcenter"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>🛡️</span>
              AML Center
            </Link>
            <Link
              href="/docsecure"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📄</span>
              Doc Secure
            </Link>
            <Link
              href="/rsense"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              R-Sense
            </Link>
          </nav>
        </div>
      </header>

      <div className="bg-orange-500 h-0.5"></div>

      {/* Hero Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">CRC-360°</h1>
          <div className="mt-6 border-t border-orange-500 w-24 mx-auto"></div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RISK DASHBOARD */}
          <Link
            href="/rep-watch"
            onClick={() => handleCardClick("risk")}
            className={`relative h-60 rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 text-left transform ${
              activeCard === "risk" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div
              className="relative w-full h-full bg-contain bg-no-repeat bg-left-top"
              style={{ backgroundImage: 'url(/Image1.png)' }}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                <h3 className="text-2xl font-bold mb-3">Rep watch</h3>
                <p className="mb-4">Comprehensive risk monitoring and analysis tools for your portfolio.</p>
                <div className="flex items-center text-sm font-bold group-hover:text-orange-600 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "risk" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* AML */}
          <Link
            href="/amlcenter"
            onClick={() => handleCardClick("aml")}
            className={`relative h-60 rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 text-left transform ${
              activeCard === "aml" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div
              className="relative w-full h-full bg-contain bg-no-repeat bg-left-top"
              style={{ backgroundImage: 'url(/Image2.png)' }}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                <h3 className="text-2xl font-bold mb-3">AML CENTER</h3>
                <p className="mb-4">Anti-Money Laundering compliance and monitoring system.</p>
                <div className="flex items-center text-sm font-bold group-hover:text-orange-500 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "aml" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* DOC SECURE */}
          <Link
            href="/docsecure"
            onClick={() => handleCardClick("doc")}
            className={`relative h-60 rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 text-left transform ${
              activeCard === "doc" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div
              className="relative w-full h-full bg-contain bg-no-repeat bg-left-top"
              style={{ backgroundImage: 'url(/Image4.png)' }}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                <h3 className="text-2xl font-bold mb-3">DOC SECURE</h3>
                <p className="mb-4">Secure document management and storage solution.</p>
                <div className="flex items-center text-sm font-bold group-hover:text-orange-600 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "doc" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* R-SENSE */}
          <Link
            href="/rsense"
            onClick={() => handleCardClick("rsense")}
            className={`relative h-60 rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100 text-left transform ${
              activeCard === "rsense" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div
              className="relative w-full h-full bg-contain bg-no-repeat bg-left-top"
              style={{ backgroundImage: 'url(/Image3.png)' }}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                <h3 className="text-2xl font-bold mb-3">R-SENSE</h3>
                <p className="mb-4">Advanced risk calculation and modeling tools.</p>
                <div className="flex items-center text-sm font-bold group-hover:text-orange-600 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "rsense" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">&copy; 2025 BCP Securities Services. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Terms
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Privacy
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
