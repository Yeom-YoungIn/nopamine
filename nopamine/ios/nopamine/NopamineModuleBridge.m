#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NopamineModule, NSObject)

RCT_EXTERN_METHOD(
  requestAuthorization:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  startMonitoring:(int)allowedMinutes
  packageNames:(NSArray *)packageNames
  resolve:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  stopMonitoring:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  applyShield:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeShield:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  syncWidgetData:(int)remainingMinutes
  allowedMinutes:(int)allowedMinutes
  isBlocked:(BOOL)isBlocked
  cooldownUntil:(double)cooldownUntil
  resolve:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)rejecter
)

@end
