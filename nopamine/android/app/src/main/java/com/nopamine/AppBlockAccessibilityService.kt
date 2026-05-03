package com.nopamine

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class AppBlockAccessibilityService : AccessibilityService() {

    private val blockedPackages = setOf(
        "com.google.android.youtube",
        "com.instagram.android",
        "com.zhiliaoapp.musically"
    )

    // 마지막 홈 액션 시각 — 연속 이벤트에 의한 중복 발동 방지용 (짧게 유지)
    private var lastBlockedAt = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return
        if (pkg !in blockedPackages) return

        val now = System.currentTimeMillis()
        if (now - lastBlockedAt < 300) return   // 동일 이벤트 중복 방지만, 재실행은 막지 않음

        val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
        val isBlocked = prefs.getBoolean("isBlocked", false)
        val cooldownUntil = prefs.getLong("cooldownUntil", 0L)

        val shouldBlock = isBlocked && (cooldownUntil == 0L || now < cooldownUntil)
        Log.d(TAG, "pkg=$pkg isBlocked=$isBlocked cooldownUntil=$cooldownUntil shouldBlock=$shouldBlock")

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
