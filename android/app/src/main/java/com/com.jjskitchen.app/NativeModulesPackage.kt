package com.jjskitchen.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * React Native package that registers our custom native modules:
 *  - PhoneNumberHintModule  → Phone number auto-detection via Google Identity Services
 *  - SmsRetrieverModule     → OTP auto-detection via SMS Retriever API
 */
class NativeModulesPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            PhoneNumberHintModule(reactContext),
            SmsRetrieverModule(reactContext),
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
