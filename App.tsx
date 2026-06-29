import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/context/AuthContext';
import AppNavigator from '@/navigation/AppNavigator';

import { store } from '@/store/store';
import { Provider } from 'react-redux';

import { requestNotificationPermissions } from '@/services/notificationService';
import { ThemeProvider } from '@/theme';


export default function App() {
  useEffect(() => {
    // Initialize notification permissions on app startup
    requestNotificationPermissions().catch(console.error);
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}
