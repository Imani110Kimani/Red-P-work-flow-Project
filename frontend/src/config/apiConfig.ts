// API Configuration for Azure Functions
// Get function keys from Azure Portal → Function App → App Keys

// Email Verification API Configuration
export const EMAIL_VERIFICATION_CONFIG = {
  BASE_URL: 'https://simbaemailverificationapi-g4g4f9cfgtgtfsbu.westus-01.azurewebsites.net/api',
  // TODO: Replace with actual function key from Azure Portal
  FUNCTION_KEY: 'YOUR_FUNCTION_KEY_HERE'
};

// Add Approval API Configuration  
export const ADD_APPROVAL_CONFIG = {
  BASE_URL: 'https://simbaaddapproval-f8h7g2ffe2cefchh.westus-01.azurewebsites.net/api',
  // addApproval function appears to not require a key or uses different auth
  FUNCTION_KEY: '' 
};

// Login Verification API Configuration
export const LOGIN_VERIFICATION_CONFIG = {
  BASE_URL: 'https://simbaloginverification-buekhfdhdba5esdn.westus-01.azurewebsites.net/api'
  // Login verification function appears to not require a key
};

// Helper function to build URL with function key
export const buildFunctionUrl = (baseUrl: string, endpoint: string, functionKey?: string): string => {
  const url = `${baseUrl}/${endpoint}`;
  return functionKey ? `${url}?code=${functionKey}` : url;
};
