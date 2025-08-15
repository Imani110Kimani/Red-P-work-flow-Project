import React, { createContext, useContext, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msalConfig';
import type { ReactNode } from 'react';

interface UserContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  userPhoto: string | null; // base64 or url
  setUserPhoto: (photo: string | null) => void;
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
  // Set initial state from localStorage for instant availability on first render
  const [userEmail, setUserEmailState] = useState<string | null>(() => localStorage.getItem('redp-user-email'));
  const [userName, setUserNameState] = useState<string | null>(() => localStorage.getItem('redp-user-name'));
  const [userPhoto, setUserPhotoState] = useState<string | null>(() => localStorage.getItem('redp-user-photo'));

  const setUserEmail = (email: string | null) => {
    setUserEmailState(email);
    if (email) {
      localStorage.setItem('redp-user-email', email);
    } else {
      localStorage.removeItem('redp-user-email');
    }
  };

  const setUserName = (name: string | null) => {
    setUserNameState(name);
    if (name) {
      localStorage.setItem('redp-user-name', name);
    } else {
      localStorage.removeItem('redp-user-name');
    }
  };

  const setUserPhoto = (photo: string | null) => {
    setUserPhotoState(photo);
    if (photo) {
      localStorage.setItem('redp-user-photo', photo);
    } else {
      localStorage.removeItem('redp-user-photo');
    }
  };

  const logout = async () => {
    setUserEmail(null);
    localStorage.removeItem('redp-user-email');
    // MSAL logout
    const msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    await msalInstance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
    // After logout, redirect to sign-in page
    window.location.href = '/';
  };

  const isLoggedIn = userEmail !== null;

  const value: UserContextType = {
    userEmail,
    setUserEmail,
    userName,
    setUserName,
    userPhoto,
    setUserPhoto,
    isLoggedIn,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
