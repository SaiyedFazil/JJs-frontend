package com.jjskitchen.app

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Log
import com.facebook.react.bridge.*
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity

/**
 * Native module that uses Google Identity Services Phone Number Hint API
 * to present a system dialog allowing the user to select their phone number
 * from the device's SIM card(s).
 *
 * This API:
 *  - Requires NO runtime permissions (no READ_PHONE_STATE)
 *  - Works on Android 5.0+ with Google Play Services
 *  - Shows a native bottom-sheet picker with available phone numbers
 *  - Is the Google-recommended approach for phone number onboarding
 *  - Supports Android 14, 15, 16
 */
class PhoneNumberHintModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        private const val TAG = "PhoneNumberHint"
        private const val PHONE_HINT_REQUEST_CODE = 7001
        private const val E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST"
        private const val E_PHONE_HINT_CANCELLED = "E_PHONE_HINT_CANCELLED"
        private const val E_PHONE_HINT_FAILED = "E_PHONE_HINT_FAILED"
    }

    private var phoneHintPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "PhoneNumberHintModule"

    /**
     * Launches the Phone Number Hint picker dialog.
     * Resolves with the selected phone number string, or rejects on error/cancellation.
     */
    @ReactMethod
    fun requestPhoneNumberHint(promise: Promise) {
        val activity = reactApplicationContext.currentActivity as? Activity
        if (activity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity is null — cannot show phone hint.")
            return
        }

        // Only allow one concurrent request
        phoneHintPromise?.reject(E_PHONE_HINT_CANCELLED, "New request initiated.")
        phoneHintPromise = promise

        try {
            val request = GetPhoneNumberHintIntentRequest.builder().build()
            val signInClient = Identity.getSignInClient(activity)

            signInClient.getPhoneNumberHintIntent(request)
                .addOnSuccessListener { pendingIntent ->
                    try {
                        Log.d(TAG, "Launching phone number hint picker…")
                        activity.startIntentSenderForResult(
                            pendingIntent.intentSender,
                            PHONE_HINT_REQUEST_CODE,
                            null, 0, 0, 0
                        )
                    } catch (e: IntentSender.SendIntentException) {
                        Log.e(TAG, "Failed to start phone hint intent", e)
                        resolvePromise(null, E_PHONE_HINT_FAILED, "Failed to launch phone hint: ${e.message}")
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Phone hint intent request failed: ${e.message}", e)
                    resolvePromise(null, E_PHONE_HINT_FAILED, "Phone hint unavailable: ${e.message}")
                }
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error requesting phone hint", e)
            resolvePromise(null, E_PHONE_HINT_FAILED, "Unexpected error: ${e.message}")
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != PHONE_HINT_REQUEST_CODE) return

        Log.d(TAG, "onActivityResult: requestCode=$requestCode, resultCode=$resultCode")

        when (resultCode) {
            Activity.RESULT_OK -> {
                try {
                    val phoneNumber = Identity.getSignInClient(activity)
                        .getPhoneNumberFromIntent(data)
                    Log.d(TAG, "Phone number selected: $phoneNumber")
                    resolvePromise(phoneNumber, null, null)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to extract phone number from result", e)
                    resolvePromise(null, E_PHONE_HINT_FAILED, "Failed to get phone number: ${e.message}")
                }
            }
            Activity.RESULT_CANCELED -> {
                Log.d(TAG, "User cancelled phone hint dialog")
                resolvePromise(null, E_PHONE_HINT_CANCELLED, "User cancelled the phone number picker.")
            }
            else -> {
                Log.w(TAG, "Unexpected result code: $resultCode")
                resolvePromise(null, E_PHONE_HINT_FAILED, "Unexpected result code: $resultCode")
            }
        }
    }

    // RN 0.73+ / 0.85: onNewIntent takes non-nullable Intent
    override fun onNewIntent(intent: Intent) {
        // Not needed for phone hint
    }

    /**
     * Thread-safe promise resolution — ensures we only resolve/reject once.
     */
    private fun resolvePromise(result: String?, errorCode: String?, errorMessage: String?) {
        val promise = phoneHintPromise ?: return
        phoneHintPromise = null

        if (result != null) {
            promise.resolve(result)
        } else {
            promise.reject(errorCode ?: E_PHONE_HINT_FAILED, errorMessage ?: "Unknown error")
        }
    }
}
