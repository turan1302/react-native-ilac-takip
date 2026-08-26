import Foundation
import UIKit
import UniformTypeIdentifiers
import WidgetKit
import React

private final class BackupPickerSession: NSObject, UIDocumentPickerDelegate {
  static let shared = BackupPickerSession()

  private var resolve: RCTPromiseResolveBlock?
  private var reject: RCTPromiseRejectBlock?
  private var picker: UIDocumentPickerViewController?

  func present(
    from presenter: UIViewController,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    self.resolve = resolve
    self.reject = reject

    let picker = UIDocumentPickerViewController(
      forOpeningContentTypes: [.json, .text, .plainText, .data, .item],
      asCopy: true
    )
    picker.delegate = self
    picker.allowsMultipleSelection = false
    picker.shouldShowFileExtensions = true
    self.picker = picker
    presenter.present(picker, animated: true)
  }

  func documentPicker(
    _ controller: UIDocumentPickerViewController,
    didPickDocumentsAt urls: [URL]
  ) {
    let resolve = self.resolve
    let reject = self.reject

    guard let url = urls.first else {
      finish()
      reject?("PICK_CANCELLED", "cancelled", nil)
      return
    }

    do {
      let text = try NextDoseWidgetModule.importPickedFile(from: url)
      finish()
      resolve?(text)
    } catch {
      finish()
      reject?("PICK_FAILED", error.localizedDescription, error)
    }
  }

  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    reject?("PICK_CANCELLED", "cancelled", nil)
    finish()
  }

  private func finish() {
    picker = nil
    resolve = nil
    reject = nil
  }
}

@objc(NextDoseWidget)
class NextDoseWidgetModule: NSObject {
  static let suiteName = "group.com.mfbag.ilactakibi"
  static let backupFileName = "ilac-takibi-yedek.json"

  @objc static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(update:resolver:rejecter:)
  func update(
    _ payload: NSDictionary,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let defaults = UserDefaults(suiteName: NextDoseWidgetModule.suiteName) ?? .standard
    defaults.set(payload["kind"] as? String ?? "empty", forKey: "kind")
    defaults.set(payload["kicker"] as? String ?? "", forKey: "kicker")
    defaults.set(payload["title"] as? String ?? "", forKey: "title")
    defaults.set(payload["subtitle"] as? String ?? "", forKey: "subtitle")
    defaults.set(payload["time"] as? String ?? "", forKey: "time")
    defaults.set(payload["pillId"] as? String ?? "", forKey: "pillId")
    defaults.set(payload["itemsJson"] as? String ?? "[]", forKey: "itemsJson")
    defaults.synchronize()

    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }

    resolve(true)
  }

  @objc(shareJsonFile:filename:resolver:rejecter:)
  func shareJsonFile(
    _ contents: String,
    filename: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      do {
        let fileURL = try self.writeBackupFile(contents)
        guard let presenter = Self.topViewController() else {
          resolve(true)
          return
        }

        let activity = UIActivityViewController(
          activityItems: [fileURL],
          applicationActivities: nil
        )
        activity.completionWithItemsHandler = { _, _, _, _ in
          resolve(true)
        }

        if let popover = activity.popoverPresentationController {
          popover.sourceView = presenter.view
          popover.sourceRect = CGRect(
            x: presenter.view.bounds.midX,
            y: presenter.view.bounds.midY,
            width: 1,
            height: 1
          )
          popover.permittedArrowDirections = []
        }

        presenter.present(activity, animated: true)
      } catch {
        reject("SHARE_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(pickBackupFile:rejecter:)
  func pickBackupFile(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      guard let presenter = Self.topViewController() else {
        reject("PICK_FAILED", "Ekran bulunamadı", nil)
        return
      }

      BackupPickerSession.shared.present(
        from: presenter,
        resolve: resolve,
        reject: reject
      )
    }
  }

  @objc(readLocalBackupFile:rejecter:)
  func readLocalBackupFile(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let url = Self.backupFileURL()
        guard FileManager.default.fileExists(atPath: url.path) else {
          DispatchQueue.main.async {
            reject("NO_LOCAL_BACKUP", "Kayıtlı yedek yok", nil)
          }
          return
        }

        let data = try Data(contentsOf: url)
        let text = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if text.isEmpty {
          DispatchQueue.main.async {
            reject("NO_LOCAL_BACKUP", "Kayıtlı yedek yok", nil)
          }
          return
        }

        DispatchQueue.main.async {
          resolve(text)
        }
      } catch {
        DispatchQueue.main.async {
          reject("READ_FAILED", error.localizedDescription, error)
        }
      }
    }
  }

  @objc(shareText:title:resolver:rejecter:)
  func shareText(
    _ text: String,
    title: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    shareJsonFile(text, filename: Self.backupFileName, resolver: resolve, rejecter: reject)
  }

  @objc(copyText:title:resolver:rejecter:)
  func copyText(
    _ text: String,
    title: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    UIPasteboard.general.string = text
    resolve(true)
  }

  @objc(getClipboard:rejecter:)
  func getClipboard(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(UIPasteboard.general.string ?? "")
  }

  private func writeBackupFile(_ contents: String) throws -> URL {
    let fileURL = Self.backupFileURL()
    try contents.write(to: fileURL, atomically: true, encoding: .utf8)
    return fileURL
  }

  private static func backupFileURL() -> URL {
    let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      ?? FileManager.default.temporaryDirectory
    return docs.appendingPathComponent(backupFileName)
  }

  static func importPickedFile(from url: URL) throws -> String {
    let dest = backupFileURL()
    let accessed = url.startAccessingSecurityScopedResource()
    defer {
      if accessed {
        url.stopAccessingSecurityScopedResource()
      }
    }

    var coordinationError: NSError?
    var copyError: Error?

    NSFileCoordinator().coordinate(
      readingItemAt: url,
      options: [.withoutChanges],
      error: &coordinationError
    ) { source in
      do {
        if source.standardizedFileURL.path != dest.standardizedFileURL.path {
          if FileManager.default.fileExists(atPath: dest.path) {
            try FileManager.default.removeItem(at: dest)
          }
          try FileManager.default.copyItem(at: source, to: dest)
        }
      } catch {
        copyError = error
      }
    }

    if let coordinationError {
      throw coordinationError
    }
    if let copyError {
      throw copyError
    }

    var data = try Data(contentsOf: dest)
    if data.isEmpty {
      throw NSError(
        domain: "NextDoseWidget",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Seçilen dosya boş"]
      )
    }

    if data.starts(with: [0xEF, 0xBB, 0xBF]) {
      data.removeFirst(3)
    }

    guard let text = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines),
          text.first == "{" || text.first == "["
    else {
      throw NSError(
        domain: "NextDoseWidget",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Seçilen dosya JSON değil"]
      )
    }

    try text.write(to: dest, atomically: true, encoding: .utf8)
    return text
  }

  static func readText(from url: URL) throws -> String {
    return try importPickedFile(from: url)
  }

  private static func topViewController() -> UIViewController? {
    if let presented = RCTPresentedViewController() {
      return presented
    }

    let windows = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }

    let root =
      windows.first { $0.isKeyWindow }?.rootViewController
      ?? windows.first { $0.rootViewController != nil }?.rootViewController
      ?? UIApplication.shared.delegate?.window??.rootViewController

    return unwrap(root)
  }

  private static func unwrap(_ controller: UIViewController?) -> UIViewController? {
    if let navigation = controller as? UINavigationController {
      return unwrap(navigation.visibleViewController)
    }

    if let tab = controller as? UITabBarController {
      return unwrap(tab.selectedViewController)
    }

    if let presented = controller?.presentedViewController {
      return unwrap(presented)
    }

    return controller
  }
}
