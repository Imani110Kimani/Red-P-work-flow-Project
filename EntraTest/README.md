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

## Browser Compatibility

This application uses modern JavaScript features and requires:
- Chrome 63+
- Firefox 67+
- Safari 12+
- Edge 79+
