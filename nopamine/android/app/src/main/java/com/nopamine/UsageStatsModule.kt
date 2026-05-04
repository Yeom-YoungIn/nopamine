package com.nopamine

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.US)

    override fun getName() = "UsageStatsModule"

    /** PACKAGE_USAGE_STATS 권한 보유 여부 */
    @ReactMethod
    fun hasUsagePermission(promise: Promise) {
        val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        }
        promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
    }

    /** SYSTEM_ALERT_WINDOW 권한 보유 여부 */
    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(reactContext))
    }

    /** 접근성 서비스 활성화 여부 */
    @ReactMethod
    fun hasAccessibilityPermission(promise: Promise) {
        val enabled = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""
        promise.resolve(enabled.contains("${reactContext.packageName}/.AppBlockAccessibilityService"))
    }

    /** 사용량 접근 설정 화면으로 이동 */
    @ReactMethod
    fun openUsageSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    /** 다른 앱 위에 표시 설정 화면으로 이동 */
    @ReactMethod
    fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactContext.packageName}")
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    /** 접근성 설정 화면으로 이동 */
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    /** 오늘 특정 앱의 사용 시간(분) 조회 */
    @ReactMethod
    fun getUsageMinutesToday(packageName: String, promise: Promise) {
        val prefs = reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE)
        val enabledPackages = prefs.getStringSet("enabledPackages", emptySet()) ?: emptySet()
        if (packageName !in enabledPackages) {
            promise.resolve(0)
            return
        }

        resetForNewDayIfNeeded(prefs)
        val usedSeconds = prefs.getInt("usedSeconds", 0)
        promise.resolve(usedSeconds / 60)
    }

    /** JS → SharedPreferences 차단 상태 동기화 (AccessibilityService가 읽음) */
    @ReactMethod
    fun syncBlockState(isBlocked: Boolean, cooldownUntil: Double) {
        reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE).edit()
            .putBoolean("isBlocked", isBlocked)
            .putLong("cooldownUntil", cooldownUntil.toLong())
            .apply()
    }

    /** 기능 활성화 여부를 SharedPreferences에 저장 */
    @ReactMethod
    fun syncIsEnabled(isEnabled: Boolean) {
        reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE).edit()
            .putBoolean("isEnabled", isEnabled)
            .apply()
    }

    /** 사용량 추적 설정을 SharedPreferences에 저장 */
    @ReactMethod
    fun syncTrackingConfig(
        allowedMinutes: Int,
        cooldownMinutes: Int,
        enabledPackages: ReadableArray
    ) {
        val prefs = reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE)
        val packages = mutableSetOf<String>()
        for (i in 0 until enabledPackages.size()) {
            enabledPackages.getString(i)?.let { packages.add(it) }
        }

        prefs.edit()
            .putInt("allowedMinutes", allowedMinutes)
            .putInt("cooldownMinutes", cooldownMinutes)
            .putStringSet("enabledPackages", packages)
            .putInt("remainingSeconds", maxOf(0, allowedMinutes * 60 - prefs.getInt("usedSeconds", 0)))
            .putInt("remainingMinutes", maxOf(0, allowedMinutes * 60 - prefs.getInt("usedSeconds", 0)) / 60)
            .apply()
    }

    @ReactMethod
    fun resetUsageProgress() {
        val prefs = reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE)
        val allowedMinutes = prefs.getInt("allowedMinutes", 30)
        prefs.edit()
            .putString("trackingDate", todayString())
            .putInt("usedSeconds", 0)
            .putInt("remainingSeconds", allowedMinutes * 60)
            .putInt("remainingMinutes", allowedMinutes)
            .putBoolean("isBlocked", false)
            .putLong("cooldownUntil", 0L)
            .putLong("lastTrackedAt", 0L)
            .apply()
    }

    @ReactMethod
    fun getDebugState(promise: Promise) {
        val prefs = reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE)
        resetForNewDayIfNeeded(prefs)
        val result = Arguments.createMap().apply {
            putBoolean("isEnabled", prefs.getBoolean("isEnabled", false))
            putBoolean("isBlocked", prefs.getBoolean("isBlocked", false))
            putDouble("cooldownUntil", prefs.getLong("cooldownUntil", 0L).toDouble())
            putInt("allowedMinutes", prefs.getInt("allowedMinutes", 30))
            putInt("cooldownMinutes", prefs.getInt("cooldownMinutes", 30))
            putInt("usedSeconds", prefs.getInt("usedSeconds", 0))
            putInt("remainingSeconds", prefs.getInt("remainingSeconds", prefs.getInt("allowedMinutes", 30) * 60))
            putInt("remainingMinutes", prefs.getInt("remainingMinutes", 0))
            putString("currentForegroundPackage", prefs.getString("currentForegroundPackage", null))
            val packages = Arguments.createArray()
            (prefs.getStringSet("enabledPackages", emptySet()) ?: emptySet()).forEach {
                packages.pushString(it)
            }
            putArray("enabledPackages", packages)
        }
        promise.resolve(result)
    }

    /** 위젯 표시용 데이터 저장 + 위젯 강제 갱신 */
    @ReactMethod
    fun syncWidgetData(remainingMinutes: Int, allowedMinutes: Int, isBlocked: Boolean, cooldownUntil: Double) {
        reactContext.getSharedPreferences("nopamine", Context.MODE_PRIVATE).edit()
            .putInt("remainingMinutes", remainingMinutes)
            .putInt("allowedMinutes", allowedMinutes)
            .putBoolean("isBlocked", isBlocked)
            .putLong("cooldownUntil", cooldownUntil.toLong())
            .apply()
        NopamineWidget.updateAllWidgets(reactContext)
    }

    private fun hasUsageStatsPermissionSync(): Boolean {
        val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun resetForNewDayIfNeeded(prefs: android.content.SharedPreferences) {
        val today = todayString()
        if (prefs.getString("trackingDate", null) == today) return

        val allowedMinutes = prefs.getInt("allowedMinutes", 30)
        prefs.edit()
            .putString("trackingDate", today)
            .putInt("usedSeconds", 0)
            .putInt("remainingSeconds", allowedMinutes * 60)
            .putInt("remainingMinutes", allowedMinutes)
            .putBoolean("isBlocked", false)
            .putLong("cooldownUntil", 0L)
            .putLong("lastTrackedAt", 0L)
            .apply()
    }

    private fun todayString(): String {
        return dateFormatter.format(Date())
    }
}
