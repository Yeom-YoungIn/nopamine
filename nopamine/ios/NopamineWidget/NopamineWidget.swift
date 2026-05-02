// Xcode에서 File → New → Target → Widget Extension 으로 추가
// Bundle ID: com.nopamine.Widget
// App Group: group.com.nopamine.shared (기존과 동일)

import WidgetKit
import SwiftUI

// MARK: - Data

struct WidgetData {
  let remainingMinutes: Int
  let allowedMinutes: Int
  let isBlocked: Bool
  let cooldownUntil: Double

  static var placeholder: WidgetData {
    WidgetData(remainingMinutes: 30, allowedMinutes: 30, isBlocked: false, cooldownUntil: 0)
  }

  static func fromDefaults() -> WidgetData {
    let defaults = UserDefaults(suiteName: "group.com.nopamine.shared")
    let remaining = defaults?.integer(forKey: "remainingMinutes") ?? 0
    let allowed = defaults?.integer(forKey: "allowedMinutes") ?? 30
    let blocked = defaults?.bool(forKey: "isBlocked") ?? false
    let cooldown = defaults?.double(forKey: "cooldownUntil") ?? 0
    return WidgetData(remainingMinutes: remaining, allowedMinutes: allowed, isBlocked: blocked, cooldownUntil: cooldown)
  }
}

// MARK: - Timeline Provider

struct NopamineProvider: TimelineProvider {
  func placeholder(in context: Context) -> NopamineEntry {
    NopamineEntry(date: Date(), data: .placeholder)
  }

  func getSnapshot(in context: Context, completion: @escaping (NopamineEntry) -> Void) {
    completion(NopamineEntry(date: Date(), data: .fromDefaults()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<NopamineEntry>) -> Void) {
    let data = WidgetData.fromDefaults()
    let entry = NopamineEntry(date: Date(), data: data)
    // 30분마다 자동 갱신
    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
    let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
    completion(timeline)
  }
}

struct NopamineEntry: TimelineEntry {
  let date: Date
  let data: WidgetData
}

// MARK: - Widget View

struct NopamineWidgetView: View {
  let data: WidgetData

  var timeColor: Color {
    data.isBlocked ? Color(red: 0.97, green: 0.44, blue: 0.44) : Color(red: 0.29, green: 0.86, blue: 0.50)
  }

  var progressRatio: Double {
    guard data.allowedMinutes > 0 else { return 0 }
    let used = data.allowedMinutes - data.remainingMinutes
    return min(1.0, Double(used) / Double(data.allowedMinutes))
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text("Nopamine")
        .font(.system(size: 11, weight: .medium))
        .foregroundColor(.gray)

      if data.isBlocked {
        let cooldownRemain = max(0, Int((data.cooldownUntil / 1000 - Date().timeIntervalSince1970) / 60))
        Text("\(cooldownRemain)분")
          .font(.system(size: 32, weight: .black))
          .foregroundColor(timeColor)
        Text("후 해제")
          .font(.system(size: 11))
          .foregroundColor(.gray)
      } else {
        Text("\(data.remainingMinutes)분")
          .font(.system(size: 32, weight: .black))
          .foregroundColor(timeColor)
        Text("남은 시간")
          .font(.system(size: 11))
          .foregroundColor(.gray)
      }

      Spacer()

      // 프로그레스 바
      GeometryReader { geo in
        ZStack(alignment: .leading) {
          RoundedRectangle(cornerRadius: 2)
            .fill(Color(white: 0.15))
            .frame(height: 4)
          RoundedRectangle(cornerRadius: 2)
            .fill(timeColor)
            .frame(width: geo.size.width * progressRatio, height: 4)
        }
      }
      .frame(height: 4)
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(Color(red: 0.10, green: 0.10, blue: 0.10))
    .clipShape(RoundedRectangle(cornerRadius: 16))
  }
}

// MARK: - Widget Configuration

@main
struct NopamineWidget: Widget {
  let kind = "NopamineWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: NopamineProvider()) { entry in
      NopamineWidgetView(data: entry.data)
        .containerBackground(Color(red: 0.10, green: 0.10, blue: 0.10), for: .widget)
    }
    .configurationDisplayName("Nopamine")
    .description("오늘 남은 숏폼 시청 시간을 확인하세요.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
  NopamineWidget()
} timeline: {
  NopamineEntry(date: .now, data: .placeholder)
  NopamineEntry(date: .now, data: WidgetData(remainingMinutes: 5, allowedMinutes: 30, isBlocked: false, cooldownUntil: 0))
  NopamineEntry(date: .now, data: WidgetData(remainingMinutes: 0, allowedMinutes: 30, isBlocked: true, cooldownUntil: Date().timeIntervalSince1970 * 1000 + 1800000))
}
