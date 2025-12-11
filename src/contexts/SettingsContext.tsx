import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi, SystemSettings } from '@/api/settings';
import { getImageUrl } from '@/utils/helpers';

interface SettingsContextType {
  settings: SystemSettings | undefined;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Update favicon and title when settings change
  useEffect(() => {
    if (settings) {
      // Update document title
      if (settings.siteName) {
        document.title = settings.siteName;
      }

      // Update favicon
      if (settings.siteFavicon) {
        const faviconUrl = getImageUrl(settings.siteFavicon);
        
        // Remove existing favicons
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => link.remove());

        // Add new favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);

        // Also add apple-touch-icon
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = faviconUrl;
        document.head.appendChild(appleLink);
      }
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
