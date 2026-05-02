export interface TargetApp {
  id: string;
  name: string;
  androidPackage: string;
  iosBundleId: string;
}

export const TARGET_APPS: TargetApp[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    androidPackage: 'com.google.android.youtube',
    iosBundleId: 'com.google.ios.youtube',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    androidPackage: 'com.instagram.android',
    iosBundleId: 'com.burbn.instagram',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    androidPackage: 'com.zhiliaoapp.musically',
    iosBundleId: 'com.zhiyou100.KuaiShou',
  },
];
