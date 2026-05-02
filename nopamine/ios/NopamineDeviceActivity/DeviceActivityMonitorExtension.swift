// Xcode에서 별도 Extension 타겟으로 추가 필요:
// File → New → Target → Device Activity Monitor Extension
//
// Bundle ID: com.nopamine.DeviceActivity
// App Group: group.com.nopamine.shared

#if canImport(DeviceActivity)
import DeviceActivity
import ManagedSettings
import Foundation

@available(iOS 16.0, *)
class NopamineActivityMonitor: DeviceActivityMonitor {

  let store = ManagedSettingsStore(named: ManagedSettingsStore.Name("nopamine"))

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    // 새 날짜 시작 시 Shield 해제
    store.shield.applications = nil
    store.shield.applicationCategories = nil
  }

  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)
    // 허용 시간 초과 → Shield 적용
    applyShield()
    saveCooldown()
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    store.shield.applications = nil
    store.shield.applicationCategories = nil
  }

  // MARK: - Private

  private func applyShield() {
    let defaults = UserDefaults(suiteName: "group.com.nopamine.shared")
    guard let data = defaults?.data(forKey: "selectedApps"),
          let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    else { return }

    store.shield.applications = selection.applicationTokens
    store.shield.applicationCategories = .specific(selection.categoryTokens)
  }

  private func saveCooldown() {
    let defaults = UserDefaults(suiteName: "group.com.nopamine.shared")
    let cooldownMins = defaults?.integer(forKey: "cooldownMinutes") ?? 30
    let cooldownUntil = Date().addingTimeInterval(TimeInterval(cooldownMins * 60))
    defaults?.set(cooldownUntil.timeIntervalSince1970 * 1000, forKey: "cooldownUntil")
    defaults?.set(true, forKey: "isBlocked")
  }
}
#endif
