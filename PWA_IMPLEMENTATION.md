# CRC360 PWA Implementation

## Overview
CRC360 has been transformed into a full-featured Progressive Web Application (PWA) with offline capabilities, push notifications, and native app-like experience.

## Features Implemented

### ✅ Core PWA Features
- **Web App Manifest** (`/public/manifest.json`)
- **Service Worker** (`/public/sw.js`) with advanced caching strategies
- **Offline Support** with custom offline page
- **Install Prompts** for mobile and desktop
- **Push Notifications** system

### ✅ Caching Strategies
- **Cache First**: Static assets, images, fonts
- **Network First**: API calls, dynamic content
- **Stale While Revalidate**: Background updates

### ✅ Notification System
- **Push Notifications** with service worker
- **Notification Categories**: Documents, AML Alerts, Reports, System
- **Interactive Notifications** with actions
- **Permission Management**

### ✅ Offline Capabilities
- **Cached Pages**: Main pages work offline
- **Static Resources**: Images, CSS, JS cached
- **Offline Indicator**: Shows connection status
- **Background Sync**: For when connection restored

## File Structure

```
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── offline.html           # Offline page
│   ├── browserconfig.xml      # Windows tiles config
│   └── icons/                 # PWA icons (needs generation)
├── components/pwa/
│   ├── pwa-provider.tsx       # PWA context provider
│   ├── install-prompt.tsx     # Install & offline indicators  
│   ├── notification-center.tsx # Notification management
│   └── pwa-notifications-demo.tsx # Demo component
├── lib/
│   └── notification-service.ts # Notification utilities
└── app/
    ├── layout.tsx             # PWA meta tags & providers
    └── pwa-settings/          # PWA management page
```

## Usage

### 1. PWA Provider
The app is wrapped with `PWAProvider` in the root layout:

```tsx
import { PWAProvider } from '@/components/pwa/pwa-provider'
import { InstallPrompt, OfflineIndicator } from '@/components/pwa/install-prompt'

export default function RootLayout({ children }) {
  return (
    <PWAProvider>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </PWAProvider>
  )
}
```

### 2. Using PWA Hooks
```tsx
import { usePWA } from '@/components/pwa/pwa-provider'

function MyComponent() {
  const { 
    isOnline, 
    isInstalled, 
    canNotify, 
    showNotification,
    installApp 
  } = usePWA()
  
  return (
    // Your component JSX
  )
}
```

### 3. Sending Notifications
```tsx
import notificationService from '@/lib/notification-service'

// Document notification
await notificationService.showDocumentNotification(
  'New Document',
  'Document name',
  '/docsecure/documents'
)

// AML Alert
await notificationService.showAMLNotification(
  'Suspicious Transaction',
  'Investigation required',
  '/amlcenter'
)

// Custom notification
await notificationService.showNotification({
  title: 'Custom Title',
  body: 'Custom message',
  url: '/custom-url'
})
```

## Configuration

### Next.js Configuration
The `next.config.mjs` has been updated with PWA-specific headers and caching rules.

### Service Worker Configuration
Edit `public/sw.js` to modify:
- Cache names and versions
- Caching strategies
- Static assets to pre-cache

### Notification Settings
Users can manage notifications at `/pwa-settings` or through the `NotificationCenter` component.

## Icons Setup

⚠️ **Icons Need Generation**: Use `/scripts/generate-icons.html` to create the required PWA icons:

Required icon sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

1. Open `/scripts/generate-icons.html` in browser
2. Click "Download All Icons"  
3. Place icons in `/public/icons/`

## Testing PWA Features

### Installation Testing
1. Open app in Chrome/Edge
2. Look for install prompt or use browser menu
3. Test desktop/mobile installation

### Offline Testing
1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Navigate the app to test offline functionality

### Notification Testing
1. Visit `/pwa-settings`
2. Enable notifications
3. Use the "Test des notifications" tab
4. Test different notification types

## Production Deployment

### Pre-deployment Checklist
- [ ] Generate and place all PWA icons
- [ ] Test offline functionality
- [ ] Verify manifest.json is accessible
- [ ] Test installation on mobile/desktop
- [ ] Configure VAPID keys for push notifications (optional)

### HTTPS Requirement
PWAs require HTTPS in production. Ensure:
- SSL certificate is properly configured
- Service worker loads over HTTPS
- Push notifications work over HTTPS

### Push Notifications Setup (Optional)
To enable server-side push notifications:

1. Generate VAPID keys:
```bash
npm install web-push -g
web-push generate-vapid-keys
```

2. Configure server endpoint for push subscriptions
3. Update notification service with VAPID public key

## Browser Support

### Supported Browsers
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### Features by Browser
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ✅ | ⚠️ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌ | ✅ |

## Troubleshooting

### Common Issues

1. **Service Worker Not Loading**
   - Check HTTPS requirement
   - Verify `/sw.js` is accessible
   - Check browser console for errors

2. **Install Prompt Not Showing**
   - Ensure all PWA criteria are met
   - Check manifest.json validation
   - Test on different browsers

3. **Notifications Not Working**
   - Check browser permissions
   - Verify HTTPS in production
   - Test notification service initialization

4. **Offline Mode Issues**
   - Check service worker caching strategies
   - Verify offline.html is accessible
   - Test cache updates

### Debugging Tools
- Chrome DevTools → Application tab
- Firefox DevTools → Application tab
- PWA Builder validation tools
- Lighthouse PWA audit

## Future Enhancements

### Planned Features
- [ ] Background sync for form submissions
- [ ] Push notification server integration
- [ ] Advanced caching for DocSecure files
- [ ] Offline form storage
- [ ] App shortcuts customization

### Performance Optimizations
- [ ] Implement lazy loading for PWA components
- [ ] Optimize cache sizes
- [ ] Add periodic cache cleanup
- [ ] Implement selective sync strategies

## Support
For PWA-related issues or questions, check:
1. Browser DevTools Application tab
2. Service worker registration status
3. Notification permissions
4. Network connectivity

The PWA implementation provides a robust foundation for offline functionality and native app-like experience while maintaining full web compatibility.