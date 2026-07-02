# nopamine

## 프로젝트 개요

`nopamine`은 YouTube, Instagram, TikTok 같은 숏폼 중심 앱의 사용 시간을 관리하기 위한 React Native 모바일 앱입니다. 사용자는 하루 허용 시간, 차단 대상 앱, 차단 후 쿨다운 시간을 직접 설정할 수 있고, 앱은 설정된 시간이 지나면 해당 앱 사용을 제한하는 흐름으로 동작합니다.

이 프로젝트는 숏폼 콘텐츠를 무심코 오래 소비하게 되는 사용자를 대상으로 합니다. 코드상으로는 앱별 사용 시간 추적, 시간 초과 시 차단 상태 전환, 5분 전 알림, 주간 사용 기록과 연속 달성일 확인 같은 기능이 구현되어 있습니다.

기획 의도는 “완전히 복잡한 생산성 도구”보다는 “간단한 규칙으로 집중 흐름을 유지하는 도구”에 가깝습니다. 온보딩, 설정, 통계 화면 모두 핵심 값만 빠르게 조정하거나 확인할 수 있도록 비교적 단순한 구조로 설계되어 있으며, 현재 권한 흐름과 차단 로직은 Android 중심으로 구현되어 있습니다.

## 기술 스택

- Mobile App: React Native, TypeScript
- Navigation: React Navigation
- State / Storage: Zustand, AsyncStorage
- Native Feature: Android Usage Stats / Accessibility / Overlay 연동, iOS Screen Time 연동 모듈
- Notification: Notifee
- Test: Jest, React Test Renderer

## 참고 링크

- React Native: [https://reactnative.dev](https://reactnative.dev)
