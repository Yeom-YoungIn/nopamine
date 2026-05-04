import React, {useEffect, useState} from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {RootStackParamList} from './types';
import HomeScreen from '@screens/HomeScreen';
import SetupScreen from '@screens/SetupScreen';
import StatsScreen from '@screens/StatsScreen';
import BlockedScreen from '@screens/BlockedScreen';
import OnboardingScreen from '@screens/OnboardingScreen';
import {colors} from '@theme/ui';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.accent,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@nopamine:onboarded').then(val => {
      if (Platform.OS === 'android' && val !== 'true') {
        setInitialRoute('Onboarding');
      } else {
        setInitialRoute('Home');
      }
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {backgroundColor: colors.background},
          headerTintColor: colors.text,
          headerTitleStyle: {fontWeight: '700', color: colors.text},
          contentStyle: {backgroundColor: colors.background},
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{title: '시작하기', headerShown: false}}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name="Setup" component={SetupScreen} options={{title: '설정'}} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{title: '통계'}} />
        <Stack.Screen
          name="Blocked"
          component={BlockedScreen}
          options={{headerShown: false, gestureEnabled: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
