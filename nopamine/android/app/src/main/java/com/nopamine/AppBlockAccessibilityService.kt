package com.nopamine

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class AppBlockAccessibilityService : AccessibilityService() {

    private val blockedPackages = setOf(
        "com.google.android.youtube",
        "com.instagram.android",
        "com.zhiliaoapp.musically",
        "com.google.android.calendar" // 테스트용
    )

    private var lastBlockedAt = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val type = event?.eventType ?: return
        if (type != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
            type != AccessibilityEvent.TYPE_WINDOWS_CHANGED) return

        val pkg = event.packageName?.toString() ?: return
        if (pkg !in blockedPackages) return

        val now = System.currentTimeMillis()
        if (now - lastBlockedAt < 1500) return

        val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
        val isBlocked = prefs.getBoolean("isBlocked", false)
        val cooldownUntil = prefs.getLong("cooldownUntil", 0L)

        val shouldBlock = isBlocked && (cooldownUntil == 0L || now < cooldownUntil)
        Log.d(TAG, "pkg=$pkg shouldBlock=$shouldBlock isBlocked=$isBlocked")

        if (!shouldBlock) return

        lastBlockedAt = now
        Log.d(TAG, "→ GLOBAL_ACTION_HOME")
        performGlobalAction(GLOBAL_ACTION_HOME)
    }

    override fun onInterrupt() {}

    companion object {
        private const val TAG = "NopamineBlock"
    }
}
