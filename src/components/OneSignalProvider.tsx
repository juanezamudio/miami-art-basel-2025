'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

// Initialize OneSignal only once
let isInitialized = false;

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized || typeof window === 'undefined') return;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

    if (!appId) {
      console.warn('OneSignal App ID not configured');
      return;
    }

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId,
          safari_web_id: 'web.onesignal.auto.40767e72-dc1c-4bfb-b1c2-39a715222d63',
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
        });

        isInitialized = true;
        setInitialized(true);

        // Set up tags for segmentation
        const favorites = localStorage.getItem('basel-ai-favorites');
        if (favorites) {
          const count = JSON.parse(favorites).length;
          await OneSignal.User.addTags({
            has_saved_events: count > 0 ? 'true' : 'false',
            saved_events_count: String(count),
          });
        }
      } catch (error) {
        console.error('OneSignal initialization failed:', error);
      }
    };

    initOneSignal();
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

    const checkSubscription = async () => {
      try {
        if (isInitialized) {
          const permission = await OneSignal.Notifications.permission;
          setIsSubscribed(permission);
        }
      } catch {
        // OneSignal not ready yet
      }
    };

    checkSubscription();

    // Listen for subscription changes
    const handleSubscriptionChange = (isSubscribed: boolean) => {
      setIsSubscribed(isSubscribed);
    };

    if (isInitialized) {
      OneSignal.Notifications.addEventListener('permissionChange', handleSubscriptionChange);
      return () => {
        OneSignal.Notifications.removeEventListener('permissionChange', handleSubscriptionChange);
      };
    }
  }, []);

  const subscribe = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
      const permission = await OneSignal.Notifications.permission;
      setIsSubscribed(permission);
      return permission;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  };

  const updateTags = async (tags: Record<string, string>) => {
    try {
      await OneSignal.User.addTags(tags);
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
