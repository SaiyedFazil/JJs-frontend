# Professional Guide: Generating Production APK for JJ's Kitchen

This guide outlines the step-by-step process to generate a signed, production-ready APK for Android. 

### ⚠️ Pre-Requisites
1. **API URL Validation**: Ensure your `.env` file contains the correct production API URL. Currently, it is set to: `https://jjs-backend-mows.onrender.com/api`.
2. **Android Studio**: Ensure you have Android SDK and Build Tools installed.

---

### Step 1: Generate a Signing Key (Keystore)
You need a signing key to sign your APK for production. Run this command in your terminal (replace `my-release-key` and `my-key-alias` with your preferred names):

```powershell
keytool -genkeypair -v -storetype RSA -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
> [!IMPORTANT]
> Keep this `.keystore` file safe! If you lose it, you cannot update your app on the Play Store in the future.

### Step 2: Move Keystore to Android Directory
Copy the generated `my-upload-key.keystore` file into the `android/app` directory of your project.

### Step 3: Configure Gradle Variables
Open `android/gradle.properties` and add the following lines (replace with the passwords you set in Step 1):

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### Step 4: Update Build Configuration
Open `android/app/build.gradle` and ensure the `signingConfigs` and `buildTypes` are set up to use your key:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 5: Clean and Build the APK
Navigate to the `android` folder in your terminal and run the build command:

```powershell
cd android
./gradlew clean
./gradlew assembleRelease
```

### Step 6: Locate your APK
Once the build is complete, you can find your signed APK at:
`android/app/build/outputs/apk/release/app-release.apk`

---

### 🚀 Tips for a Perfect Build
- **ProGuard**: Ensure `minifyEnabled` is true in `build.gradle` to reduce APK size and obfuscate your code.
- **Permissions**: Verify `AndroidManifest.xml` has only the necessary permissions (Internet, etc.).
- **Asset Check**: Run `npx react-native bundle` manually if you find that images are missing in the APK.

> [!TIP]
> To generate an **AAB** (Android App Bundle) for the Google Play Store instead of an APK, run `./gradlew bundleRelease` instead.
