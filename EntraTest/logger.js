// Enhanced logging utility for Azure AD authentication
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep only the last 100 log entries
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        this.currentLevel = this.logLevels.INFO; // Default log level
        
        // Create log container if it doesn't exist
        this.createLogContainer();
    }

    createLogContainer() {
        // Only create log container in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Wait for DOM to be ready
            const createContainer = () => {
                if (document.body) {
                    const logContainer = document.createElement('div');
                    logContainer.id = 'logContainer';
                    logContainer.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        width: 400px;
                        max-height: 300px;
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        border-radius: 8px;
                        padding: 15px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        overflow-y: auto;
                        z-index: 10000;
                        display: none;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    `;
                    
                    const header = document.createElement('div');
                    header.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #444;
                    `;
                    header.innerHTML = `
                        <span style="font-weight: bold;">Application Logs</span>
                        <div>
                            <button onclick="logger.clearLogs()" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Clear</button>
                            <button onclick="logger.toggleLogs()" style="background: #6c757d; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">Hide</button>
                        </div>
                    `;
                    
                    const logContent = document.createElement('div');
                    logContent.id = 'logContent';
                    logContent.style.cssText = `
                        max-height: 200px;
                        overflow-y: auto;
                        white-space: pre-wrap;
                        word-break: break-word;
                    `;
                    
                    logContainer.appendChild(header);
                    logContainer.appendChild(logContent);
                    document.body.appendChild(logContainer);
                    
                    // Add toggle button
                    const toggleButton = document.createElement('button');
                    toggleButton.id = 'logToggle';
                    toggleButton.innerHTML = '📋 Logs';
                    toggleButton.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        padding: 10px 15px;
                        cursor: pointer;
                        z-index: 10001;
                        font-size: 12px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    `;
                    toggleButton.onclick = () => this.toggleLogs();
                    document.body.appendChild(toggleButton);
                } else {
                    // DOM not ready yet, wait a bit
                    setTimeout(createContainer, 100);
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createContainer);
            } else {
                createContainer();
            }
        }
    }

    formatTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
    }

    log(level, message, data = null) {
        const timestamp = this.formatTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        // Add to internal log array
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Console logging
        const consoleMessage = `[${timestamp}] ${level}: ${message}`;
        switch (level) {
            case 'DEBUG':
                if (this.currentLevel <= this.logLevels.DEBUG) {
                    console.debug(consoleMessage, data || '');
                }
                break;
            case 'INFO':
                if (this.currentLevel <= this.logLevels.INFO) {
                    console.info(consoleMessage, data || '');
                }
                break;
            case 'WARN':
                if (this.currentLevel <= this.logLevels.WARN) {
                    console.warn(consoleMessage, data || '');
                }
                break;
            case 'ERROR':
                if (this.currentLevel <= this.logLevels.ERROR) {
                    console.error(consoleMessage, data || '');
                }
                break;
        }
        
        // Update visual log container
        this.updateLogContainer(logEntry);
    }

    updateLogContainer(logEntry) {
        const logContent = document.getElementById('logContent');
        if (logContent) {
            const logLine = document.createElement('div');
            logLine.style.marginBottom = '3px';
            
            let color = '#fff';
            switch (logEntry.level) {
                case 'DEBUG': color = '#6c757d'; break;
                case 'INFO': color = '#17a2b8'; break;
                case 'WARN': color = '#ffc107'; break;
                case 'ERROR': color = '#dc3545'; break;
            }
            
            logLine.innerHTML = `<span style="color: ${color};">[${logEntry.timestamp}] ${logEntry.level}:</span> ${logEntry.message}`;
            if (logEntry.data) {
                logLine.innerHTML += `<br><span style="color: #aaa; font-size: 11px;">${JSON.stringify(logEntry.data, null, 2)}</span>`;
            }
            
            logContent.appendChild(logLine);
            logContent.scrollTop = logContent.scrollHeight;
            
            // Limit visible logs
            const logLines = logContent.children;
            if (logLines.length > 50) {
                logContent.removeChild(logLines[0]);
            }
        }
    }

    debug(message, data) { this.log('DEBUG', message, data); }
    info(message, data) { this.log('INFO', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    error(message, data) { this.log('ERROR', message, data); }

    toggleLogs() {
        const container = document.getElementById('logContainer');
        const toggle = document.getElementById('logToggle');
        if (container && toggle) {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                toggle.style.display = 'none';
            } else {
                container.style.display = 'none';
                toggle.style.display = 'block';
            }
        }
    }

    clearLogs() {
        this.logs = [];
        const logContent = document.getElementById('logContent');
        if (logContent) {
            logContent.innerHTML = '';
        }
        console.clear();
        this.info('Logs cleared');
    }

    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLevel = this.logLevels[level];
            this.info(`Log level set to ${level}`);
        }
    }

    // Get all logs for export or debugging
    getAllLogs() {
        return this.logs;
    }

    // Export logs as JSON
    exportLogs() {
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azure-ad-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.info('Logs exported');
    }
}

// Create global logger instance
const logger = new Logger();

// Add keyboard shortcut to toggle logs (Ctrl+Shift+L)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        logger.toggleLogs();
        event.preventDefault();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
