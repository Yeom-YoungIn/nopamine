package com.nopamine

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class AppBlockAccessibilityService : AccessibilityService() {

    private val blockedPackages = setOf(
        "com.google.android.youtube",
        "com.instagram.android",
        "com.zhiliaoapp.musically"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return
        if (pkg !in blockedPackages) return

        val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
        val isBlocked = prefs.getBoolean("isBlocked", false)
        val cooldownUntil = prefs.getLong("cooldownUntil", 0L)

        val shouldBlock = isBlocked && (cooldownUntil == 0L || System.currentTimeMillis() < cooldownUntil)
        if (shouldBlock) {
            startOverlayService(pkg)
        }
    }

    private fun startOverlayService(packageName: String) {
        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("packageName", packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startService(intent)
    }

    override fun onInterrupt() {}
}
