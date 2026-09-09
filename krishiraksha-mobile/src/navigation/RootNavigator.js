import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

import { FeedScreen } from '../screens/FeedScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ScanResultScreen } from '../screens/ScanResultScreen';
import { SensorsScreen } from '../screens/SensorsScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { ChatThreadsScreen } from '../screens/ChatThreadsScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';
import { CopilotScreen } from '../screens/CopilotScreen';
import { OfficerMapScreen } from '../screens/OfficerMapScreen';
import { ExpertQueueScreen } from '../screens/ExpertQueueScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Scan Stack (Scan -> Result)
const ScanStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScanMain" component={ScanScreen} />
    <Stack.Screen name="ScanResult" component={ScanResultScreen} />
  </Stack.Navigator>
);

// Chat Stack (Threads -> Detail)
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatThreads" component={ChatThreadsScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
  </Stack.Navigator>
);

// Farmer Navigation Shell
const FarmerTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: t('tab_feed'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{
          tabBarLabel: t('tab_scan'),
          tabBarIcon: ({ color }) => (
            <View style={[styles.scanTabButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ fontSize: 22 }}>📷</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Sensors"
        component={SensorsScreen}
        options={{
          tabBarLabel: t('tab_sensors'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: t('tab_chat'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab_profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Expert Navigation Shell (Strict: Cannot access Farmer scan submission)
const ExpertTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
      }}
    >
      <Tab.Screen
        name="Queue"
        component={ExpertQueueScreen}
        options={{
          tabBarLabel: t('tab_queue'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔬</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: t('tab_feed'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: t('tab_chat'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab_profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Officer Navigation Shell (Strict: Dedicated India Geomap & Hotspot Priorities)
const OfficerTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
      }}
    >
      <Tab.Screen
        name="IndiaMap"
        component={OfficerMapScreen}
        options={{
          tabBarLabel: t('tab_map'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: t('tab_feed'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: t('tab_alerts'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚨</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: t('tab_chat'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab_profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Navigation Shell
const AdminTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
      }}
    >
      <Tab.Screen
        name="IndiaMap"
        component={OfficerMapScreen}
        options={{
          tabBarLabel: t('tab_map'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Queue"
        component={ExpertQueueScreen}
        options={{
          tabBarLabel: t('tab_queue'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔬</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: t('tab_feed'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab_profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { role } = useAuth();
  const { language } = useLanguage();

  // Return strictly the navigator registered for that role (Requirement 10)
  return (
    <NavigationContainer key={language}>
      {role === 'Expert' ? (
        <ExpertTabNavigator />
      ) : role === 'Officer' ? (
        <OfficerTabNavigator />
      ) : role === 'Admin' ? (
        <AdminTabNavigator />
      ) : (
        <FarmerTabNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  scanTabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
