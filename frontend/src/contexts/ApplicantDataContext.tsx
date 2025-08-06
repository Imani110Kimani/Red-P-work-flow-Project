import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

// Basic applicant type from the API (GET with no params)
export type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  profileImage?: string;
};

// Detailed applicant type from the API (GET with partitionKey and rowKey)
export type ApplicantDetailed = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  approval1?: string;
  approval2?: string;
  denial1?: string;
  denial2?: string;
  timeOfApproval1?: string;
  timeOfApproval2?: string;
  timeOfDenial1?: string;
  timeOfDenial2?: string;
  [key: string]: any;
};

interface ApplicantDataContextType {
  // Basic applicant data
  applicants: ApplicantBasic[];
  loading: boolean;
  error: string | null;
  
  // Detailed applicant data (cached by partitionKey|rowKey)
  detailedApplicants: Record<string, ApplicantDetailed>;
  
  // Cache management
  lastFetched: Date | null;
  refetchApplicants: (force?: boolean) => Promise<void>;
  fetchApplicantDetails: (partitionKey: string, rowKey: string) => Promise<ApplicantDetailed | null>;
  fetchAllApplicantDetails: (applicants: ApplicantBasic[]) => Promise<void>;
  
  // Status update handlers (will automatically refetch after status changes)
  onStatusChange: (partitionKey: string, rowKey: string, newStatus: string) => void;
  
  // Manual cache invalidation
  invalidateCache: () => void;
}

const ApplicantDataContext = createContext<ApplicantDataContextType | undefined>(undefined);

export const useApplicantData = () => {
  const context = useContext(ApplicantDataContext);
  if (context === undefined) {
    throw new Error('useApplicantData must be used within an ApplicantDataProvider');
  }
  return context;
};

interface ApplicantDataProviderProps {
  children: ReactNode;
}

// API Configuration
const API_BASE_URL = 'https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const ApplicantDataProvider: React.FC<ApplicantDataProviderProps> = ({ children }) => {
  const [applicants, setApplicants] = useState<ApplicantBasic[]>([]);
  const [detailedApplicants, setDetailedApplicants] = useState<Record<string, ApplicantDetailed>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  
  // Track pending status changes to avoid unnecessary refetches
  const pendingStatusChanges = useRef<Set<string>>(new Set());

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    if (!lastFetched) return false;
    return (Date.now() - lastFetched.getTime()) < CACHE_DURATION;
  }, [lastFetched]);

  // Fetch all applicants from API
  const refetchApplicants = useCallback(async (force = false) => {
    // Don't refetch if cache is still valid and not forced
    if (!force && isCacheValid() && applicants.length > 0) {
      console.log('ApplicantDataContext: Using cached data');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('ApplicantDataContext: Fetching applicants from API');
      
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applicants: ${response.status} ${response.statusText}`);
      }
      
      const data: ApplicantBasic[] = await response.json();
      console.log(`ApplicantDataContext: Fetched ${data.length} applicants`);
      
      setApplicants(data);
      setLastFetched(new Date());
      
      // Clear pending status changes as we have fresh data
      pendingStatusChanges.current.clear();
    } catch (err) {
      console.error('ApplicantDataContext: Error fetching applicants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, applicants.length]);

  // Fetch detailed applicant data
  const fetchApplicantDetails = useCallback(async (partitionKey: string, rowKey: string): Promise<ApplicantDetailed | null> => {
    const key = `${partitionKey}|${rowKey}`;
    // Check if we already have cached detailed data that's relatively fresh
    if (detailedApplicants[key] && isCacheValid()) {
      console.log(`ApplicantDataContext: Using cached detailed data for ${key}`);
      console.debug('ApplicantDataContext: Cached detailed data:', detailedApplicants[key]);
      return detailedApplicants[key];
    }

    try {
      console.log(`ApplicantDataContext: Fetching detailed data for ${key}`);
      const url = `${API_BASE_URL}?partitionKey=${encodeURIComponent(partitionKey)}&rowKey=${encodeURIComponent(rowKey)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch applicant details: ${response.status} ${response.statusText}`);
      }

      const data: ApplicantDetailed = await response.json();
      console.debug('ApplicantDataContext: API detailed data response:', data);

      // Cache the detailed data
      setDetailedApplicants(prev => ({
        ...prev,
        [key]: data
      }));

      return data;
    } catch (err) {
      console.error(`ApplicantDataContext: Error fetching details for ${key}:`, err);
      return null;
    }
  }, [detailedApplicants, isCacheValid]);

  // Fetch detailed data for multiple applicants efficiently
  const fetchAllApplicantDetails = useCallback(async (applicantsList: ApplicantBasic[]) => {
    console.log(`ApplicantDataContext: Fetching detailed data for ${applicantsList.length} applicants`);
    
    // Filter out applicants we already have detailed data for
    const applicantsToFetch = applicantsList.filter(applicant => {
      const key = `${applicant.partitionKey}|${applicant.rowKey}`;
      return !detailedApplicants[key];
    });

    if (applicantsToFetch.length === 0) {
      console.log('ApplicantDataContext: All detailed data already cached');
      return;
    }

    console.log(`ApplicantDataContext: Fetching ${applicantsToFetch.length} new detailed records`);

    // Fetch detailed data for all missing applicants in parallel
    const fetchPromises = applicantsToFetch.map(async (applicant) => {
      const key = `${applicant.partitionKey}|${applicant.rowKey}`;
      try {
        const url = `${API_BASE_URL}?partitionKey=${encodeURIComponent(applicant.partitionKey)}&rowKey=${encodeURIComponent(applicant.rowKey)}`;
        const response = await fetch(url);

        if (response.ok) {
          const data: ApplicantDetailed = await response.json();
          console.debug('ApplicantDataContext: API detailed data response (batch):', { key, data });
          return { key, data };
        } else {
          console.warn(`Failed to fetch details for ${key}: ${response.status}`);
          return null;
        }
      } catch (err) {
        console.error(`Error fetching details for ${key}:`, err);
        return null;
      }
    });

    try {
      const results = await Promise.all(fetchPromises);
      
      // Update the detailed applicants cache with all the new data
      setDetailedApplicants(prev => {
        const updated = { ...prev };
        results.forEach(result => {
          if (result) {
            updated[result.key] = result.data;
          }
        });
        return updated;
      });
      
      console.log(`ApplicantDataContext: Successfully cached detailed data for ${results.filter(r => r !== null).length} applicants`);
    } catch (error) {
      console.error('ApplicantDataContext: Error in batch fetch:', error);
    }
  }, [detailedApplicants]);

  // Handle status changes (called after approve/deny actions)
  const onStatusChange = useCallback((partitionKey: string, rowKey: string, newStatus: string) => {
    const key = `${partitionKey}|${rowKey}`;
    console.log(`ApplicantDataContext: Status changed for ${key} to ${newStatus}`);
    
    // Mark this applicant as having a pending status change
    pendingStatusChanges.current.add(key);
    
    // Update the basic applicant data immediately for UI responsiveness
    setApplicants(prev => prev.map(applicant => {
      if (applicant.partitionKey === partitionKey && applicant.rowKey === rowKey) {
        return { ...applicant, status: newStatus };
      }
      return applicant;
    }));
    
    // Invalidate detailed cache for this specific applicant
    setDetailedApplicants(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    
    // Schedule a refetch after a short delay to get the latest data from the server
    setTimeout(() => {
      refetchApplicants(true);
    }, 1000);
  }, [refetchApplicants]);

  // Manual cache invalidation
  const invalidateCache = useCallback(() => {
    console.log('ApplicantDataContext: Cache invalidated manually');
    setLastFetched(null);
    setDetailedApplicants({});
    pendingStatusChanges.current.clear();
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refetchApplicants();
  }, [refetchApplicants]);

  // Auto-refetch on page visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCacheValid()) {
        console.log('ApplicantDataContext: Page became visible, checking cache validity');
        refetchApplicants();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchApplicants, isCacheValid]);

  const value: ApplicantDataContextType = {
    applicants,
    loading,
    error,
    detailedApplicants,
    lastFetched,
    refetchApplicants,
    fetchApplicantDetails,
    fetchAllApplicantDetails,
    onStatusChange,
    invalidateCache,
  };

  return (
    <ApplicantDataContext.Provider value={value}>
      {children}
    </ApplicantDataContext.Provider>
  );
};
