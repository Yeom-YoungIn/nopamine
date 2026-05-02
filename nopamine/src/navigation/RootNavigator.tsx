import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import HomeScreen from '@screens/HomeScreen';
import SetupScreen from '@screens/SetupScreen';
import StatsScreen from '@screens/StatsScreen';
import BlockedScreen from '@screens/BlockedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {backgroundColor: '#0f0f0f'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: '700'},
          contentStyle: {backgroundColor: '#0f0f0f'},
        }}>
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
