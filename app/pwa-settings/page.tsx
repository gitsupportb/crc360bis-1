'use client'

import { SimplePWASettings } from './simple-client'
import { useEffect, useState } from 'react'

export default function PWASettingsPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return <SimplePWASettings />
}