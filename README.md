# 🍳 JJ's Kitchen — Customer Mobile App

> **React Native CLI** · **TypeScript** · **Android First** · **UI-First Development**

A production-grade food delivery mobile application for JJ's Kitchen. Built with React Native CLI using a feature-based modular architecture, strict TypeScript, and best-in-class libraries.

> **📌 Current Phase:** Building all UI screens with mock data first. Backend API integration will be added later when the API is ready.

---

## 📋 Table of Contents

- [What You Need to Install on Your PC](#-what-you-need-to-install-on-your-pc)
- [Is Android Studio Required?](#-is-android-studio-required)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Connecting Your Android Device](#-connecting-your-android-device)
- [Running on Android](#-running-on-android)
- [Building an Android APK](#-building-an-android-apk)
- [Deploying to Play Store (AAB)](#-deploying-to-play-store-aab)
- [Architecture Overview](#-architecture-overview)
- [Code Quality & Git Hooks](#-code-quality--git-hooks)
- [Key npm Commands Reference](#-key-npm-commands-reference)
- [Troubleshooting](#-troubleshooting)

---

## 💻 What You Need to Install on Your PC

### ✅ Environment — Fully Verified

All tools are installed and verified on this machine:

| Tool | Verified Version | Status |
|---|---|---|
| **Node.js** | v24.13.1 | ✅ Installed & verified |
| **npm** | v11.12.1 | ✅ Installed & verified |
| **Git** | v2.51.0.windows.1 | ✅ Installed & verified |
| **Java JDK 17** | OpenJDK 17.0.18 (Temurin-17.0.18+8) | ✅ Installed & verified |
| **JAVA_HOME** | `D:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot` | ✅ Set |
| **Android Studio** | Panda 3 (2025.3.3) | ✅ Installed & verified |
| **ANDROID_HOME** | `C:\Users\MohammedFazil-PC\AppData\Local\Android\Sdk` | ✅ Set |
| **ADB** | Version 1.0.41 (37.0.0-14910828) | ✅ Working |

**All prerequisites are complete. The machine is ready for React Native development.**

> The steps below are kept as a reference guide for any new developer joining this project who needs to set up their machine from scratch.

---

### Step 1 — Install Java JDK 17 (Eclipse Temurin via Adoptium)

React Native officially requires **exactly Java 17** for Android builds. Using Java 21 or higher **will cause Gradle build failures**. The Adoptium homepage shows JDK 25 by default — do not use that. Follow these exact steps:

1. Go to **https://adoptium.net/temurin/releases/**
2. Set the filters exactly as follows:
   - **Version:** `17 - LTS`
   - **OS:** `Windows`
   - **Architecture:** `x64`
   - **Package Type:** `JDK`
3. Download the **`.msi` installer** (easiest for Windows)
4. Run the `.msi` installer with all default options
   - The `.msi` automatically sets the `JAVA_HOME` variable — no manual action needed at this step
5. Verify — open a **new** PowerShell window and run:
   ```powershell
   java -version
   # Expected output:
   # openjdk version "17.x.x" ...
   # OpenJDK Runtime Environment Temurin-17...
   ```

> ⚠️ **Important:** Do NOT download JDK 25 (the homepage default button) or JDK 21 — React Native's Gradle build system is only officially compatible with **JDK 17**.

---

### Step 2 — Install Android Studio Panda 3

Android Studio is **required** — but only as an SDK/ADB provider. You will still write all code in VS Code, Cursor, or Antigravity. Think of Android Studio as a background installation tool.

#### 2a. Download and Install

1. Go to **https://developer.android.com/studio**
2. Download **Android Studio Panda 3 (version 2025.3.3)** — current stable release as of April 2026
3. Run the installer and follow the **Setup Wizard**
4. During the Setup Wizard, make sure these boxes are **checked**:
   - ✅ `Android SDK`
   - ✅ `Android SDK Platform`
   - ✅ `Android Virtual Device`
   - ✅ `Performance (Intel HAXM)` *(if your CPU is Intel — skip if AMD/Ryzen)*
5. Click **Next → Finish** to complete the installation

#### 2b. Install Required SDK Components

After the installation wizard completes:

1. Open **Android Studio**
2. Click **"More Actions" → "SDK Manager"**
   *(or go to Settings → Languages & Frameworks → Android SDK)*

**In the "SDK Platforms" tab:**
- Tick **"Show Package Details"** in the bottom-right corner
- Find and expand **"Android 15 (VanillaIceCream)"**
- Check:
  - ✅ `Android SDK Platform 35`
  - ✅ `Intel x86 Atom_64 System Image` *(or Google APIs Intel x86 Atom System Image)*

**In the "SDK Tools" tab:**
- Tick **"Show Package Details"** in the bottom-right corner
- Expand **"Android SDK Build-Tools"** and check:
  - ✅ `36.0.0`
- Also check these standalone items:
  - ✅ `Android SDK Command-line Tools (latest)`
  - ✅ `Android SDK Platform-Tools` ← **this installs `adb`**
  - ✅ `Android Emulator` *(optional — only needed for virtual device testing)*

3. Click **"Apply" → "OK"** and wait for the download to complete

---

### Step 3 — Set Windows Environment Variables

This step is **mandatory**. React Native build tools need to find Java and the Android SDK on your PC.

1. Press **Windows + S** → search **"Edit the system environment variables"** → open it
2. Click **"Environment Variables..."** at the bottom
3. Under **"System variables"** (the lower panel), click **"New"** and add both of these:

   | Variable Name | Variable Value |
   |---|---|
   | `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot` *(check exact folder name at `C:\Program Files\Eclipse Adoptium\`)* |
   | `ANDROID_HOME` | `C:\Users\MohammedFazil-PC\AppData\Local\Android\Sdk` |

4. Find the **"Path"** variable in System variables → click **Edit** → click **New** → add each of these on a separate line:
   ```
   %JAVA_HOME%\bin
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   ```

5. Click **OK → OK → OK** to save
6. **Fully close and reopen PowerShell**, then verify all four commands print correctly:

```powershell
java -version
# openjdk version "17.x.x" ...

adb --version
# Android Debug Bridge version 1.x.x

echo $env:JAVA_HOME
# C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot

echo $env:ANDROID_HOME
# C:\Users\MohammedFazil-PC\AppData\Local\Android\Sdk
```

> 💡 **Can't find the exact JDK folder name?** Open `C:\Program Files\Eclipse Adoptium\` in File Explorer to see the exact folder name installed by Temurin.
>
> 💡 **`adb` still not found after restart?** Confirm the folder `C:\Users\MohammedFazil-PC\AppData\Local\Android\Sdk\platform-tools` actually exists. If it doesn't, re-check that "Android SDK Platform-Tools" was installed in the SDK Manager step above.

---

### ✅ Final Setup Checklist — All Verified

All commands confirmed working on this machine:

```powershell
node --version    # v24.13.1                              ✅
npm --version     # 11.12.1                               ✅
git --version     # git version 2.51.0.windows.1          ✅
java -version     # openjdk version "17.0.18" Temurin     ✅
adb --version     # Android Debug Bridge version 1.0.41   ✅
```

---

## ❓ Is Android Studio Required?

**Yes — but only as a background tool, not your code editor.**

| Tool | What it's for | Daily use? |
|---|---|---|
| **Android Studio** | Installs Android SDK + ADB. Set up once, then leave it. | ❌ No (setup only) |
| **VS Code / Cursor / Antigravity** | Where you write all your code | ✅ Yes |
| **PowerShell** | Running npm and build commands | ✅ Yes |

Once Android Studio is installed and environment variables are configured, you will **never need to open it again** during daily development. All code lives in your preferred editor, all commands run from PowerShell.

---

## 🛠 Tech Stack

### Current Phase (UI-Only)

| Category | Library | Purpose |
|---|---|---|
| **Framework** | React Native CLI 0.76+ | Native mobile app |
| **Language** | TypeScript (strict) | Type safety |
| **Navigation** | React Navigation v7 | Screen routing & deep links |
| **State** | Zustand | Global state (mock auth, cart) |
| **Styling** | Tailwind CSS v4 via **Uniwind** | Tailwind utility classes in React Native |
| **UI Library** | **HeroUI Native** (`heroui-native`) | Pre-built beautiful components built on Tailwind v4 |
| **Animation** | react-native-reanimated v4 | 60fps animations (also required by HeroUI Native) |
| **Gestures** | react-native-gesture-handler | Touch gestures (required by HeroUI Native) |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Storage** | react-native-mmkv | Fast cart persistence |
| **Images** | react-native-fast-image | Performant cached images |
| **Icons** | react-native-vector-icons | Material Design icons |
| **SVG** | react-native-svg | SVG support (required by HeroUI Native) |
| **Safe Area** | react-native-safe-area-context | Screen inset handling (required by HeroUI Native) |
| **Config** | react-native-config | `.env` environment variables |
| **Lint** | ESLint + Prettier + Husky | Code quality & git hooks |

> 💡 **NativeWind vs Uniwind:** HeroUI Native uses **Tailwind CSS v4 via Uniwind** — its own Tailwind adapter for React Native. Do NOT install NativeWind separately — it conflicts with Uniwind. Uniwind is set up as part of the HeroUI Native installation and gives you the same `className="..."` Tailwind syntax in all components.

### Added in Backend Phase (Later)

| Category | Library | When |
|---|---|---|
| **HTTP** | Axios + interceptors | When API URL is ready |
| **Server State** | TanStack React Query v5 | When API is being integrated |
| **Real-time** | Socket.IO Client | For live order tracking |
| **Maps** | react-native-maps | When Google Maps key available |
| **Payments** | react-native-razorpay | When Razorpay keys provided |
| **Push Notifications** | @react-native-firebase/messaging | When Firebase project is created |
| **OTP** | react-native-otp-verify | When backend OTP SMS is ready |

---

## 📁 Project Structure

```
JJsKitchen/
├── android/                        # Native Android project (auto-generated)
├── src/
│   ├── assets/                     # Local images, fonts
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/                 # Shared reusable UI components
│   │   ├── common/                 # Button, Input, Card, Badge, Modal, Loader
│   │   ├── menu/                   # MenuCard, CategoryPill, FilterBar, VegBadge
│   │   ├── cart/                   # CartItem, CartSummary, QuantityControl
│   │   ├── order/                  # OrderCard, StatusStepper
│   │   └── auth/                   # OtpInput, PhoneField
│   │
│   ├── features/                   # Feature modules (screens)
│   │   ├── auth/                   # Splash, Onboarding, Login, OTP
│   │   ├── home/                   # Home feed, banners, popular items
│   │   ├── menu/                   # Category browse, item detail, add-ons
│   │   ├── search/                 # Search & filters
│   │   ├── cart/                   # Cart management
│   │   ├── checkout/               # Address, coupon, payment selection
│   │   ├── orders/                 # Order history, order detail
│   │   ├── tracking/               # Order tracking status UI
│   │   ├── profile/                # Profile, addresses, settings
│   │   └── notifications/          # Notification center
│   │
│   ├── navigation/                 # React Navigation configuration
│   │   ├── RootNavigator.tsx       # Auth vs Main switch
│   │   ├── AuthNavigator.tsx       # Auth stack screens
│   │   ├── MainTabNavigator.tsx    # Bottom tab navigator
│   │   └── types.ts                # Navigation param types
│   │
│   ├── store/                      # Zustand global stores
│   │   ├── auth.store.ts           # Mock auth state
│   │   ├── cart.store.ts           # Cart state + MMKV persistence
│   │   └── ui.store.ts             # Global UI state (modals etc.)
│   │
│   ├── mock/                       # 🔶 Static mock data (replaced by API later)
│   │   ├── menu.mock.ts            # Sample menu items and categories
│   │   ├── orders.mock.ts          # Sample order history
│   │   └── user.mock.ts            # Sample user profile
│   │
│   ├── theme/                      # Design system tokens
│   │   ├── colors.ts               # Brand color palette
│   │   ├── typography.ts           # Font sizes, weights
│   │   ├── spacing.ts              # 4px-grid spacing
│   │   └── index.ts                # Single export
│   │
│   ├── types/                      # Global TypeScript types
│   │   ├── navigation.types.ts     # Screen params
│   │   └── models.types.ts         # User, Order, MenuItem, Cart
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── currency.ts             # Format INR amounts
│   │   ├── date.ts                 # Date formatting
│   │   └── validators.ts           # Zod schemas
│   │
│   └── constants/                  # App-wide constants
│       ├── routes.ts               # Screen name constants (enum)
│       └── config.ts               # App config (API URL placeholder)
│
├── .env                            # Development environment variables
├── .env.production                 # Production environment variables
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── babel.config.js
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```powershell
git clone https://github.com/your-org/jjs-kitchen-frontend.git
cd jjs-kitchen-frontend
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Create Your `.env` File
```powershell
copy .env.example .env
```
For now, leave the `.env` mostly empty — backend URLs will be added later.

### 4. Start Metro Bundler
Open a PowerShell terminal and run:
```powershell
npx react-native start
```
> Keep this terminal open. Metro is the development server that sends JavaScript to your device.

### 5. Run on Android
Open a **second PowerShell terminal** (keep the first one running) and run:
```powershell
npx react-native run-android
```
> This will build the Android app and install it on your connected device/emulator.

---

## 🔧 Environment Configuration

Create a `.env` file in the project root:

```env
# ========================================
# JJ's Kitchen - Environment Config
# ========================================

# API (fill in when backend is ready)
API_BASE_URL=
API_TIMEOUT=30000

# Google Maps (fill in when key is obtained)
GOOGLE_MAPS_API_KEY=

# Razorpay (fill in when keys are provided)
RAZORPAY_KEY_ID=

# Socket.IO (fill in when backend is ready)
SOCKET_URL=
```

> **⚠️ Never commit `.env` or `.env.production` to Git.** Already in `.gitignore`.

---

## 📱 Connecting Your Android Device

### Method 1: USB Cable — Best for Beginners ✅

1. **Enable Developer Options on your Android phone:**
   - Go to **Settings → About Phone** (or **About Device**)
   - Find **Build Number** (sometimes under Software Information)
   - **Tap it 7 times in a row**
   - You'll see a toast: "You are now a developer!"
   - Go back to main **Settings** — you'll see **"Developer Options"** now

2. **Enable USB Debugging:**
   - Open **Developer Options**
   - Enable the toggle at the top to turn developer options ON
   - Find **"USB Debugging"** and enable it

3. **Connect your phone:**
   - Connect your Android phone to your PC using a USB cable
   - On your phone: a dialog will appear — tap **"Allow"** to trust this computer
   - Check the "Always allow from this computer" box

4. **Verify connection in PowerShell:**
   ```powershell
   adb devices
   ```
   You should see something like:
   ```
   List of devices attached
   R5CT106XXXX    device
   ```
   If it shows `unauthorized` instead of `device`, re-check USB Debugging and accept the dialog on your phone again.

5. **Run the app:**
   ```powershell
   npx react-native run-android
   ```

---

### Method 2: Wireless ADB (Android 11 and above)

This lets you test without a cable after the first setup.

1. Enable **Wireless Debugging** in Developer Options
2. Tap **"Pair device with pairing code"**
3. In PowerShell:
   ```powershell
   # Replace with the IP:port shown in the Pair screen
   adb pair 192.168.x.x:PORT
   # Enter the 6-digit code shown on your phone
   ```
4. After pairing, connect:
   ```powershell
   adb connect 192.168.x.x:PORT
   adb devices
   # Should now show as "device"
   ```
5. Run the app:
   ```powershell
   npx react-native run-android
   ```

---

### Method 3: Android Emulator (Simulated Virtual Device)

Use this if you don't have a physical phone nearby.

1. Open **Android Studio**
2. Click **"More Actions"** → **Device Manager**
3. Click **"Create Device"**
4. Select **Pixel 7** → Next → Select **API 34** → Next → Finish
5. Click the ▶ Play button to start the emulator
6. Run:
   ```powershell
   npx react-native run-android
   ```

> ⚠️ The emulator is slow and uses a lot of RAM. A real phone via USB is always better for development.

---

## 🏗 Running on Android

### Development Mode (Debug)
```powershell
# Terminal 1 — Start Metro bundler (keep this running)
npx react-native start

# Terminal 2 — Build and run on device
npx react-native run-android
```

### Release Mode (for local APK testing)
```powershell
npx react-native run-android --mode=release
```

### In-App Developer Menu
When the app is running in debug mode on your device, you can access the developer menu by:
- **Shaking your phone** physically
- Or pressing **Ctrl+M** if using an emulator

---

## 📦 Building an Android APK

Use this to create a standalone `.apk` file to share with the client or install on any Android phone.

### Step 1 — Generate a Keystore (Only Once!)

A keystore is like a digital signature for your app. You only create this once.

Open PowerShell and run:
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore jjs-kitchen-release.keystore -alias jjs-kitchen -keyalg RSA -keysize 2048 -validity 10000
```

It will ask for:
- Keystore password (create a strong password, save it securely)
- Your name, organization, city, state, country (can be generic)

> **⚠️ Critical:** Save `jjs-kitchen-release.keystore` and the password somewhere extremely safe. If you lose it, you can never update the app on the Play Store. **Never commit this file to Git.**

---

### Step 2 — Configure Signing in the Project

Create a file at `android/app/keystore.properties`:
```properties
storeFile=../../jjs-kitchen-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=jjs-kitchen
keyPassword=YOUR_KEYSTORE_PASSWORD
```

Then open `android/app/build.gradle` and add signing config (the implementation will handle this).

---

### Step 3 — Build the Release APK

```powershell
cd android
.\gradlew assembleRelease
cd ..
```

> **Note on Windows:** Use `.\gradlew` (with dot-backslash), not `./gradlew`

Your APK will be at:
```
android\app\build\outputs\apk\release\app-release.apk
```

---

### Step 4 — Install APK on Device

```powershell
adb install android\app\build\outputs\apk\release\app-release.apk
```

Or simply copy the `.apk` file to your phone and open it to install manually.

---

## 🚀 Deploying to Play Store (AAB)

The Google Play Store requires **Android App Bundle (AAB)** format — not APK.

### Build AAB
```powershell
cd android
.\gradlew bundleRelease
cd ..
```

Output location:
```
android\app\build\outputs\bundle\release\app-release.aab
```

### Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → **JJ's Kitchen**
3. Go to **Production → Create new release**
4. Upload `app-release.aab`
5. Set version name and release notes
6. Submit for review

### Play Store Submission Checklist
- [ ] App icon — 512×512 PNG (no transparency)
- [ ] Feature graphic — 1024×500 PNG
- [ ] At least 4 screenshots (phone screenshots)
- [ ] Short description — max 80 characters
- [ ] Full description — max 4000 characters
- [ ] Privacy policy URL (required)
- [ ] Content rating questionnaire filled
- [ ] Target audience set
- [ ] Data safety form filled out

---

## 🏛 Architecture Overview

```
┌───────────────────────────────────────────────────┐
│                 React Native App                  │
│                                                   │
│  ┌──────────────┐      ┌────────────────────────┐ │
│  │   Screens    │◄────►│   Zustand Store        │ │
│  │ (features/)  │      │ (auth, cart, ui state) │ │
│  └──────┬───────┘      └────────────────────────┘ │
│         │                                         │
│  ┌──────▼───────┐      ┌────────────────────────┐ │
│  │  Mock Data   │      │  MMKV Storage          │ │
│  │ (src/mock/)  │      │  (cart persistence)    │ │
│  └──────────────┘      └────────────────────────┘ │
│                                                   │
│  ─ ─ ─ ─ ─ Backend Integration (Future) ─ ─ ─ ─  │
│                                                   │
│  ┌──────────────┐      ┌────────────────────────┐ │
│  │    Axios     │      │  Socket.IO             │ │
│  │  (API calls) │      │  (Real-time)           │ │
│  └──────┬───────┘      └──────────┬─────────────┘ │
└─────────┼────────────────────────┼───────────────┘
          │ HTTPS                  │ WSS
   ┌──────▼────────────────────────▼───────┐
   │         JJ's Kitchen API              │
   │     (Express + Node.js - In Prod)     │
   └───────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Reason |
|---|---|
| **Mock data first** | Build all UI without waiting for backend; easy to swap later |
| **Zustand over Redux** | Less boilerplate, simpler API, perfect for mobile scale |
| **MMKV over AsyncStorage** | 10–30x faster reads/writes, supports encryption |
| **Feature-based folders** | Scales better; each feature is self-contained |
| **Types defined upfront** | TypeScript models in `src/types/` match the API schema — ready for backend phase |

---

## 🔍 Code Quality & Git Hooks

### Linting & Formatting
```powershell
# Check for lint errors
npm run lint

# Auto-fix lint errors  
npm run lint -- --fix

# Format all files with Prettier
npm run format
```

### Pre-commit Hooks (Husky)
Runs automatically on every `git commit`:
- ESLint on staged files
- Prettier formatting check
- TypeScript type-check

### TypeScript Check
```powershell
npx tsc --noEmit
```

---

## 📂 Key npm Commands Reference

```powershell
# ─── Development ───────────────────────────────────────

# Start Metro bundler (keep running in background)
npx react-native start

# Run on Android device/emulator
npx react-native run-android

# Run in release mode locally
npx react-native run-android --mode=release

# Reset Metro cache (fixes stale JS issues)
npx react-native start --reset-cache


# ─── Building APK ──────────────────────────────────────

# Build debug APK
cd android && .\gradlew assembleDebug && cd ..

# Build release APK (requires keystore configured)
cd android && .\gradlew assembleRelease && cd ..

# Build Play Store AAB
cd android && .\gradlew bundleRelease && cd ..

# Clean Android build cache
cd android && .\gradlew clean && cd ..


# ─── Device ────────────────────────────────────────────

# List connected devices
adb devices

# Install APK on device
adb install android\app\build\outputs\apk\release\app-release.apk

# Restart ADB server (fixes "no devices" issues)
adb kill-server
adb start-server


# ─── Code Quality ──────────────────────────────────────

# Lint check
npm run lint

# TypeScript type check
npx tsc --noEmit

# Install new package
npm install <package-name>

# Install native package
npm install <package-name>
cd android && .\gradlew clean && cd ..
npx react-native run-android
```

---

## 🐛 Troubleshooting

### `SDK location not found` Error
Create `android/local.properties` file with:
```properties
sdk.dir=C:\\Users\\MohammedFazil-PC\\AppData\\Local\\Android\\Sdk
```

### `adb: command not found` / `adb is not recognized`
- Your `%ANDROID_HOME%\platform-tools` is not in PATH correctly
- Re-check **Step 4** of the PC setup section above
- Restart PowerShell after making changes

### `No devices found` when running `adb devices`
```powershell
adb kill-server
adb start-server
adb devices
```
If still empty — check:
- USB Debugging is ON on your phone
- You accepted the "Trust this computer" dialog on your phone
- Try a different USB cable (some cables are charge-only)

### Metro Bundler Cache Issues (app not updating)
```powershell
npx react-native start --reset-cache
```

### Gradle Build Failure
```powershell
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

### `java.lang.OutOfMemoryError` During Build
Edit `android/gradle.properties` and update:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Red Screen on Device (JS Error)
- Read the error message carefully — it tells you exactly what's wrong
- Press **R R** (twice) on emulator to reload
- Shake phone → **Reload**
- Or: `npx react-native start --reset-cache`

### `JAVA_HOME is not set` Error
- Make sure you added `JAVA_HOME` to System Environment Variables (not User variables)
- Restart PowerShell completely after setting it
- Verify: `echo $env:JAVA_HOME` should print the Java path

---

## 🔐 Security Notes

- Never commit `.env`, `.env.production`, or `*.keystore` files to Git
- These are already listed in `.gitignore` — don't manually remove them
- Store your keystore password in a password manager (1Password, Bitwarden, etc.)
- API keys and tokens go in `.env` files only — never hardcode in source files

---

## 📋 Android Version Support

| Minimum Android Version | API Level | Coverage (2026) |
|---|---|---|
| **Android 8.0 (Oreo)** ← *This project* | API 26 | ~95% of active devices |
| Android 7.0 (Nougat) | API 24 | ~97% of active devices |
| Android 10 | API 29 | ~85% of active devices |

**Chosen minimum: Android 8.0 (API 26)** — Professional industry standard that covers nearly all active Android users while enabling modern APIs and security features.

---

## 👨‍💻 Developed By

**Mohammed Fazil** — JJ's Kitchen Customer Mobile App
React Native CLI · TypeScript · Android

---

*Last updated: April 2026*
