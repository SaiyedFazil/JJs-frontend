package com.jjskitchen.app

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status

/**
 * Native module implementing the Google SMS User Consent API.
 *
 * Unlike the SMS Retriever API, this does NOT require any app hash in the SMS.
 * Your SMS can be in any format, e.g.:
 *   "123456 is your JJ's Kitchen verification code. It expires in 5 minutes."
 *
 * Flow:
 *  1. JS calls startSmsRetriever() when the OTP screen opens.
 *  2. An OTP SMS arrives → Android shows a native consent dialog:
 *     "Allow JJ's Kitchen to read this message? [SMS text]"
 *  3. User taps Allow → onActivityResult fires → we emit 'onSmsReceived'.
 *  4. JS extracts the 6-digit OTP and auto-fills the fields.
 *
 * No READ_SMS or RECEIVE_SMS permissions needed.
 */
class SmsRetrieverModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

    companion object {
        private const val TAG = "SmsUserConsent"
        private const val SMS_CONSENT_REQUEST_CODE = 7002
        private const val EVENT_SMS_RECEIVED = "onSmsReceived"
        private const val EVENT_SMS_TIMEOUT = "onSmsTimeout"
    }

    private var smsConsentReceiver: SmsConsentReceiver? = null
    private var isReceiverRegistered = false

    init {
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = "SmsRetrieverModule"

    // ── JS-callable methods ──────────────────────────────────────────────

    @ReactMethod
    fun startSmsRetriever(promise: Promise) {
        val activity = reactApplicationContext.currentActivity as? Activity
        if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "No Activity available to start SMS User Consent.")
            return
        }

        try {
            val client = SmsRetriever.getClient(activity)
            // null = accept OTP SMS from any sender
            val task = client.startSmsUserConsent(null)

            task.addOnSuccessListener {
                Log.d(TAG, "SMS User Consent listener started successfully")
                registerConsentReceiver()
                promise.resolve(true)
            }

            task.addOnFailureListener { e ->
                Log.e(TAG, "Failed to start SMS User Consent", e)
                promise.reject("E_SMS_CONSENT_FAILED", "Failed to start: ${e.message}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error starting SMS User Consent", e)
            promise.reject("E_SMS_CONSENT_FAILED", "Unexpected error: ${e.message}")
        }
    }

    @ReactMethod
    fun stopSmsRetriever() {
        unregisterConsentReceiver()
        Log.d(TAG, "SMS User Consent listener stopped")
    }

    // Required for RN event emitter (New Architecture)
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    // ── BroadcastReceiver ────────────────────────────────────────────────

    private fun registerConsentReceiver() {
        if (isReceiverRegistered) {
            unregisterConsentReceiver()
        }

        smsConsentReceiver = SmsConsentReceiver()
        val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // Must be EXPORTED so Google Play Services can deliver the broadcast
                reactContext.registerReceiver(
                    smsConsentReceiver,
                    intentFilter,
                    Context.RECEIVER_EXPORTED
                )
            } else {
                reactContext.registerReceiver(smsConsentReceiver, intentFilter)
            }
            isReceiverRegistered = true
            Log.d(TAG, "SMS User Consent BroadcastReceiver registered")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register BroadcastReceiver", e)
        }
    }

    private fun unregisterConsentReceiver() {
        if (isReceiverRegistered && smsConsentReceiver != null) {
            try {
                reactContext.unregisterReceiver(smsConsentReceiver)
                Log.d(TAG, "SMS User Consent BroadcastReceiver unregistered")
            } catch (e: Exception) {
                Log.e(TAG, "Error unregistering receiver", e)
            }
            isReceiverRegistered = false
            smsConsentReceiver = null
        }
    }

    // ── ActivityEventListener ─────────────────────────────────────────────
    // Called when user taps Allow or Deny on the native consent dialog

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != SMS_CONSENT_REQUEST_CODE) return

        when (resultCode) {
            Activity.RESULT_OK -> {
                val message = data?.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                Log.d(TAG, "User consented — SMS: $message")
                val params = Arguments.createMap().apply {
                    putString("message", message)
                }
                sendEvent(EVENT_SMS_RECEIVED, params)
                unregisterConsentReceiver()
            }
            Activity.RESULT_CANCELED -> {
                Log.d(TAG, "User denied SMS consent dialog")
                unregisterConsentReceiver()
            }
        }
    }

    // RN 0.73+ changed the signature to non-nullable Intent
    override fun onNewIntent(intent: Intent) {}

    // ── Event Emitting ────────────────────────────────────────────────────

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // ── LifecycleEventListener ─────────────────────────────────────────────

    override fun onHostResume() {}
    override fun onHostPause() {}
    override fun onHostDestroy() {
        unregisterConsentReceiver()
    }

    // ── Inner BroadcastReceiver ────────────────────────────────────────────
    // Receives the GMS broadcast and launches the native consent dialog

    inner class SmsConsentReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (SmsRetriever.SMS_RETRIEVED_ACTION != intent.action) return

            val extras = intent.extras ?: return
            val status = extras.get(SmsRetriever.EXTRA_STATUS) as? Status ?: return

            Log.d(TAG, "Broadcast received, status: ${status.statusCode}")

            when (status.statusCode) {
                CommonStatusCodes.SUCCESS -> {
                    val consentIntent = extras.getParcelable<Intent>(SmsRetriever.EXTRA_CONSENT_INTENT)
                    val activity = reactApplicationContext.currentActivity as? Activity

                    if (consentIntent != null && activity != null) {
                        try {
                            Log.d(TAG, "Launching native SMS User Consent dialog")
                            activity.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST_CODE)
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to launch consent dialog", e)
                        }
                    } else {
                        Log.e(TAG, "consentIntent=$consentIntent, activity=$activity — cannot show dialog")
                    }
                }
                CommonStatusCodes.TIMEOUT -> {
                    Log.d(TAG, "SMS User Consent timed out (5 minutes)")
                    val params = Arguments.createMap().apply {
                        putString("error", "SMS User Consent timed out")
                    }
                    sendEvent(EVENT_SMS_TIMEOUT, params)
                    unregisterConsentReceiver()
                }
                else -> {
                    Log.w(TAG, "Unexpected status code: ${status.statusCode}")
                }
            }
        }
    }
}
