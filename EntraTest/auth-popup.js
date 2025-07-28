// Azure AD Configuration with Popup Authentication (NO REDIRECTS)
// Configured with your Azure AD app registration details
const msalConfig = {
    auth: {
        clientId: "72a3b8b7-88dc-4325-a9a5-e8e7a915db27", // Your Application (client) ID
        authority: "https://login.microsoftonline.com/907b7f47-b8ae-4456-9e9c-b010d365753b", // Your Directory (tenant) ID
        redirectUri: window.location.origin // Current page URL (required but we use popup)
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

// DOM Elements - will be initialized when DOM is ready
let welcomePage, loggedInPage, loadingSpinner, loginButton, logoutButton, userName, userEmail;

// Initialize MSAL with logging
try {
    console.log('Creating MSAL instance...');
    if (typeof logger !== 'undefined') {
        logger.info('Initializing MSAL with configuration', {
            clientId: msalConfig.auth.clientId,
            authority: msalConfig.auth.authority,
            redirectUri: msalConfig.auth.redirectUri
        });
    }
    
    myMSALObj = new msal.PublicClientApplication(msalConfig);
    console.log('MSAL instance created successfully');
    if (typeof logger !== 'undefined') {
        logger.info('MSAL instance created successfully');
    }
} catch (error) {
    console.error('Failed to create MSAL instance', error);
    if (typeof logger !== 'undefined') {
        logger.error('Failed to create MSAL instance', error);
    }
}

// Initialize DOM elements when ready
function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    welcomePage = document.getElementById('welcomePage');
    loggedInPage = document.getElementById('loggedInPage');
    loadingSpinner = document.getElementById('loadingSpinner');
    loginButton = document.getElementById('loginButton');
    logoutButton = document.getElementById('logoutButton');
    userName = document.getElementById('userName');
    userEmail = document.getElementById('userEmail');
    
    console.log('DOM elements found:', {
        welcomePage: !!welcomePage,
        loggedInPage: !!loggedInPage,
        loadingSpinner: !!loadingSpinner,
        loginButton: !!loginButton,
        logoutButton: !!logoutButton,
        userName: !!userName,
        userEmail: !!userEmail
    });
    
    if (typeof logger !== 'undefined') {
        logger.debug('DOM elements initialized', {
            welcomePage: !!welcomePage,
            loggedInPage: !!loggedInPage,
            loadingSpinner: !!loadingSpinner,
            loginButton: !!loginButton,
            logoutButton: !!logoutButton,
            userName: !!userName,
            userEmail: !!userEmail
        });
    }
    
    // Add event listeners
    if (loginButton) {
        console.log('Adding event listener to login button');
        loginButton.addEventListener('click', function(event) {
            console.log('Login button clicked - event fired!');
            event.preventDefault();
            handleLogin();
        });
        
        // Also add a direct onclick as fallback
        loginButton.onclick = function(event) {
            console.log('Login button clicked - onclick fired!');
            event.preventDefault();
            handleLogin();
        };
        
        if (typeof logger !== 'undefined') {
            logger.debug('Login button event listener added');
        }
    } else {
        console.error('Login button not found in DOM!');
        if (typeof logger !== 'undefined') {
            logger.error('Login button not found in DOM');
        }
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        if (typeof logger !== 'undefined') {
            logger.debug('Logout button event listener added');
        }
    }
}

// Initialize the app - POPUP ONLY, NO REDIRECTS
async function initializeApp() {
    console.log('Initializing app with POPUP authentication only...');
    if (typeof logger !== 'undefined') {
        logger.info('Starting application initialization - POPUP MODE');
    }
    
    try {
        // Check if user is already logged in (no redirect handling needed for popup)
        console.log('Checking existing accounts...');
        const accounts = myMSALObj.getAllAccounts();
        
        if (accounts.length > 0) {
            console.log('Found existing authenticated account:', accounts[0].name);
            if (typeof logger !== 'undefined') {
                logger.info('Found existing authenticated account', {
                    accountCount: accounts.length,
                    account: accounts[0].name
                });
            }
            // User is already logged in
            await displayUserInfo(accounts[0]);
        } else {
            console.log('No authenticated accounts found, showing welcome page');
            if (typeof logger !== 'undefined') {
                logger.info('No authenticated accounts found, showing welcome page');
            }
            // User is not logged in, show welcome page
            showWelcomePage();
        }
    } catch (error) {
        console.error('Error during application initialization:', error);
        if (typeof logger !== 'undefined') {
            logger.error('Error during application initialization', error);
        }
        showWelcomePage();
        alert('Error during initialization. Please try again.');
    }
}

// Show welcome page
function showWelcomePage() {
    console.log('Showing welcome page');
    if (typeof logger !== 'undefined') {
        logger.debug('Displaying welcome page');
    }
    if (welcomePage) welcomePage.classList.remove('hidden');
    if (loggedInPage) loggedInPage.classList.add('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

// Show logged in page
function showLoggedInPage() {
    console.log('Showing logged in page');
    if (typeof logger !== 'undefined') {
        logger.debug('Displaying logged in page');
    }
    if (welcomePage) welcomePage.classList.add('hidden');
    if (loggedInPage) loggedInPage.classList.remove('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

// Show loading spinner
function showLoading() {
    console.log('Showing loading spinner');
    if (typeof logger !== 'undefined') {
        logger.debug('Displaying loading spinner');
    }
    if (welcomePage) welcomePage.classList.add('hidden');
    if (loggedInPage) loggedInPage.classList.add('hidden');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
}

// Handle login - POPUP ONLY
async function handleLogin() {
    console.log('=== HANDLE LOGIN CALLED - POPUP MODE ===');
    if (typeof logger !== 'undefined') {
        logger.info('Login process initiated - POPUP MODE');
    }
    
    if (!myMSALObj) {
        const error = 'MSAL not initialized';
        console.error(error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        alert('Authentication library not initialized. Please refresh the page.');
        return;
    }
    
    console.log('MSAL object exists, proceeding with POPUP login...');
    
    try {
        showLoading();
        
        // POPUP LOGIN - This should work in iframes
        console.log('Starting POPUP login...');
        if (typeof logger !== 'undefined') {
            logger.info('Initiating POPUP login');
        }
        
        const loginResponse = await myMSALObj.loginPopup(loginRequest);
        console.log('POPUP login successful:', loginResponse);
        
        if (loginResponse && loginResponse.account) {
            console.log('Login successful, account:', loginResponse.account.name);
            if (typeof logger !== 'undefined') {
                logger.info('POPUP login successful', {
                    account: loginResponse.account.name,
                    username: loginResponse.account.username
                });
            }
            await displayUserInfo(loginResponse.account);
        } else {
            throw new Error('No account returned from login');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        if (typeof logger !== 'undefined') {
            logger.error('Login process failed', error);
        }
        showWelcomePage();
        
        if (error.message && error.message.includes('CLIENT_ID')) {
            alert('Please configure your Azure AD application details in auth.js');
        } else if (error.message && error.message.includes('popup')) {
            alert('Popup was blocked or closed. Please allow popups and try again.');
        } else {
            alert('Login failed: ' + error.message + '. Please try again.');
        }
    }
}

// Handle logout - POPUP ONLY
async function handleLogout() {
    console.log('Logout initiated - POPUP MODE');
    if (typeof logger !== 'undefined') {
        logger.info('Logout process initiated - POPUP MODE');
    }
    
    try {
        const accounts = myMSALObj.getAllAccounts();
        if (accounts.length > 0) {
            console.log('Logging out account:', accounts[0].name);
            if (typeof logger !== 'undefined') {
                logger.debug('Logging out account', { account: accounts[0].name });
            }
            await myMSALObj.logoutPopup({
                account: accounts[0]
            });
            console.log('Logout successful');
            if (typeof logger !== 'undefined') {
                logger.info('Logout successful');
            }
            showWelcomePage();
        } else {
            console.log('No accounts found to logout');
            if (typeof logger !== 'undefined') {
                logger.warn('No accounts found to logout');
            }
        }
    } catch (error) {
        console.error('Logout failed:', error);
        if (typeof logger !== 'undefined') {
            logger.error('Logout failed', error);
        }
        alert('Logout failed. Please try again.');
    }
}

// Display user information and redirect to dashboard
async function displayUserInfo(account) {
    console.log('Displaying user information for:', account.name);
    if (typeof logger !== 'undefined') {
        logger.info('Displaying user information', { account: account.name });
    }
    
    try {
        console.log('Acquiring access token for Microsoft Graph...');
        if (typeof logger !== 'undefined') {
            logger.debug('Acquiring access token for Microsoft Graph');
        }
        
        // Get additional user info from Microsoft Graph
        const accessToken = await getAccessToken(account);
        console.log('Access token acquired successfully');
        if (typeof logger !== 'undefined') {
            logger.debug('Access token acquired successfully');
        }
        
        const userInfo = await getUserInfo(accessToken);
        console.log('User information retrieved:', userInfo.displayName);
        if (typeof logger !== 'undefined') {
            logger.info('User information retrieved from Microsoft Graph', {
                displayName: userInfo.displayName,
                email: userInfo.mail || userInfo.userPrincipalName
            });
        }
        
        // Show success message briefly before redirecting
        if (userName && userEmail) {
            userName.textContent = userInfo.displayName || account.name || 'Unknown User';
            userEmail.textContent = userInfo.mail || userInfo.userPrincipalName || account.username || 'Unknown Email';
            showLoggedInPage();
        }
        
        console.log('Login successful, redirecting to dashboard...');
        if (typeof logger !== 'undefined') {
            logger.info('Login successful, redirecting to dashboard');
        }
        
        // Redirect to dashboard after a brief delay to show success
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.log('Failed to get user info from Microsoft Graph, using account fallback:', error);
        if (typeof logger !== 'undefined') {
            logger.warn('Failed to get user info from Microsoft Graph, using account fallback', error);
        }
        
        // Fallback to account info
        if (userName && userEmail) {
            userName.textContent = account.name || 'Unknown User';
            userEmail.textContent = account.username || 'Unknown Email';
            showLoggedInPage();
        }
        
        console.log('Login successful (with fallback info), redirecting to dashboard...');
        if (typeof logger !== 'undefined') {
            logger.info('Login successful (with fallback info), redirecting to dashboard');
        }
        
        // Redirect to dashboard even if Graph API fails
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

// Get access token
async function getAccessToken(account) {
    console.log('Requesting access token...');
    if (typeof logger !== 'undefined') {
        logger.debug('Requesting access token');
    }
    
    const request = {
        ...loginRequest,
        account: account
    };
    
    try {
        const response = await myMSALObj.acquireTokenSilent(request);
        console.log('Access token acquired');
        if (typeof logger !== 'undefined') {
            logger.debug('Access token acquired', { 
                scopes: response.scopes,
                expiresOn: response.expiresOn 
            });
        }
        return response.accessToken;
    } catch (error) {
        console.error('Failed to acquire access token:', error);
        if (typeof logger !== 'undefined') {
            logger.error('Failed to acquire access token', error);
        }
        throw error;
    }
}

// Get user info from Microsoft Graph
async function getUserInfo(accessToken) {
    console.log('Calling Microsoft Graph API...');
    if (typeof logger !== 'undefined') {
        logger.debug('Calling Microsoft Graph API');
    }
    
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Microsoft Graph API error:', response.status, errorText);
            if (typeof logger !== 'undefined') {
                logger.error('Microsoft Graph API error', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userInfo = await response.json();
        console.log('Microsoft Graph API response received');
        if (typeof logger !== 'undefined') {
            logger.debug('Microsoft Graph API response received', {
                id: userInfo.id,
                displayName: userInfo.displayName,
                mail: userInfo.mail,
                userPrincipalName: userInfo.userPrincipalName
            });
        }
        
        return userInfo;
    } catch (error) {
        console.error('Error fetching user info from Microsoft Graph:', error);
        if (typeof logger !== 'undefined') {
            logger.error('Error fetching user info from Microsoft Graph', error);
        }
        throw error;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    if (typeof logger !== 'undefined') {
        logger.info('DOM loaded, initializing application');
    }
    
    // Initialize DOM elements first
    initializeDOMElements();
    
    // Then initialize the app
    initializeApp();
});

console.log('Auth.js loaded - POPUP MODE ONLY');
