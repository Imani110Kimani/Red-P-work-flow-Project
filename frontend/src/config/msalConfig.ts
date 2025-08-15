// MSAL configuration for Azure AD login
// import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '72a3b8b7-88dc-4325-a9a5-e8e7a915db27', // Simba Entra clientId from auth.js
    authority: 'https://login.microsoftonline.com/907b7f47-b8ae-4456-9e9c-b010d365753b', // Simba Entra tenantId from auth.js
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
    // system: { allowNativeBroker: boolean; }, // Remove or update to match BrowserSystemOptions if needed
    system: {}, // Updated to match BrowserSystemOptions if needed
};

export const loginRequest = {
  scopes: ["User.Read", "User.ReadBasic.All", "profile", "email"]
};
