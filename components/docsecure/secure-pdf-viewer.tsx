"use client"

import { useEffect, useRef, useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";

interface SecurePDFViewerProps {
  base64Content: string;
  isAdmin: boolean;
  documentTitle: string;
}

export function SecurePDFViewer({ base64Content, isAdmin, documentTitle }: SecurePDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  useEffect(() => {
    if (!isAdmin && typeof window !== 'undefined') {
      // Global context menu blocker - simpler and more effective
      const blockContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        setShowSecurityWarning(true);
        setTimeout(() => setShowSecurityWarning(false), 3000);
        return false;
      };

      // Global keyboard shortcut blocker
      const blockKeyboardShortcuts = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.metaKey) {
          e.preventDefault();
          setShowSecurityWarning(true);
          setTimeout(() => setShowSecurityWarning(false), 3000);
          return false;
        }
      };
      
      // Add global event listeners
      window.document.addEventListener('contextmenu', blockContextMenu);
      window.document.addEventListener('keydown', blockKeyboardShortcuts);

      return () => {
        window.document.removeEventListener('contextmenu', blockContextMenu);
        window.document.removeEventListener('keydown', blockKeyboardShortcuts);
      };
    }
  }, [isAdmin]);

  if (isAdmin) {
    // For admin users, show full PDF with all functionality
    return (
      <div className="w-full border rounded-lg bg-gray-50" style={{ height: '75vh', minHeight: '650px' }}>
        <iframe
          ref={iframeRef}
          src={`data:application/pdf;base64,${base64Content}`}
          className="w-full h-full rounded-lg"
          title="Document Preview"
          allow="fullscreen"
        />
      </div>
    );
  }

  // For regular users, show the PDF but with security restrictions
  return (
    <div className="w-full relative">
      {/* Read Only Label */}
      <div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded-lg px-3 py-1 flex items-center space-x-2 text-blue-800 text-xs font-medium shadow-sm">
        <FileText className="h-3 w-3" />
        <span>Lecture seule</span>
      </div>
      
      {/* Security Warning - Only shows when action is blocked */}
      {showSecurityWarning && (
        <div className="absolute top-2 right-2 z-20 bg-red-100 border border-red-300 rounded-lg px-3 py-2 flex items-center space-x-2 text-red-800 text-sm font-medium shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <span>Action bloquée</span>
        </div>
      )}
      
      {/* Secure PDF Viewer - A4 aspect ratio */}
      <div 
        ref={containerRef}
        className="w-full border rounded-lg bg-gray-50 docsecure-secure docsecure-no-print relative docsecure-no-context"
        style={{ 
          height: '75vh', 
          minHeight: '650px'
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        <iframe
          ref={iframeRef}
          src={`data:application/pdf;base64,${base64Content}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=100&disableexternallinks=true`}
          className="w-full h-full rounded-lg docsecure-iframe"
          title="Document Preview"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            border: 'none',
            pointerEvents: 'auto'
          }}
        />
      </div>
    </div>
  );
}