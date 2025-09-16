import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import MovementLogsScreen from './src/screens/MovementLogsScreen';
import LiveProcessScreen from './src/screens/LiveProcessScreen';
import AddSariScreen from './src/screens/AddSariScreen';
import AddMovementScreen from './src/screens/AddMovementScreen';
import SariDetailScreen from './src/screens/SariDetailScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import SuppliersScreen from './src/screens/SuppliersScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import types
import { RootStackParamList, TabParamList } from './src/types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'MovementLogs') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'LiveProcess') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Suppliers') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen 
        name="MovementLogs" 
        component={MovementLogsScreen}
        options={{ title: 'Movements' }}
      />
      <Tab.Screen 
        name="LiveProcess" 
        component={LiveProcessScreen}
        options={{ title: 'Live Process' }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersScreen}
        options={{ title: 'Customers' }}
      />
      <Tab.Screen 
        name="Suppliers" 
        component={SuppliersScreen}
        options={{ title: 'Suppliers' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="AddSari" component={AddSariScreen} />
        <Stack.Screen name="AddMovement" component={AddMovementScreen} />
        <Stack.Screen name="SariDetail" component={SariDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
