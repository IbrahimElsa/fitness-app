import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
};

// Thin banner shown while the device is offline. Firestore queues writes and
// serves cached reads, so this is informational rather than blocking.
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-sm font-medium text-amber-950"
    >
      <WifiOff size={16} />
      <span>You're offline. Workouts and templates are saved on this device and will sync when you reconnect.</span>
    </div>
  );
};

export default OfflineBanner;
