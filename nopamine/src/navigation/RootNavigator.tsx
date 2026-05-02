import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {RootStackParamList} from './types';
import HomeScreen from '@screens/HomeScreen';
import SetupScreen from '@screens/SetupScreen';
import StatsScreen from '@screens/StatsScreen';
import BlockedScreen from '@screens/BlockedScreen';
import OnboardingScreen from '@screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {backgroundColor: '#0f0f0f'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: '700'},
          contentStyle: {backgroundColor: '#0f0f0f'},
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{title: '시작하기', headerShown: false}} />
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Nopamine'}} />
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
