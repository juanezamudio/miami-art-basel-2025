'use client';

import { useEffect, useState } from 'react';

// Declare OneSignal on window
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalType) => void>;
    OneSignal?: OneSignalType;
  }
}

interface OneSignalType {
  init: (config: Record<string, unknown>) => Promise<void>;
  Notifications: {
    permission: boolean;
    requestPermission: () => Promise<void>;
    addEventListener: (event: string, callback: (data: boolean) => void) => void;
    removeEventListener: (event: string, callback: (data: boolean) => void) => void;
  };
  User: {
    addTags: (tags: Record<string, string>) => Promise<void>;
  };
}

// Initialize OneSignal only once
let isInitialized = false;
let oneSignalInstance: OneSignalType | null = null;

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isInitialized || typeof window === 'undefined') return;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

    if (!appId) {
      console.warn('OneSignal App ID not configured');
      return;
    }

    // Load OneSignal SDK script
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    // Initialize OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        await OneSignal.init({
          appId,
          safari_web_id: 'web.onesignal.auto.40767e72-dc1c-4bfb-b1c2-39a715222d63',
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          },
          welcomeNotification: {
            disable: true,
          },
        });

        isInitialized = true;
        oneSignalInstance = OneSignal;
        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('OneSignal initialization failed:', error);
      }
    });

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return <>{children}</>;
}

// Custom hook to access OneSignal functionality
export function useOneSignal() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if push notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    const checkSubscription = () => {
      if (oneSignalInstance) {
        const permission = oneSignalInstance.Notifications.permission;
        setIsSubscribed(permission);
      }
    };

    // Check periodically until OneSignal is ready
    const interval = setInterval(() => {
      if (oneSignalInstance) {
        checkSubscription();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const subscribe = async () => {
    try {
      if (!oneSignalInstance) {
        console.error('OneSignal not initialized yet');
        return false;
      }
      await oneSignalInstance.Notifications.requestPermission();
      const permission = oneSignalInstance.Notifications.permission;
      setIsSubscribed(permission);
      return permission;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  };

  const updateTags = async (tags: Record<string, string>) => {
    try {
      if (oneSignalInstance) {
        await oneSignalInstance.User.addTags(tags);
      }
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  return {
    isSubscribed,
    isSupported,
    subscribe,
    updateTags,
  };
}
