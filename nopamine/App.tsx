import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import {useTimerStore} from './src/store/timerStore';
import {useAppStore} from './src/store/appStore';
import {useStatsStore} from './src/store/statsStore';
import {useUsageTracker} from './src/hooks/useUsageTracker';
import {colors} from '@theme/ui';

function AppInner() {
  useUsageTracker();
  return <RootNavigator />;
}

export default function App() {
  const loadTimer = useTimerStore(s => s.loadFromStorage);
  const loadApps = useAppStore(s => s.loadFromStorage);
  const loadStats = useStatsStore(s => s.loadFromStorage);

  useEffect(() => {
    loadTimer();
    loadApps();
    loadStats();
  }, [loadTimer, loadApps, loadStats]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <AppInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
