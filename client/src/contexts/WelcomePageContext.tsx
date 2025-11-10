import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchWelcomePage } from '../utils/fetchWelcomePage';

export interface ActiveLocation {
  ActiveLocationID?: number;
  LocationName: string;
  Address: string;
  BeginOperationOn: string;
  EndOperationOn?: string;
  DaysOfWeek: string[];
}

interface WelcomePageData {
  FoodTruckName: string;
  BackgroundURL?: string;
  ActiveLocations?: ActiveLocation[];
  Description?: string;
  Tagline?: string;
}

interface WelcomePageContextType {
  pageData: WelcomePageData | null;
  isLoading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
}

const WelcomePageContext = createContext<WelcomePageContextType | undefined>(undefined);

export function WelcomePageProvider({ children }: { children: ReactNode }) {
  const [pageData, setPageData] = useState<WelcomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchWelcomePage();

      console.log(pageData)

      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch welcome page data'));
      console.error('Error loading welcome page data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refetchData = async () => {
    await loadData();
  };

  return (
    <WelcomePageContext.Provider value={{ pageData, isLoading, error, refetchData }}>
      {children}
    </WelcomePageContext.Provider>
  );
}

export function useWelcomePage() {
  const context = useContext(WelcomePageContext);
  if (context === undefined) {
    throw new Error('useWelcomePage must be used within a WelcomePageProvider');
  }
  return context;
}
