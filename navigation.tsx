import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
// import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdmissionsDetailsScreen from './screens/AdmissionsDetailsScreen';
import SchoolVerificationDetailsScreen from './screens/SchoolVerificationDetailsScreen';
import StudentVerificationDetailsScreen from './screens/StudentVerificationDetailsScreen';
import LandingScreen from './screens/LandingScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AdmissionsDetails" component={AdmissionsDetailsScreen} />
        <Stack.Screen name="SchoolVerificationDetails" component={SchoolVerificationDetailsScreen} />
        <Stack.Screen name="StudentVerificationDetails" component={StudentVerificationDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
