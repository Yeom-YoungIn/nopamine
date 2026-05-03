package com.nopamine

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.Calendar

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

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
        if (!hasUsageStatsPermissionSync()) {
            promise.reject("PERMISSION_DENIED", "PACKAGE_USAGE_STATS permission not granted")
            return
        }
        val usm = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            cal.timeInMillis,
            System.currentTimeMillis()
        )
        val totalMs = stats?.filter { it.packageName == packageName }
            ?.sumOf { it.totalTimeInForeground } ?: 0L
        promise.resolve((totalMs / 60000).toInt())
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
}
