// Xcode에서 별도 Extension 타겟으로 추가 필요:
// File → New → Target → Shield Configuration Extension

#if canImport(ShieldConfiguration)
import ShieldConfiguration
import ManagedSettings
import UIKit

@available(iOS 16.0, *)
class NopamineShieldConfiguration: ShieldConfigurationDataSource {

  override func configuration(shielding application: Application) -> ShieldConfiguration {
    return buildConfiguration()
  }

  override func configuration(shielding applicationCategory: ActivityCategory) -> ShieldConfiguration {
    return buildConfiguration()
  }

  private func buildConfiguration() -> ShieldConfiguration {
    let defaults = UserDefaults(suiteName: "group.com.nopamine.shared")
    let cooldownUntilMs = defaults?.double(forKey: "cooldownUntil") ?? 0
    let remaining = cooldownUntilMs / 1000 - Date().timeIntervalSince1970
    let mins = max(0, Int(remaining / 60))
    let secs = max(0, Int(remaining) % 60)
    let timerStr = String(format: "%02d:%02d", mins, secs)

    return ShieldConfiguration(
      backgroundBlurStyle: .dark,
      backgroundColor: UIColor(red: 0.06, green: 0.06, blue: 0.06, alpha: 0.97),
      icon: UIImage(systemName: "nosign"),
      title: ShieldConfiguration.Label(
        text: "오늘 시간을 다 썼어요",
        color: .white
      ),
      subtitle: ShieldConfiguration.Label(
        text: "재접근까지 \(timerStr)",
        color: UIColor(red: 0.97, green: 0.44, blue: 0.44, alpha: 1)
      ),
      primaryButtonLabel: ShieldConfiguration.Label(
        text: "홈으로 돌아가기",
        color: .black
      ),
      primaryButtonBackgroundColor: UIColor(red: 0.29, green: 0.86, blue: 0.50, alpha: 1)
    )
  }
}
#endif
