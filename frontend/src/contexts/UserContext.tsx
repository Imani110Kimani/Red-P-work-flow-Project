import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msalConfig';
import type { ReactNode } from 'react';

interface UserContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  isLoggedIn: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userEmail, setUserEmailState] = useState<string | null>(null);

  // Load user email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('redp-user-email');
    if (savedEmail) {
      setUserEmailState(savedEmail);
    }
  }, []);

  const setUserEmail = (email: string | null) => {
    setUserEmailState(email);
    if (email) {
      localStorage.setItem('redp-user-email', email);
    } else {
      localStorage.removeItem('redp-user-email');
    }
  };

  const logout = async () => {
    setUserEmail(null);
    localStorage.removeItem('redp-user-email');
    // MSAL logout
    const msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    msalInstance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  };

  const isLoggedIn = userEmail !== null;

  const value: UserContextType = {
    userEmail,
    setUserEmail,
    isLoggedIn,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
