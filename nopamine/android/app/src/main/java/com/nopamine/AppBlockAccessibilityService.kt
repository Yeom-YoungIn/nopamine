package com.nopamine

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppBlockAccessibilityService : AccessibilityService() {

    private val handler = Handler(Looper.getMainLooper())
    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.US)

    private var currentPackage: String? = null
    private var checkerRunning = false
    private var lastBlockedAt = 0L

    private val screenOffReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_SCREEN_OFF) {
                stopChecker()
            }
        }
    }

    private val usageChecker = object : Runnable {
        override fun run() {
            val pkg = currentPackage
            if (pkg == null) {
                stopChecker()
                return
            }

            val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
            val now = System.currentTimeMillis()
            resetForNewDayIfNeeded(prefs, now)

            val isEnabled = prefs.getBoolean("isEnabled", false)
            val enabledPackages = prefs.getStringSet("enabledPackages", emptySet()) ?: emptySet()

            if (!isEnabled || pkg !in enabledPackages) {
                stopChecker()
                return
            }

            val allowedMinutes = prefs.getInt("allowedMinutes", 30)
            val cooldownMinutes = prefs.getInt("cooldownMinutes", 30)
            val allowedSeconds = allowedMinutes * 60

            val isBlocked = prefs.getBoolean("isBlocked", false)
            val cooldownUntil = prefs.getLong("cooldownUntil", 0L)
            val stillBlocked = isBlocked && (cooldownUntil == 0L || now < cooldownUntil)

            if (stillBlocked) {
                prefs.edit()
                    .putInt("remainingSeconds", 0)
                    .putInt("remainingMinutes", 0)
                    .putLong("lastTrackedAt", now)
                    .apply()
                performBlock()
                handler.postDelayed(this, CHECK_INTERVAL_MS)
                return
            }

            val lastTrackedAt = prefs.getLong("lastTrackedAt", 0L)
            val elapsedSeconds = if (lastTrackedAt > 0L) {
                ((now - lastTrackedAt).coerceAtLeast(0L) / 1000L).toInt()
            } else {
                0
            }

            val usedSeconds = (prefs.getInt("usedSeconds", 0) + elapsedSeconds).coerceAtMost(allowedSeconds)
            val remainingSeconds = (allowedSeconds - usedSeconds).coerceAtLeast(0)

            prefs.edit()
                .putInt("usedSeconds", usedSeconds)
                .putInt("remainingSeconds", remainingSeconds)
                .putInt("remainingMinutes", remainingSeconds / 60)
                .putInt("allowedMinutes", allowedMinutes)
                .putLong("lastTrackedAt", now)
                .apply()
            NopamineWidget.updateAllWidgets(this@AppBlockAccessibilityService)

            if (remainingSeconds <= 0) {
                val nextCooldownUntil = now + cooldownMinutes * 60 * 1000L
                prefs.edit()
                    .putBoolean("isBlocked", true)
                    .putLong("cooldownUntil", nextCooldownUntil)
                    .putInt("remainingSeconds", 0)
                    .putInt("remainingMinutes", 0)
                    .apply()
                Log.d(TAG, "Limit reached: usedSeconds=$usedSeconds allowedSeconds=$allowedSeconds")
                performBlock()
            }

            handler.postDelayed(this, CHECK_INTERVAL_MS)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return
        val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
        val enabledPackages = prefs.getStringSet("enabledPackages", emptySet()) ?: emptySet()

        currentPackage = pkg
        prefs.edit().putString("currentForegroundPackage", pkg).apply()

        if (pkg in enabledPackages) {
            startChecker()
        } else {
            stopChecker()
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        registerReceiver(screenOffReceiver, IntentFilter(Intent.ACTION_SCREEN_OFF))
    }

    override fun onInterrupt() {
        stopChecker()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopChecker()
        unregisterReceiver(screenOffReceiver)
    }

    private fun startChecker() {
        if (checkerRunning) return
        checkerRunning = true
        handler.post(usageChecker)
    }

    private fun stopChecker() {
        checkerRunning = false
        currentPackage = null
        handler.removeCallbacks(usageChecker)
        getSharedPreferences("nopamine", MODE_PRIVATE).edit()
            .putLong("lastTrackedAt", 0L)
            .apply()
    }

    private fun performBlock() {
        val now = System.currentTimeMillis()
        if (now - lastBlockedAt < 300) return
        lastBlockedAt = now
        performGlobalAction(GLOBAL_ACTION_HOME)
    }

    private fun resetForNewDayIfNeeded(prefs: android.content.SharedPreferences, now: Long) {
        val today = todayString(now)
        val savedDate = prefs.getString("trackingDate", null)
        if (savedDate == today) return

        val allowedMinutes = prefs.getInt("allowedMinutes", 30)
        prefs.edit()
            .putString("trackingDate", today)
            .putInt("usedSeconds", 0)
            .putInt("remainingSeconds", allowedMinutes * 60)
            .putInt("remainingMinutes", allowedMinutes)
            .putBoolean("isBlocked", false)
            .putLong("cooldownUntil", 0L)
            .putLong("lastTrackedAt", now)
            .apply()
    }

    private fun todayString(now: Long): String {
        return dateFormatter.format(Date(now))
    }

    companion object {
        private const val TAG = "NopamineBlock"
        private const val CHECK_INTERVAL_MS = 1_000L
    }
}
