/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee from '@notifee/react-native';

// 전역 에러 핸들러 — 스택 트레이스 출력
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('[GlobalError]', error?.message, '\n', error?.stack);
  originalHandler(error, isFatal);
});

// Notifee 백그라운드 이벤트 핸들러 (필수 등록)
notifee.onBackgroundEvent(async () => {});

AppRegistry.registerComponent(appName, () => App);
