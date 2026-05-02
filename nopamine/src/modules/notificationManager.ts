import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';

const CHANNEL_ID = 'nopamine_warning';

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: '사용 시간 경고',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

/** 허용 시간 5분 전 경고 알림 */
export async function sendWarningNotification(remainingMinutes: number) {
  await ensureChannel();
  await notifee.displayNotification({
    title: '⏰ Nopamine 경고',
    body: `숏폼 허용 시간이 ${remainingMinutes}분 남았습니다.`,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
    },
  });
}

/** 차단 알림 */
export async function sendBlockedNotification() {
  await ensureChannel();
  await notifee.displayNotification({
    title: '🚫 Nopamine',
    body: '오늘 허용 시간이 모두 소진되었습니다.',
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
    },
  });
}
