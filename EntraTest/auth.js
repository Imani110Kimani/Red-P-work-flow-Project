// Azure AD Configuration with Logging
// Configured with your Azure AD app registration details
const msalConfig = {
    auth: {
        clientId: "72a3b8b7-88dc-4325-a9a5-e8e7a915db27", // Your Application (client) ID
        authority: "https://login.microsoftonline.com/907b7f47-b8ae-4456-9e9c-b010d365753b", // Your Directory (tenant) ID
        redirectUri: window.location.origin // Current page URL
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

// Permissions we want to request
const loginRequest = {
    scopes: ["User.Read"]
};

// Create MSAL instance
let myMSALObj;

// Initialize MSAL with logging
try {
    logger.info('Initializing MSAL with configuration', {
        clientId: msalConfig.auth.clientId,
        authority: msalConfig.auth.authority,
        redirectUri: msalConfig.auth.redirectUri
    });
    
    myMSALObj = new msal.PublicClientApplication(msalConfig);
    logger.info('MSAL instance created successfully');
} catch (error) {
    logger.error('Failed to create MSAL instance', error);
}

// DOM Elements
const welcomePage = document.getElementById('welcomePage');
const loggedInPage = document.getElementById('loggedInPage');
const loadingSpinner = document.getElementById('loadingSpinner');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

// Initialize the app
async function initializeApp() {
    logger.info('Starting application initialization');
    
    try {
        logger.debug('Handling redirect promise');
        // Handle redirect response
        const response = await myMSALObj.handleRedirectPromise();
        
        if (response) {
            // User just logged in
            logger.info('Login successful via redirect', {
                account: response.account.name,
                username: response.account.username
            });
            await displayUserInfo(response.account);
        } else {
            logger.debug('No redirect response, checking existing accounts');
            // Check if user is already logged in
            const accounts = myMSALObj.getAllAccounts();
            
            if (accounts.length > 0) {
                logger.info('Found existing authenticated account', {
                    accountCount: accounts.length,
                    account: accounts[0].name
                });
                // User is already logged in
                await displayUserInfo(accounts[0]);
            } else {
                logger.info('No authenticated accounts found, showing welcome page');
                // User is not logged in, show welcome page
                showWelcomePage();
            }
        }
    } catch (error) {
        logger.error('Error during application initialization', error);
        showWelcomePage();
        alert('Error during initialization. Please try again.');
    }
}

// Show welcome page
function showWelcomePage() {
    logger.debug('Displaying welcome page');
    welcomePage.classList.remove('hidden');
    loggedInPage.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
}

// Show logged in page
function showLoggedInPage() {
    logger.debug('Displaying logged in page');
    welcomePage.classList.add('hidden');
    loggedInPage.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
}

// Show loading spinner
function showLoading() {
    logger.debug('Displaying loading spinner');
    welcomePage.classList.add('hidden');
    loggedInPage.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
}

// Handle login
async function handleLogin() {
    logger.info('Login process initiated');
    
    try {
        showLoading();
        logger.debug('Checking for existing accounts');
        
        // Try silent login first
        const accounts = myMSALObj.getAllAccounts();
        if (accounts.length > 0) {
            logger.debug('Attempting silent token acquisition');
            const silentRequest = {
                ...loginRequest,
                account: accounts[0]
            };
            
            try {
                const response = await myMSALObj.acquireTokenSilent(silentRequest);
                logger.info('Silent token acquisition successful');
                await displayUserInfo(response.account);
                return;
            } catch (silentError) {
                logger.warn('Silent token acquisition failed, falling back to redirect', silentError);
            }
        }
        
        // If silent login fails, use redirect
        logger.info('Initiating login redirect');
        await myMSALObj.loginRedirect(loginRequest);
        
    } catch (error) {
        logger.error('Login process failed', error);
        showWelcomePage();
        
        if (error.message && error.message.includes('CLIENT_ID')) {
            alert('Please configure your Azure AD application details in auth.js');
        } else {
            alert('Login failed. Please try again.');
        }
    }
}

// Handle logout
async function handleLogout() {
    logger.info('Logout process initiated');
    
    try {
        const accounts = myMSALObj.getAllAccounts();
        if (accounts.length > 0) {
            logger.debug('Logging out account', { account: accounts[0].name });
            await myMSALObj.logoutRedirect({
                account: accounts[0]
            });
        } else {
            logger.warn('No accounts found to logout');
        }
    } catch (error) {
        logger.error('Logout failed', error);
        alert('Logout failed. Please try again.');
    }
}

// Display user information
async function displayUserInfo(account) {
    logger.info('Displaying user information', { account: account.name });
    
    try {
        logger.debug('Acquiring access token for Microsoft Graph');
        // Get additional user info from Microsoft Graph
        const accessToken = await getAccessToken(account);
        logger.debug('Access token acquired successfully');
        
        const userInfo = await getUserInfo(accessToken);
        logger.info('User information retrieved from Microsoft Graph', {
            displayName: userInfo.displayName,
            email: userInfo.mail || userInfo.userPrincipalName
        });
        
        // Display user information
        userName.textContent = userInfo.displayName || account.name || 'Unknown User';
        userEmail.textContent = userInfo.mail || userInfo.userPrincipalName || account.username || 'Unknown Email';
        
        showLoggedInPage();
        logger.info('User interface updated successfully');
        
    } catch (error) {
        logger.warn('Failed to get user info from Microsoft Graph, using account fallback', error);
        // Fallback to account info
        userName.textContent = account.name || 'Unknown User';
        userEmail.textContent = account.username || 'Unknown Email';
        showLoggedInPage();
    }
}

// Get access token
async function getAccessToken(account) {
    logger.debug('Requesting access token');
    
    const request = {
        ...loginRequest,
        account: account
    };
    
    try {
        const response = await myMSALObj.acquireTokenSilent(request);
        logger.debug('Access token acquired', { 
            scopes: response.scopes,
            expiresOn: response.expiresOn 
        });
        return response.accessToken;
    } catch (error) {
        logger.error('Failed to acquire access token', error);
        throw error;
    }
}

// Get user info from Microsoft Graph
async function getUserInfo(accessToken) {
    logger.debug('Fetching user information from Microsoft Graph API');
    
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Microsoft Graph API request failed', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userInfo = await response.json();
        logger.debug('Microsoft Graph API response received', {
            id: userInfo.id,
            displayName: userInfo.displayName,
            mail: userInfo.mail,
            userPrincipalName: userInfo.userPrincipalName
        });
        
        return userInfo;
    } catch (error) {
        logger.error('Error fetching user info from Microsoft Graph', error);
        throw error;
    }
}

// Event listeners
logger.debug('Setting up event listeners');
loginButton.addEventListener('click', handleLogin);
logoutButton.addEventListener('click', handleLogout);

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    logger.info('DOM loaded, initializing application');
    initializeApp();
});
