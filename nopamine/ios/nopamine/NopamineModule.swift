import Foundation

// FamilyControls, ManagedSettings, DeviceActivity는 iOS 16+ + Apple Entitlement 필요
// Entitlement 승인 전까지 조건부 컴파일로 빌드 오류 방지
#if canImport(FamilyControls)
import FamilyControls
import ManagedSettings
import DeviceActivity
#endif

@objc(NopamineModule)
class NopamineModule: NSObject {

  // MARK: - Authorization

  @objc func requestAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FamilyControls)
    if #available(iOS 16.0, *) {
      Task {
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          DispatchQueue.main.async { resolve(true) }
        } catch {
          DispatchQueue.main.async {
            reject("AUTH_ERROR", error.localizedDescription, error)
          }
        }
      }
    } else {
      reject("UNSUPPORTED", "iOS 16+ required", nil)
    }
    #else
    reject("ENTITLEMENT_MISSING", "FamilyControls entitlement not yet approved", nil)
    #endif
  }

  // MARK: - Monitoring

  /// 허용 시간 설정 후 DeviceActivity 모니터링 시작
  @objc func startMonitoring(
    _ allowedMinutes: Int,
    packageNames: [String],
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FamilyControls)
    if #available(iOS 16.0, *) {
      saveSettings(allowedMinutes: allowedMinutes)
      let center = DeviceActivityCenter()
      let activityName = DeviceActivityName("nopamine.daily")

      // 오늘 자정부터 허용 시간 경과 시점까지 모니터링
      let calendar = Calendar.current
      let now = Date()
      guard let midnight = calendar.date(bySettingHour: 0, minute: 0, second: 0, of: now) else {
        reject("SCHEDULE_ERROR", "Failed to create schedule", nil)
        return
      }

      let warningTime = DateComponents(minute: allowedMinutes)
      let schedule = DeviceActivitySchedule(
        intervalStart: DateComponents(hour: 0, minute: 0),
        intervalEnd: DateComponents(hour: 23, minute: 59),
        repeats: true,
        warningTime: warningTime
      )

      do {
        try center.startMonitoring(activityName, during: schedule)
        resolve(true)
      } catch {
        reject("MONITOR_ERROR", error.localizedDescription, error)
      }
    } else {
      reject("UNSUPPORTED", "iOS 16+ required", nil)
    }
    #else
    reject("ENTITLEMENT_MISSING", "FamilyControls entitlement not yet approved", nil)
    #endif
  }

  @objc func stopMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FamilyControls)
    if #available(iOS 16.0, *) {
      DeviceActivityCenter().stopMonitoring()
      resolve(true)
    } else {
      reject("UNSUPPORTED", "iOS 16+ required", nil)
    }
    #else
    reject("ENTITLEMENT_MISSING", "FamilyControls entitlement not yet approved", nil)
    #endif
  }

  // MARK: - Shield (앱 잠금)

  @objc func applyShield(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FamilyControls)
    if #available(iOS 16.0, *) {
      let store = ManagedSettingsStore()
      // 저장된 FamilyActivitySelection 불러오기
      if let data = UserDefaults(suiteName: "group.com.nopamine.shared")?
          .data(forKey: "selectedApps"),
         let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
        store.shield.applicationCategories = .specific(selection.categoryTokens)
        store.shield.applications = selection.applicationTokens
        resolve(true)
      } else {
        reject("NO_SELECTION", "No apps selected", nil)
      }
    } else {
      reject("UNSUPPORTED", "iOS 16+ required", nil)
    }
    #else
    reject("ENTITLEMENT_MISSING", "FamilyControls entitlement not yet approved", nil)
    #endif
  }

  @objc func removeShield(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FamilyControls)
    if #available(iOS 16.0, *) {
      let store = ManagedSettingsStore()
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      resolve(true)
    } else {
      reject("UNSUPPORTED", "iOS 16+ required", nil)
    }
    #else
    reject("ENTITLEMENT_MISSING", "FamilyControls entitlement not yet approved", nil)
    #endif
  }

  // MARK: - Private

  private func saveSettings(allowedMinutes: Int) {
    UserDefaults(suiteName: "group.com.nopamine.shared")?
      .set(allowedMinutes, forKey: "allowedMinutes")
  }

  @objc static func requiresMainQueueSetup() -> Bool { false }
}
