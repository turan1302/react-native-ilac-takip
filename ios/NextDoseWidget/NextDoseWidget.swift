import WidgetKit
import SwiftUI

struct NextDoseEntry: TimelineEntry {
  let date: Date
  let kind: String
  let kicker: String
  let title: String
  let subtitle: String
  let pillId: String
  let time: String
  let itemsJson: String
}

struct NextDoseProvider: TimelineProvider {
  private let defaults = UserDefaults(suiteName: "group.com.mfbag.ilactakibi")

  func placeholder(in context: Context) -> NextDoseEntry {
    NextDoseEntry(
      date: Date(),
      kind: "upcoming",
      kicker: "Sıradaki doz",
      title: "Sıradaki: Aferin",
      subtitle: "Aferin • 13:30",
      pillId: "",
      time: "13:30",
      itemsJson: "[]"
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (NextDoseEntry) -> Void) {
    completion(currentEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<NextDoseEntry>) -> Void) {
    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
    completion(Timeline(entries: [currentEntry()], policy: .after(nextUpdate)))
  }

  private func currentEntry() -> NextDoseEntry {
    NextDoseEntry(
      date: Date(),
      kind: defaults?.string(forKey: "kind") ?? "empty",
      kicker: defaults?.string(forKey: "kicker") ?? "Sıradaki doz",
      title: defaults?.string(forKey: "title") ?? "Sıradaki ilaç yok",
      subtitle: defaults?.string(forKey: "subtitle") ?? "İlaç ekleyin",
      pillId: defaults?.string(forKey: "pillId") ?? "",
      time: defaults?.string(forKey: "time") ?? "",
      itemsJson: defaults?.string(forKey: "itemsJson") ?? "[]"
    )
  }
}

struct NextDoseWidgetEntryView: View {
  var entry: NextDoseProvider.Entry

  private var canTake: Bool {
    entry.kind == "overdue" || entry.kind == "upcoming"
  }

  private var takeURL: URL {
    var components = URLComponents()
    components.scheme = "ilactakip"
    components.host = "take"
    components.queryItems = [
      URLQueryItem(name: "pillId", value: entry.pillId),
      URLQueryItem(name: "time", value: entry.time),
      URLQueryItem(name: "items", value: entry.itemsJson),
    ]
    return components.url ?? URL(string: "ilactakip://open")!
  }

  var body: some View {
    ZStack {
      Color(red: 36 / 255, green: 192 / 255, blue: 184 / 255)
      VStack(alignment: .leading, spacing: 6) {
        Text(entry.kicker)
          .font(.caption.bold())
          .textCase(.uppercase)
        Text(entry.title)
          .font(.headline)
          .minimumScaleFactor(0.8)
        Text(entry.subtitle)
          .font(.caption)
          .opacity(0.92)
        if canTake {
          Link(destination: takeURL) {
            Text("Aldım")
              .font(.caption.bold())
              .padding(.horizontal, 12)
              .padding(.vertical, 6)
              .background(Color.white)
              .foregroundColor(Color(red: 15 / 255, green: 118 / 255, blue: 110 / 255))
              .cornerRadius(8)
          }
        }
        Spacer(minLength: 0)
      }
      .foregroundColor(.white)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .padding()
    }
    .widgetURL(canTake ? takeURL : URL(string: "ilactakip://open"))
  }
}

@main
struct NextDoseWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "NextDoseWidget", provider: NextDoseProvider()) { entry in
      NextDoseWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Sıradaki ilaç")
    .description("Bugünün sıradaki ilacı, tek dokunuşla Aldım.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
