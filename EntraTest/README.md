# Azure Active Directory Authentication Demo

A simple HTML website that demonstrates Azure Active Directory authentication using MSAL.js (Microsoft Authentication Library).

## Features

- Welcome page with Microsoft login button
- Azure AD authentication using MSAL.js
- User profile display after successful login
- Secure logout functionality
- Responsive design
- **Comprehensive logging system** with visual log viewer
- **Development tools** for debugging authentication issues

## Setup Instructions

### 1. Azure AD App Registration

Before you can use this application, you need to register it in Azure Active Directory:

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the following details:
   - **Name**: Your app name (e.g., "HTML Auth Demo")
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: Select "Single-page application (SPA)" and enter your website URL (e.g., `http://localhost:3000` for local testing)
5. Click **Register**

### 2. Configure the Application

After registration, you'll need to update the `auth.js` file:

1. Copy the **Application (client) ID** from the Azure portal
2. Copy the **Directory (tenant) ID** from the Azure portal
3. Open `auth.js` and replace:
   - `YOUR_CLIENT_ID_HERE` with your Application (client) ID
   - `YOUR_TENANT_ID_HERE` with your Directory (tenant) ID

### 3. API Permissions

In the Azure portal, ensure your app has the following API permissions:
- **Microsoft Graph** > **User.Read** (should be added by default)

### 4. Running the Application

#### Option 1: Local Web Server (Recommended)

You need to serve the files through a web server (not just open the HTML file directly) due to CORS restrictions:

```bash
# Using Python (if installed)
python -m http.server 3000

# Using Node.js (if installed)
npx http-server -p 3000

# Using PHP (if installed)
php -S localhost:3000
```

Then open your browser and go to `http://localhost:3000`

#### Option 2: VS Code Live Preview Extension

1. Install the "Live Preview" extension in VS Code
2. Right-click on `index.html`
3. Select "Show Preview"

### 5. Update Redirect URI

Make sure the redirect URI in your Azure AD app registration matches the URL where your application is hosted.

## File Structure

```
EntraTest/
├── index.html              # Main HTML file with UI
├── styles.css              # CSS styling
├── auth.js                 # JavaScript authentication logic with logging
├── logger.js               # Comprehensive logging utility
├── msal-browser.min.js     # Local MSAL library (no CDN dependency)
└── README.md               # This file
```

## Logging Features

### Visual Log Viewer (Development Mode)
When running on `localhost`, the application includes a visual log viewer:

- **Toggle Logs**: Click the "📋 Logs" button (bottom-right) or press `Ctrl+Shift+L`
- **Real-time Logging**: See authentication flow in real-time
- **Log Levels**: DEBUG, INFO, WARN, ERROR with color coding
- **Export Logs**: Download logs as JSON for debugging
- **Auto-scrolling**: Latest logs always visible

### Logging Levels
- **DEBUG**: Detailed flow information (silent in production)
- **INFO**: Important events and state changes
- **WARN**: Non-fatal issues and fallbacks
- **ERROR**: Critical errors and failures

### Console Logging
All logs are also written to the browser console with timestamps and structured data.

## How It Works

1. **Welcome Page**: Shows a welcome message and Microsoft login button
2. **Authentication**: Uses MSAL.js to authenticate with Azure AD
3. **Token Acquisition**: Obtains an access token for Microsoft Graph API
4. **User Info**: Fetches user profile information from Microsoft Graph
5. **Logged In Page**: Displays user name and email with logout option

## Troubleshooting

### Common Issues

1. **"Please configure your Azure AD application details"**
   - Make sure you've replaced `YOUR_CLIENT_ID_HERE` and `YOUR_TENANT_ID_HERE` in `auth.js`

2. **CORS Errors**
   - Make sure you're serving the files through a web server, not opening the HTML file directly

3. **Redirect URI Mismatch**
   - Ensure the redirect URI in Azure AD matches your application URL exactly

4. **Login Popup Blocked**
   - Allow popups for your domain or use redirect flow instead

### Debug Tips

- Open browser developer tools (F12) and check the Console tab for error messages
- Verify your Azure AD app registration settings
- Ensure your redirect URI is correctly configured

## Security Considerations

- This is a demo application for learning purposes
- In production, consider additional security measures
- Never expose sensitive credentials in client-side code
- Use HTTPS in production environments

## Integration Guide: Adding Azure AD Authentication to Existing Websites

This section provides detailed guidance on how to integrate this Azure AD authentication system into your existing website to create conditional access to pages.

### 1. Integration Architecture

#### Core Components to Add
```
your-website/
├── auth/
│   ├── auth.js                 # Authentication logic
│   ├── logger.js              # Logging utility
│   ├── msal-browser.min.js    # MSAL library
│   └── auth-styles.css        # Authentication UI styles
├── protected/                  # Your protected pages
│   ├── dashboard.html
│   ├── admin.html
│   └── user-profile.html
└── auth-guard.js              # Page protection script
```

### 2. Step-by-Step Integration

#### Step 2.1: Setup Authentication Core Files

1. **Copy Core Files** to your website:
   ```bash
   # Copy these files to your website's auth/ directory
   cp auth.js your-website/auth/
   cp logger.js your-website/auth/
   cp msal-browser.min.js your-website/auth/
   ```

2. **Create Authentication Configuration**:
   ```javascript
   // auth/config.js
   const authConfig = {
       auth: {
           clientId: "YOUR_CLIENT_ID_HERE",
           authority: "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE",
           redirectUri: window.location.origin + "/auth/callback.html"
       },
       cache: {
           cacheLocation: "localStorage",
           storeAuthStateInCookie: true
       }
   };
   ```

#### Step 2.2: Create Authentication Guard

Create `auth-guard.js` to protect your pages:

```javascript
// auth-guard.js - Add this to protected pages
class AuthGuard {
    constructor(options = {}) {
        this.loginPage = options.loginPage || '/login.html';
        this.unauthorizedPage = options.unauthorizedPage || '/unauthorized.html';
        this.requiredRoles = options.requiredRoles || [];
        this.init();
    }

    async init() {
        try {
            // Initialize MSAL
            this.msalInstance = new msal.PublicClientApplication(authConfig);
            await this.msalInstance.initialize();
            
            // Check authentication
            await this.checkAuthentication();
        } catch (error) {
            console.error('Auth Guard initialization failed:', error);
            this.redirectToLogin();
        }
    }

    async checkAuthentication() {
        const accounts = this.msalInstance.getAllAccounts();
        
        if (accounts.length === 0) {
            // No authenticated user
            this.redirectToLogin();
            return;
        }

        try {
            // Try to get a token silently
            const tokenResponse = await this.msalInstance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: accounts[0]
            });

            // Authentication successful
            this.onAuthenticationSuccess(accounts[0], tokenResponse);
        } catch (error) {
            console.error('Token acquisition failed:', error);
            this.redirectToLogin();
        }
    }

    onAuthenticationSuccess(account, tokenResponse) {
        // Store user info for page use
        window.currentUser = {
            account: account,
            token: tokenResponse.accessToken,
            displayName: account.name,
            email: account.username
        };

        // Show page content
        this.showProtectedContent();
        
        // Optional: Check role-based access
        if (this.requiredRoles.length > 0) {
            this.checkRoleAccess(tokenResponse.accessToken);
        }
    }

    showProtectedContent() {
        // Hide loading screen and show main content
        const loadingElement = document.getElementById('auth-loading');
        const contentElement = document.getElementById('main-content');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
    }

    redirectToLogin() {
        window.location.href = this.loginPage + '?returnUrl=' + encodeURIComponent(window.location.href);
    }

    async checkRoleAccess(accessToken) {
        // Example: Check user roles via Microsoft Graph API
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const data = await response.json();
            const userGroups = data.value.map(group => group.displayName);
            
            // Check if user has required roles
            const hasRequiredRole = this.requiredRoles.some(role => userGroups.includes(role));
            
            if (!hasRequiredRole) {
                window.location.href = this.unauthorizedPage;
            }
        } catch (error) {
            console.error('Role check failed:', error);
        }
    }
}
```

#### Step 2.3: Protect Your Pages

Add authentication to any page that requires login:

```html
<!-- protected-page.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Protected Page</title>
    <script src="/auth/msal-browser.min.js"></script>
    <script src="/auth/config.js"></script>
    <script src="/auth-guard.js"></script>
</head>
<body>
    <!-- Loading screen (shown while checking authentication) -->
    <div id="auth-loading" style="text-align: center; padding: 50px;">
        <p>Checking authentication...</p>
        <div class="spinner"></div>
    </div>

    <!-- Main content (hidden until authenticated) -->
    <div id="main-content" style="display: none;">
        <h1>Welcome to Protected Content</h1>
        <p>Hello, <span id="user-name"></span>!</p>
        <button onclick="logout()">Logout</button>
        
        <!-- Your existing page content goes here -->
    </div>

    <script>
        // Initialize authentication guard
        const authGuard = new AuthGuard({
            requiredRoles: ['Admin', 'User'] // Optional: specify required roles
        });

        // Display user info when authenticated
        function displayUserInfo() {
            if (window.currentUser) {
                document.getElementById('user-name').textContent = window.currentUser.displayName;
            }
        }

        // Logout function
        async function logout() {
            try {
                await authGuard.msalInstance.logoutPopup();
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }

        // Call this when page loads
        window.addEventListener('load', displayUserInfo);
    </script>
</body>
</html>
```

#### Step 2.4: Create Login Page

```html
<!-- login.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Required</title>
    <script src="/auth/msal-browser.min.js"></script>
    <script src="/auth/config.js"></script>
    <link rel="stylesheet" href="/auth/auth-styles.css">
</head>
<body>
    <div class="login-container">
        <h1>Login Required</h1>
        <p>Please sign in to access this content.</p>
        <button id="loginBtn" class="login-button">Sign in with Microsoft</button>
    </div>

    <script>
        let msalInstance;

        async function initLogin() {
            msalInstance = new msal.PublicClientApplication(authConfig);
            await msalInstance.initialize();

            document.getElementById('loginBtn').addEventListener('click', login);
        }

        async function login() {
            try {
                const loginResponse = await msalInstance.loginPopup({
                    scopes: ["User.Read"]
                });

                // Get return URL from query parameters
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('returnUrl') || '/';

                // Redirect to original page
                window.location.href = returnUrl;
            } catch (error) {
                console.error('Login failed:', error);
                alert('Login failed. Please try again.');
            }
        }

        // Initialize when page loads
        initLogin();
    </script>
</body>
</html>
```

### 3. Advanced Features

#### 3.1: Role-Based Access Control

```javascript
// Enhanced AuthGuard with role checking
class AdvancedAuthGuard extends AuthGuard {
    constructor(options = {}) {
        super(options);
        this.roleEndpoint = options.roleEndpoint || null;
        this.userRoles = [];
    }

    async checkRoleAccess(accessToken) {
        if (this.roleEndpoint) {
            // Custom role endpoint
            const roles = await this.fetchUserRoles(accessToken);
            this.userRoles = roles;
        } else {
            // Use Azure AD groups
            const groups = await this.fetchUserGroups(accessToken);
            this.userRoles = groups.map(g => g.displayName);
        }

        // Check access
        const hasAccess = this.requiredRoles.length === 0 || 
                         this.requiredRoles.some(role => this.userRoles.includes(role));

        if (!hasAccess) {
            this.showUnauthorized();
        }
    }

    async fetchUserRoles(accessToken) {
        const response = await fetch(this.roleEndpoint, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return await response.json();
    }

    showUnauthorized() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <p>Required roles: ${this.requiredRoles.join(', ')}</p>
                <p>Your roles: ${this.userRoles.join(', ')}</p>
                <button onclick="history.back()">Go Back</button>
            </div>
        `;
    }
}
```

#### 3.2: Conditional Content Display

```javascript
// Show/hide content based on user roles
function setupConditionalContent() {
    const elementsWithRoles = document.querySelectorAll('[data-required-roles]');
    
    elementsWithRoles.forEach(element => {
        const requiredRoles = element.dataset.requiredRoles.split(',');
        const hasAccess = requiredRoles.some(role => window.currentUser.roles.includes(role));
        
        if (!hasAccess) {
            element.style.display = 'none';
        }
    });
}
```

```html
<!-- Usage in HTML -->
<div data-required-roles="Admin">
    <h2>Admin Panel</h2>
    <p>This content is only visible to admins.</p>
</div>

<div data-required-roles="User,Manager">
    <p>This content is visible to Users and Managers.</p>
</div>
```

### 4. Production Deployment Checklist

#### 4.1: Security Configuration
- [ ] Update redirect URIs in Azure AD to match production URLs
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Review and minimize required scopes
- [ ] Set up proper error handling and logging

#### 4.2: Performance Optimization
- [ ] Minify JavaScript files
- [ ] Enable gzip compression
- [ ] Implement token caching strategy
- [ ] Set up CDN for static assets

#### 4.3: Monitoring and Debugging
- [ ] Set up application insights
- [ ] Configure structured logging
- [ ] Implement health checks for authentication endpoints
- [ ] Monitor token expiration and refresh patterns

### 5. Example Use Cases

#### 5.1: E-commerce Admin Panel
```javascript
new AuthGuard({
    requiredRoles: ['Admin', 'Store Manager'],
    loginPage: '/admin/login.html',
    unauthorizedPage: '/admin/unauthorized.html'
});
```

#### 5.2: Multi-tenant Application
```javascript
new AuthGuard({
    requiredRoles: ['Tenant_' + getCurrentTenant() + '_User'],
    loginPage: '/login.html?tenant=' + getCurrentTenant()
});
```

#### 5.3: Progressive Access (Free vs Premium)
```javascript
// Different access levels for different features
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser.roles.includes('Premium')) {
        document.querySelectorAll('.premium-feature').forEach(el => {
            el.classList.remove('disabled');
        });
    }
});
```

## Browser Compatibility

This application uses modern JavaScript features and requires:
- Chrome 63+
- Firefox 67+
- Safari 12+
- Edge 79+
