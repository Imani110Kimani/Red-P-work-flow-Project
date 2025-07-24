import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApplicantDataProvider } from './contexts/ApplicantDataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <NotificationProvider>
        <ApplicantDataProvider>
          <App />
        </ApplicantDataProvider>
      </NotificationProvider>
    </UserProvider>
  </StrictMode>,
)
