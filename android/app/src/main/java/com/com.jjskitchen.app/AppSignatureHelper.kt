package com.jjskitchen.app

import android.content.Context
import android.content.ContextWrapper
import android.content.pm.PackageManager
import android.os.Build
import android.util.Base64
import android.util.Log
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException
import java.util.Arrays

/**
 * Helper class to compute the 11-character app hash required by
 * the SMS Retriever API.
 *
 * NOTE: This class is kept for reference/debugging only.
 * The SMS User Consent API (our current approach) does NOT require
 * any app hash in the SMS message.
 */
class AppSignatureHelper(context: Context) : ContextWrapper(context) {

    companion object {
        private const val TAG = "AppSignatureHelper"
        private const val HASH_TYPE = "SHA-256"
        private const val NUM_HASHED_BYTES = 9
        private const val NUM_BASE64_CHAR = 11
    }

    fun getAppSignatures(): ArrayList<String> {
        val appSignatures = ArrayList<String>()

        try {
            val packageName = packageName
            val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val signingInfo = packageManager.getPackageInfo(
                    packageName,
                    PackageManager.GET_SIGNING_CERTIFICATES
                ).signingInfo  // signingInfo is nullable in SDK 33+

                if (signingInfo != null) {
                    if (signingInfo.hasMultipleSigners()) {
                        signingInfo.apkContentsSigners
                    } else {
                        signingInfo.signingCertificateHistory
                    }
                } else {
                    emptyArray()
                }
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(
                    packageName,
                    PackageManager.GET_SIGNATURES
                ).signatures ?: emptyArray()
            }

            for (signature in signatures) {
                val hash = hash(packageName, signature.toCharsString())
                if (hash != null) {
                    appSignatures.add(hash)
                }
            }
        } catch (e: PackageManager.NameNotFoundException) {
            Log.e(TAG, "Package not found", e)
        }

        return appSignatures
    }

    private fun hash(packageName: String, signature: String): String? {
        val appInfo = "$packageName $signature"
        try {
            val messageDigest = MessageDigest.getInstance(HASH_TYPE)
            messageDigest.update(appInfo.toByteArray(Charsets.UTF_8))
            var hashSignature = messageDigest.digest()

            hashSignature = Arrays.copyOfRange(hashSignature, 0, NUM_HASHED_BYTES)

            val base64Hash = Base64.encodeToString(
                hashSignature,
                Base64.NO_PADDING or Base64.NO_WRAP
            )
            val truncatedHash = base64Hash.substring(0, NUM_BASE64_CHAR)

            Log.d(TAG, "Package: $packageName — Hash: $truncatedHash")
            return truncatedHash
        } catch (e: NoSuchAlgorithmException) {
            Log.e(TAG, "NoSuchAlgorithm", e)
        }
        return null
    }
}
