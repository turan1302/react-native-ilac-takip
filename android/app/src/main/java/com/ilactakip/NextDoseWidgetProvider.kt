package com.ilactakip

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews

class NextDoseWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    appWidgetIds.forEach { id -> updateWidget(context, appWidgetManager, id) }
  }

  companion object {
    const val PREFS = "next_dose_widget"

    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val component = ComponentName(context, NextDoseWidgetProvider::class.java)
      val ids = manager.getAppWidgetIds(component)
      ids.forEach { id -> updateWidget(context, manager, id) }
    }

    private fun updateWidget(
      context: Context,
      manager: AppWidgetManager,
      appWidgetId: Int,
    ) {
      val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      val kicker = prefs.getString("kicker", "Sıradaki doz") ?: "Sıradaki doz"
      val title = prefs.getString("title", "Sıradaki ilaç yok") ?: "Sıradaki ilaç yok"
      val subtitle = prefs.getString("subtitle", "İlaç ekleyin") ?: "İlaç ekleyin"
      val pillId = prefs.getString("pillId", "") ?: ""
      val time = prefs.getString("time", "") ?: ""
      val itemsJson = prefs.getString("itemsJson", "[]") ?: "[]"
      val kind = prefs.getString("kind", "empty") ?: "empty"
      val canTake = kind == "overdue" || kind == "upcoming"

      val views = RemoteViews(context.packageName, R.layout.widget_next_dose)
      views.setTextViewText(R.id.widget_kicker, kicker)
      views.setTextViewText(R.id.widget_title, title)
      views.setTextViewText(R.id.widget_subtitle, subtitle)
      views.setViewVisibility(R.id.widget_take, if (canTake) View.VISIBLE else View.GONE)

      val openIntent =
        Intent(context, MainActivity::class.java).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
      views.setOnClickPendingIntent(
        R.id.widget_root,
        PendingIntent.getActivity(
          context,
          appWidgetId,
          openIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        ),
      )

      if (canTake) {
        val takeUri =
          Uri.parse("ilactakip://take")
            .buildUpon()
            .appendQueryParameter("items", itemsJson)
            .appendQueryParameter("pillId", pillId)
            .appendQueryParameter("time", time)
            .build()
        val takeIntent =
          Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = takeUri
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
          }
        views.setOnClickPendingIntent(
          R.id.widget_take,
          PendingIntent.getActivity(
            context,
            1000 + appWidgetId,
            takeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
          ),
        )
      }

      manager.updateAppWidget(appWidgetId, views)
    }
  }
}
