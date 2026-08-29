package com.ilactakip

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.io.File

class NextDoseWidgetModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var pickPromise: Promise? = null

  private val activityEventListener: ActivityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        intent: Intent?,
      ) {
        if (requestCode != PICK_BACKUP) {
          return
        }

        val promise = pickPromise ?: return
        pickPromise = null

        if (resultCode != Activity.RESULT_OK || intent?.data == null) {
          promise.reject("PICK_CANCELLED", "cancelled")
          return
        }

        try {
          val uri = intent.data!!
          try {
            activity.contentResolver.takePersistableUriPermission(
              uri,
              Intent.FLAG_GRANT_READ_URI_PERMISSION,
            )
          } catch (_: Exception) {
          }
          promise.resolve(importPickedUri(activity, uri))
        } catch (error: Exception) {
          promise.reject("PICK_FAILED", error)
        }
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName() = "NextDoseWidget"

  @ReactMethod
  fun update(payload: ReadableMap, promise: Promise) {
    try {
      val prefs =
        reactContext.getSharedPreferences(NextDoseWidgetProvider.PREFS, Context.MODE_PRIVATE)
      prefs
        .edit()
        .putString("kind", payload.optionalString("kind"))
        .putString("kicker", payload.optionalString("kicker"))
        .putString("title", payload.optionalString("title"))
        .putString("subtitle", payload.optionalString("subtitle"))
        .putString("time", payload.optionalString("time"))
        .putString("pillId", payload.optionalString("pillId"))
        .putString("itemsJson", payload.optionalString("itemsJson").ifBlank { "[]" })
        .apply()
      NextDoseWidgetProvider.updateAll(reactContext)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("WIDGET_UPDATE", error)
    }
  }

  @ReactMethod
  fun shareJsonFile(contents: String, filename: String, promise: Promise) {
    Handler(Looper.getMainLooper()).post {
      try {
        val name = filename.ifBlank { BACKUP_FILE_NAME }
        val bytes = contents.toByteArray(Charsets.UTF_8)
        val mime = mimeForName(name)
        val isBackup = name.endsWith(".json", ignoreCase = true)
        val file =
          if (isBackup) {
            backupFile().also { it.writeBytes(bytes) }
          } else {
            shareableFile(name).also { it.writeBytes(bytes) }
          }
        val uri =
          if (isBackup) {
            saveToDownloads(name, bytes, mime) ?: fileProviderUri(file)
          } else {
            fileProviderUri(file)
          }
        val subject = if (isBackup) "İlaç Takibi Yedeği" else name.substringBeforeLast('.')
        val chooserTitle = if (isBackup) "Yedeği kaydet" else "Paylaş"
        val intent =
          Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_STREAM, uri)
            clipData = ClipData.newRawUri(name, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
        startChooser(intent, chooserTitle)
        promise.resolve(true)
      } catch (error: Exception) {
        promise.reject("SHARE_FAILED", error)
      }
    }
  }

  @ReactMethod
  fun pickBackupFile(promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.reject("PICK_FAILED", "Ekran bulunamadı")
      return
    }

    pickPromise = promise
    val openDocument =
      Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "*/*"
        putExtra(
          Intent.EXTRA_MIME_TYPES,
          arrayOf("application/json", "text/plain", "text/json", "*/*"),
        )
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
      }

    try {
      activity.startActivityForResult(openDocument, PICK_BACKUP)
    } catch (_: Exception) {
      try {
        activity.startActivityForResult(
          Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
          },
          PICK_BACKUP,
        )
      } catch (error: Exception) {
        pickPromise = null
        promise.reject("PICK_FAILED", error)
      }
    }
  }

  @ReactMethod
  fun readLocalBackupFile(promise: Promise) {
    try {
      val file = backupFile()
      if (!file.exists() || file.length() == 0L) {
        promise.reject("NO_LOCAL_BACKUP", "Kayıtlı yedek yok")
        return
      }
      promise.resolve(decodeText(file.readBytes()))
    } catch (error: Exception) {
      promise.reject("READ_FAILED", error)
    }
  }

  @ReactMethod
  fun shareText(text: String, title: String, promise: Promise) {
    shareJsonFile(text, BACKUP_FILE_NAME, promise)
  }

  @ReactMethod
  fun copyText(text: String, title: String, promise: Promise) {
    try {
      val clipboard =
        reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      clipboard.setPrimaryClip(ClipData.newPlainText(title, text))
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("COPY_FAILED", error)
    }
  }

  @ReactMethod
  fun getClipboard(promise: Promise) {
    try {
      val clipboard =
        reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      val text = clipboard.primaryClip?.getItemAt(0)?.coerceToText(reactContext)?.toString() ?: ""
      promise.resolve(text)
    } catch (error: Exception) {
      promise.reject("CLIPBOARD_FAILED", error)
    }
  }

  private fun backupFile(): File {
    val dir = File(reactContext.filesDir, "backups")
    if (!dir.exists()) {
      dir.mkdirs()
    }
    return File(dir, BACKUP_FILE_NAME)
  }

  private fun shareableFile(name: String): File {
    val dir = File(reactContext.cacheDir, "share")
    if (!dir.exists()) {
      dir.mkdirs()
    }
    return File(dir, name)
  }

  private fun mimeForName(name: String): String =
    when {
      name.endsWith(".txt", ignoreCase = true) -> "text/plain"
      name.endsWith(".html", ignoreCase = true) -> "text/html"
      else -> "application/json"
    }

  private fun fileProviderUri(file: File = backupFile()): Uri =
    FileProvider.getUriForFile(
      reactContext,
      "${BuildConfig.APPLICATION_ID}.fileprovider",
      file,
    )

  private fun saveToDownloads(
    name: String,
    bytes: ByteArray,
    mime: String = "application/json",
  ): Uri? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      return null
    }

    return try {
      val values =
        ContentValues().apply {
          put(MediaStore.Downloads.DISPLAY_NAME, name)
          put(MediaStore.Downloads.MIME_TYPE, mime)
          put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
          put(MediaStore.Downloads.IS_PENDING, 1)
        }
      val uri =
        reactContext.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
          ?: return null
      reactContext.contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
      values.clear()
      values.put(MediaStore.Downloads.IS_PENDING, 0)
      reactContext.contentResolver.update(uri, values, null, null)
      uri
    } catch (_: Exception) {
      null
    }
  }

  private fun importPickedUri(activity: Activity, uri: Uri): String {
    val bytes =
      activity.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: ByteArray(0)
    if (bytes.isEmpty()) {
      throw IllegalStateException("Seçilen dosya boş")
    }

    val utf8 = bytes.toString(Charsets.UTF_8).removePrefix("\uFEFF").trim()
    if (!utf8.startsWith("{") && !utf8.startsWith("[")) {
      throw IllegalStateException("Seçilen dosya JSON değil")
    }

    backupFile().writeText(utf8, Charsets.UTF_8)
    return utf8
  }

  private fun decodeText(bytes: ByteArray): String {
    if (bytes.isEmpty()) {
      return ""
    }

    val utf8 = bytes.toString(Charsets.UTF_8).removePrefix("\uFEFF")
    val trimmed = utf8.trimStart()
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return utf8
    }

    val utf16 = bytes.toString(Charsets.UTF_16).removePrefix("\uFEFF")
    val utf16Trimmed = utf16.trimStart()
    if (utf16Trimmed.startsWith("{") || utf16Trimmed.startsWith("[")) {
      return utf16
    }

    return utf8
  }

  private fun startChooser(intent: Intent, title: String) {
    val chooser = Intent.createChooser(intent, title)
    chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    val activity = reactContext.currentActivity
    if (activity != null) {
      activity.startActivity(chooser)
    } else {
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(chooser)
    }
  }

  private fun ReadableMap.optionalString(key: String): String =
    if (hasKey(key) && !isNull(key)) getString(key) ?: "" else ""

  companion object {
    private const val PICK_BACKUP = 7412
    private const val BACKUP_FILE_NAME = "ilac-takibi-yedek.json"
  }
}
