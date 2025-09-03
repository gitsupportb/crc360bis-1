'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react'
import { usePWA } from './pwa-provider'

export function InstallPrompt() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const hasDismissed = localStorage.getItem('pwa-install-dismissed')
    setDismissed(hasDismissed === 'true')

    // Show prompt after a delay if installable and not dismissed
    if (isInstallable && !isInstalled && !hasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    await installApp()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || !isInstallable || isInstalled || dismissed) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" />
      
      {/* Install prompt */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <Card className="shadow-2xl border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  Install CRC360 App
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get quick access to your dashboard, work offline, and receive push notifications.
                </p>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile friendly</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    <span>Desktop app</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span>Works offline</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
    } else {
      // Hide offline indicator after a delay when back online
      const timer = setTimeout(() => {
        setShowOffline(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showOffline) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Card className={`shadow-lg transition-all duration-300 ${
        isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <CardContent className="px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Back online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Working offline</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}