var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        // Initialize Adjust first
        this.initializeAdjust();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    initializeAdjust: function() {
        var adjustConfig = new AdjustConfig(
            "2fm9gkqubvpc",
            AdjustConfig.EnvironmentSandbox
        );

        // Set up deep link callbacks
        adjustConfig.setDeferredDeeplinkCallback(function(deeplink) {
            console.log("[DeepLink] Deferred deep link received:", deeplink);
            app.handleDeepLink(deeplink);
            return true; // Allow Adjust SDK to open the deep link
        });

        // Initialize Adjust SDK
        Adjust.initSdk(adjustConfig);

        // Register for deep links
        document.addEventListener('deviceready', function() {
            app.logDebug("Registering for deep links...");
            // This will handle deep links when app is already running
            window.handleOpenURL = function(url) {
                app.logDebug("[DeepLink] Received URL while running: " + url);
                app.handleDeepLink(url);
            };

            // Check for any stored deep link data
            app.logDebug("Checking for initial deep link...");
            Adjust.getDeepLinkData(function(deepLinkData) {
                if (deepLinkData) {
                    app.logDebug("[DeepLink] Initial deep link data: " + deepLinkData);
                    app.handleDeepLink(deepLinkData);
                } else {
                    app.logDebug("[DeepLink] No initial deep link data available");
                }
            });
        });
    },

    logDebug: function(message) {
        console.log(message);
        var debugLog = document.getElementById('debugLog');
        if (debugLog) {
            var timestamp = new Date().toLocaleTimeString();
            debugLog.innerHTML += `[${timestamp}] ${message}\n`;
        }
    },

    handleDeepLink: function(url) {
        try {
            console.log("[DeepLink] Processing URL:", url);
            if (!url) {
                console.log("[DeepLink] No URL provided");
                return;
            }
            const deeplinkUrl = new URL(url);
            const path = deeplinkUrl.pathname.substring(1);
            const params = Object.fromEntries(deeplinkUrl.searchParams);
            
            // Display the deep link information
            document.getElementById('deeplinkResult').innerHTML = 
                `<p>Received Deep Link:</p>
                 <p>URL: ${url}</p>
                 <p>Path: ${path}</p>
                 <p>Parameters: ${JSON.stringify(params, null, 2)}</p>`;

            this.logDebug(`[DeepLink] Processed URL: ${url}, Path: ${path}, Params: ${JSON.stringify(params)}`);

            // Handle specific paths
            switch(path) {
                case 'test':
                    this.logDebug('[DeepLink] Test path detected');
                    // Add specific handling for test path
                    break;
                default:
                    this.logDebug('[DeepLink] No specific handler for path: ' + path);
            }
        } catch (error) {
            console.error('[DeepLink] Error handling deep link:', error);
            this.logDebug('[DeepLink] Error: ' + error.message);
            document.getElementById('deeplinkResult').innerHTML = 
                `Error processing deep link: ${error.message}`;
        }
    }
};

app.initialize();

// Handle deep links opened while the app is running
function handleOpenURL(url) {
    setTimeout(function() {
        console.log('[DeepLink] App opened with URL:', url);
        app.handleDeepLink(url);
    }, 0);
}
