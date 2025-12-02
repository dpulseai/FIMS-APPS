import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator, LogBox, Platform } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { loadSavedLanguage } from './src/i18n';

// Import i18n now (it's safe - won't crash even if AsyncStorage isn't ready)
import './src/i18n';

console.log('[App] Module loaded, Platform:', Platform.OS);

// Suppress known warnings
LogBox.ignoreLogs([
  'Sending',
  'AsyncStorage',
  'Non-serializable values',
  'new NativeEventEmitter',
]);

// Global error handler for uncaught errors
try {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GLOBAL ERROR]', isFatal ? 'FATAL:' : 'Non-fatal:', error);
    console.error('[GLOBAL ERROR] Message:', error.message);
    console.error('[GLOBAL ERROR] Stack:', error.stack);
    
    // Still call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
  console.log('[App] Global error handler installed');
} catch (e) {
  console.warn('[App] Could not install global error handler:', e);
}

// Catch unhandled promise rejections
try {
  const trackPromiseRejection = (event: any) => {
    console.error('[UNHANDLED PROMISE REJECTION]', event?.reason || event);
  };

  if (typeof global !== 'undefined') {
    (global as any).onunhandledrejection = trackPromiseRejection;
    console.log('[App] Promise rejection handler installed');
  }
} catch (e) {
  console.warn('[App] Could not install promise rejection handler:', e);
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const stack = errorInfo.componentStack || 'No stack trace';
    console.error('[ErrorBoundary] Component stack:', stack);
    console.error('[ErrorBoundary] Error name:', error.name);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    
    // Log to console in production too
    if (!__DEV__) {
      console.log('PRODUCTION ERROR:', JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: stack
      }));
    }
    
    this.setState({ 
      errorInfo: `${error.name}: ${error.message}\n\nStack:\n${error.stack || 'No stack'}\n\nComponent Stack:\n${stack}` 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ App Error</Text>
          <Text style={styles.errorText}>
            The app encountered an error. Please restart.
          </Text>
          <Text style={styles.errorText}>
            Error: {this.state.error?.message || 'Unknown error'}
          </Text>
          {__DEV__ && this.state.errorInfo && (
            <Text style={styles.errorDetails}>{this.state.errorInfo}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[App] Starting app initialization...');
    
    let mounted = true;
    
    const initApp = async () => {
      try {
        // Give native modules time to initialize
        console.log('[App] Waiting for native modules...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load saved language preference (non-blocking)
        loadSavedLanguage().catch(err => 
          console.warn('[App] Language load failed (non-fatal):', err)
        );
        
        if (mounted) {
          console.log('[App] Initialization complete');
          setIsReady(true);
        }
      } catch (error) {
        console.error('[App] Initialization error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        setInitError(errorMsg);
        setIsReady(true); // Still show UI
      }
    };

    initApp();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    console.log('[App] Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading FIMS...</Text>
      </View>
    );
  }

  if (initError) {
    console.log('[App] Showing init error:', initError);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  console.log('[App] Rendering main app...');
  
  try {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider>
            <NavigationContainer
              onStateChange={(state) => {
                console.log('[Navigation] State changed:', state?.routes?.[0]?.name);
              }}
              onReady={() => {
                console.log('[Navigation] Ready');
              }}
            >
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[App] Render error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Render Error</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Unknown render error'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 10,
    maxHeight: 400,
  },
});

