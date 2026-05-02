package com.nopamine

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.*
import android.view.*
import android.view.WindowManager.LayoutParams.*
import android.widget.*
import androidx.core.app.NotificationCompat
import java.util.concurrent.TimeUnit

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private val handler = Handler(Looper.getMainLooper())
    private var tickRunnable: Runnable? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (overlayView == null) showOverlay()
        return START_STICKY
    }

    private fun showOverlay() {
        val params = WindowManager.LayoutParams(
            MATCH_PARENT, MATCH_PARENT,
            TYPE_APPLICATION_OVERLAY,
            FLAG_NOT_FOCUSABLE or FLAG_NOT_TOUCH_MODAL or FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#F00F0F0F"))
        }

        TextView(this).apply {
            text = "🚫"
            textSize = 64f
            gravity = Gravity.CENTER
            root.addView(this)
        }

        TextView(this).apply {
            text = "오늘 시간을 다 썼어요"
            textSize = 24f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 12)
            root.addView(this)
        }

        val timerText = TextView(this).apply {
            textSize = 48f
            setTextColor(Color.parseColor("#F87171"))
            gravity = Gravity.CENTER
            setPadding(0, 24, 0, 0)
            root.addView(this)
        }

        overlayView = root
        windowManager.addView(root, params)

        tickRunnable = object : Runnable {
            override fun run() {
                val prefs = getSharedPreferences("nopamine", MODE_PRIVATE)
                val cooldownUntil = prefs.getLong("cooldownUntil", 0L)
                val remaining = cooldownUntil - System.currentTimeMillis()

                if (remaining <= 0) {
                    dismissOverlay()
                    return
                }

                val mins = TimeUnit.MILLISECONDS.toMinutes(remaining)
                val secs = TimeUnit.MILLISECONDS.toSeconds(remaining) % 60
                timerText.text = String.format("%02d:%02d", mins, secs)
                handler.postDelayed(this, 1000)
            }
        }
        handler.post(tickRunnable!!)
    }

    private fun dismissOverlay() {
        tickRunnable?.let { handler.removeCallbacks(it) }
        overlayView?.let { windowManager.removeView(it) }
        overlayView = null
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        dismissOverlay()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "Nopamine", NotificationManager.IMPORTANCE_LOW)
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
        }
    }

    private fun buildNotification(): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Nopamine 차단 중")
            .setContentText("허용 시간이 초과되었습니다.")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pi)
            .build()
    }

    companion object {
        private const val NOTIF_ID = 1001
        private const val CHANNEL_ID = "nopamine_block"
    }
}
