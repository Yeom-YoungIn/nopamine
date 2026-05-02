package com.nopamine

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews

class NopamineWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id ->
            updateWidget(context, appWidgetManager, id)
        }
    }

    companion object {
        fun updateAllWidgets(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, NopamineWidget::class.java)
            )
            ids.forEach { updateWidget(context, manager, it) }
        }

        private fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int
        ) {
            val prefs = context.getSharedPreferences("nopamine", Context.MODE_PRIVATE)
            val remainingMinutes = prefs.getInt("remainingMinutes", 0)
            val allowedMinutes = prefs.getInt("allowedMinutes", 30)
            val isBlocked = prefs.getBoolean("isBlocked", false)
            val cooldownUntil = prefs.getLong("cooldownUntil", 0L)

            val views = RemoteViews(context.packageName, R.layout.widget_nopamine)

            if (isBlocked) {
                val cooldownRemain = ((cooldownUntil - System.currentTimeMillis()) / 60000).coerceAtLeast(0)
                views.setTextViewText(R.id.widget_time, "${cooldownRemain}분")
                views.setTextColor(R.id.widget_time, Color.parseColor("#F87171"))
                views.setTextViewText(R.id.widget_label, "후 해제")
            } else {
                views.setTextViewText(R.id.widget_time, "${remainingMinutes}분")
                views.setTextColor(R.id.widget_time, Color.parseColor("#4ADE80"))
                views.setTextViewText(R.id.widget_label, "남은 시간")
            }

            // 프로그레스 바: weight 방식 대신 직접 width 설정은 RemoteViews 제한으로 생략
            // 클릭 시 앱 실행
            val launchIntent = context.packageManager
                .getLaunchIntentForPackage(context.packageName)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent, PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_app_name, pendingIntent)
            views.setOnClickPendingIntent(R.id.widget_time, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
