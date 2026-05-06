# JJ's Kitchen – React Native CLI Frontend Implementation Plan

## Overview

This plan covers the complete setup and development strategy for the **JJ's Kitchen Customer Mobile App** using **React Native CLI** (not Expo). The app targets **Android first**, with iOS as a future phase.

**Current Focus: UI-First Development** — We are building all screens and UI components with static/mock data first. Backend API integration will be done incrementally in a later phase once the backend developer provides the API details. This approach lets us move fast, build the entire interface, and plug in real data when ready.

---

## Confirmed Decisions

| Decision | Value |
|---|---|
| **Framework** | React Native CLI |
| **Package Manager** | npm |
| **Platform** | Android first, iOS later |
| **API Integration** | Deferred — UI-only phase now |
| **Firebase** | New project (create when push notifications needed) |
| **Google Maps** | Deferred — no key yet, integrate in backend phase |
| **Razorpay** | Deferred — integrate in backend phase |
| **App Name** | JJ's Kitchen |
| **Bundle ID** | `com.jjskitchen.app` |
| **Min Android Version** | **API 26 (Android 8.0)** — covers ~95% of active Android devices (2026), recommended best practice |

---

## Proposed Tech Stack

### Core Libraries (Install in Phase 1)

| Category | Technology | Reason |
|---|---|---|
| **Framework** | React Native CLI (0.76+) | Full native control, no Expo restrictions |
| **Language** | TypeScript (strict) | Type-safety, IntelliSense, fewer runtime bugs |
| **Navigation** | React Navigation v7 | Industry standard, supports deep linking |
| **State Management** | Zustand | Lightweight, no boilerplate, great for mobile |
| **Styling** | Tailwind CSS v4 via **Uniwind** | Tailwind in React Native (required by HeroUI Native) |
| **UI Library** | **HeroUI Native** (`heroui-native`) | Beautiful pre-built components, built on Tailwind v4 |
| **Animation** | react-native-reanimated v4 | 60fps animations + required peer dep of HeroUI Native |
| **Gestures** | react-native-gesture-handler | Touch gestures + required peer dep of HeroUI Native |
| **Forms** | React Hook Form + Zod | Typed form validation |
| **Images** | react-native-fast-image | Performant cached image loading |
| **Icons** | react-native-vector-icons | Scalable icon set (MaterialDesignIcons) |
| **Storage** | react-native-mmkv | Fast key-value storage (cart persistence) |
| **SVG** | react-native-svg | SVG support (required peer dep of HeroUI Native) |
| **Safe Area** | react-native-safe-area-context | Screen insets (required peer dep of HeroUI Native) |
| **Code Quality** | ESLint + Prettier + Husky | Consistent code style, pre-commit hooks |
| **Build** | Gradle (local) | Android APK/AAB generation |
| **Environment** | react-native-config | `.env` per environment (dev/staging/prod) |

> **Important — NativeWind vs Uniwind:**
> HeroUI Native uses **Tailwind CSS v4 via Uniwind** (its own Tailwind adapter for React Native) — NOT NativeWind.
> Do NOT install NativeWind alongside HeroUI Native as they conflict. Uniwind is automatically handled as part of the HeroUI Native setup and gives you full `className="..."` Tailwind support in all components.

### HeroUI Native Required Peer Dependencies
```
heroui-native
react-native-reanimated@^4.1.1
react-native-gesture-handler@^2.28.0
react-native-worklets@^0.5.1
react-native-safe-area-context@^5.6.0
react-native-svg@^15.12.1
tailwind-variants@^3.2.2
tailwind-merge@^3.4.0
```

### Libraries to Add Later (Backend Phase)
| Category | Technology | When |
|---|---|---|
| **HTTP Client** | Axios + interceptors | Backend integration phase |
| **Server State** | TanStack React Query v5 | Backend integration phase |
| **Real-time** | Socket.IO Client | Order tracking phase |
| **Maps** | react-native-maps | When Google Maps key available |
| **Payments** | react-native-razorpay | When Razorpay keys provided |
| **Notifications** | @react-native-firebase/messaging | When Firebase project created |
| **OTP** | react-native-otp-verify | When backend OTP API ready |

---

## Feature-Based Project Structure

```
JJsKitchen/
├── android/                        # Native Android project (auto-generated)
├── ios/                            # Native iOS project (future)
├── src/
│   ├── assets/                     # Images, fonts, icons (local)
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── common/                 # Button, Input, Card, Badge, Modal, Loader
│   │   ├── menu/                   # MenuCard, CategoryPill, FilterBar, VegBadge
│   │   ├── cart/                   # CartItem, CartSummary, QuantityControl
│   │   ├── order/                  # OrderCard, StatusStepper
│   │   └── auth/                   # OtpInput, PhoneField
│   │
│   ├── features/                   # Feature modules (screens only, no API calls yet)
│   │   ├── auth/                   # Splash, Onboarding, Login, OTP
│   │   ├── home/                   # Home feed, banners, popular items
│   │   ├── menu/                   # Category browse, item detail, add-ons
│   │   ├── search/                 # Search & filters
│   │   ├── cart/                   # Cart management
│   │   ├── checkout/               # Address, coupon, payment method selection
│   │   ├── orders/                 # Order history, order detail
│   │   ├── tracking/               # Order tracking (status stepper UI)
│   │   ├── profile/                # Profile, saved addresses, settings
│   │   └── notifications/          # Notification center (UI only)
│   │
│   ├── navigation/                 # React Navigation setup
│   │   ├── RootNavigator.tsx       # Auth vs Main switch (mock state for now)
│   │   ├── AuthNavigator.tsx       # Auth stack screens
│   │   ├── MainTabNavigator.tsx    # Bottom tab navigator
│   │   └── types.ts                # Navigation param types
│   │
│   ├── store/                      # Zustand global stores
│   │   ├── auth.store.ts           # Auth state (mock login for now)
│   │   ├── cart.store.ts           # Cart state + MMKV persistence
│   │   └── ui.store.ts             # Global UI state (modals, toasts)
│   │
│   ├── mock/                       # Static mock data (used until backend ready)
│   │   ├── menu.mock.ts            # Sample menu items and categories
│   │   ├── orders.mock.ts          # Sample order history
│   │   └── user.mock.ts            # Sample user profile
│   │
│   ├── theme/                      # Design system tokens
│   │   ├── colors.ts               # Brand color palette
│   │   ├── typography.ts           # Font sizes, weights, line heights
│   │   ├── spacing.ts              # 4px-grid spacing constants
│   │   └── index.ts                # Single export
│   │
│   ├── types/                      # Global TypeScript types
│   │   ├── navigation.types.ts     # Screen params
│   │   └── models.types.ts         # User, Order, MenuItem, Cart etc.
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── currency.ts             # Format INR amounts
│   │   ├── date.ts                 # Date formatting helpers
│   │   └── validators.ts           # Zod validation schemas
│   │
│   └── constants/                  # App-wide constants
│       ├── routes.ts               # Screen name constants (enum)
│       └── config.ts               # App config (placeholders for API URL etc.)
│
├── .env                            # Development env vars (mostly empty for now)
├── .env.production                 # Production env vars
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── babel.config.js
└── package.json
```

---

## Implementation Phases

### Phase 1 – PC Setup & Project Bootstrap

#### Step 1: Install Required Tools on Your PC

**✅ All prerequisites installed and verified on this machine:**

| Tool | Verified Version | Status |
|---|---|---|
| Node.js | v24.13.1 | ✅ Done |
| npm | v11.12.1 | ✅ Done |
| Git | v2.51.0.windows.1 | ✅ Done |
| Java JDK 17 | OpenJDK 17.0.18 (Temurin-17.0.18+8) | ✅ Done |
| JAVA_HOME | `D:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot` | ✅ Set |
| Android Studio | Panda 3 (2025.3.3) | ✅ Done |
| ANDROID_HOME | `C:\Users\MohammedFazil-PC\AppData\Local\Android\Sdk` | ✅ Set |
| ADB | Version 1.0.41 (37.0.0-14910828) | ✅ Working |

**The machine is fully ready for React Native development. Proceed to Step 2.**

> For any new developer joining this project, see `README.md` for the complete step-by-step installation guide including exact SDK versions and environment variable configuration.


#### Step 2: Project Initialization
- `npx @react-native-community/cli@latest init JJsKitchen`
- Set Bundle ID to `com.jjskitchen.app` in `android/app/build.gradle`
- Configure TypeScript strict mode in `tsconfig.json`
- Set up path alias (`@/` → `src/`) in babel + tsconfig
- Set up ESLint, Prettier, Husky pre-commit hooks
- Set up `react-native-config` for `.env` files
- Set minimum Android SDK to **26** in `android/app/build.gradle`

#### Step 3: Design System & UI Setup (`src/theme/` + HeroUI Native)
- Install **HeroUI Native** (`heroui-native`) and all required peer dependencies:
  ```
  npm install heroui-native
  npm install react-native-reanimated@^4.1.1 react-native-gesture-handler@^2.28.0 react-native-worklets@^0.5.1 react-native-safe-area-context@^5.6.0 react-native-svg@^15.12.1 tailwind-variants@^3.2.2 tailwind-merge@^3.4.0
  ```
- Set up **Uniwind** per official guide: https://docs.uniwind.dev/quickstart
- Configure `global.css` with Tailwind + Uniwind + HeroUI imports
- Wrap `App.tsx` with `<GestureHandlerRootView>` and `<HeroUINativeProvider>`
- Define custom brand tokens in `global.css` using Tailwind CSS v4 `@theme` block:
  - Primary: warm orange `#FF6B35`, Accent: deep red `#C1292E`
  - Custom spacing scale and font sizes
- Create `src/theme/index.ts` for any additional non-Tailwind constants (shadows etc.)

#### Step 4: Navigation Setup (`src/navigation/`)
- `RootNavigator`: switches between Auth and Main using Zustand mock state
- `AuthNavigator`: Stack — Splash → Onboarding → Login → OTP Verify
- `MainTabNavigator`: Bottom Tab — Home | Menu | Orders | Profile
- Nested stacks inside tabs for detail screens

---

### Phase 2 – Auth Screens (UI Only)

- **Screens:** Splash Screen, Onboarding (3 slides), Login (phone number input), OTP Verification
- **State:** Zustand `auth.store.ts` — mock `isAuthenticated = true` flag to bypass login during development
- **No real OTP/API** — just UI, navigation, and form validation
- **Animations:** Smooth entry animations using Reanimated v3

---

### Phase 3 – Home & Menu Screens (UI Only)

- **Screens:** Home, Category Menu, Item Detail, Search & Filter
- **Data:** All from `src/mock/menu.mock.ts` — no API call
- **Components:** `CategoryPill`, `MenuCard`, `FilterBar`, `VegNonVegBadge`, `AddOnSheet` (bottom sheet)
- **Features:** Category horizontal scroll, popular items grid, search bar UI, veg/non-veg filter toggle

---

### Phase 4 – Cart & Checkout (UI Only)

- **Cart:** Zustand store + MMKV persistence — quantity controls, item removal, total calculation
- **Screens:** Cart Summary, Checkout (address form, coupon input field, payment method selector)
- **Billing UI:** Itemised breakdown — item total + GST + delivery fee + convenience fee
- **Payment UI:** Selection cards for UPI, Card, Wallet, COD — no real payment, just selection UI
- **Address UI:** Manual address input form + saved address list (mock data)

---

### Phase 5 – Orders & Tracking (UI Only)

- **Screens:** Order History list, Order Detail, Order Tracking
- **Data:** From `src/mock/orders.mock.ts`
- **Status Stepper:** Visual step progress — Placed → Preparing → Ready → Picked → Delivered
- **Tracking Screen:** Static map placeholder UI with rider info card (map integration comes in backend phase)
- **ETA:** Static display for now

---

### Phase 6 – Profile & Reviews (UI Only)

- **Profile Screen:** Avatar, name, phone, email display
- **Saved Addresses:** List with add/edit/delete UI
- **Order History:** Reusable from Phase 5 with reorder button (UI only)
- **Reviews:** Star rating component + comment form
- **Settings:** Notification toggle (UI only), logout button

---

### Phase 7 – Polish & Android APK Build

- Final UI/UX review — spacing, typography, transitions
- Dark mode groundwork (future)
- Splash screen + app icon setup for Android
- Generate a **debug APK** for real device testing
- Generate a **release APK** (signed) for sharing with client/stakeholder

---

### Phase 8 – Backend Integration (ACTIVE)
- [x] Set up Axios client with base URL + interceptors
- [ ] Implement Token management (MMKV storage)
- [ ] Replace mock data with real API calls using React Query
- [ ] Connect auth flow to real OTP API
- [ ] Add Socket.IO for real-time order status
- [ ] Integrate Google Maps for live rider tracking
- [ ] Integrate Razorpay for real payments
- [ ] Set up Firebase FCM for push notifications

**API Architecture Best Practices:**
1. **Axios Instance**: Centralized configuration for base URL, timeout, and headers.
2. **Interceptors**: Request interceptors for attaching Auth tokens; Response interceptors for global error handling and token refresh.
3. **Endpoints Registry**: Centralized file for all API routes to avoid hardcoded strings.
4. **Service Layer**: Feature-specific service files (e.g., `auth.service.ts`) to encapsulate API logic.
5. **Type Safety**: Request/Response types for every endpoint using TypeScript interfaces.
6. **Error Handling**: Standardized error response parsing.

---

## Verification Plan

### Phase 1–7 (UI Phase)
- Run app on physical Android device via USB
- Test all navigation flows manually
- Test cart persistence across app restarts (MMKV)
- Build a debug APK and install on device for stakeholder review

### Phase 8 (Backend Phase)
- End-to-end order flow testing with real API
- Socket.IO tracking test with backend developer
- Payment test in Razorpay test mode
- FCM push notification test on killed app state
