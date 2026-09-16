/// <reference types="uniwind/types" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    APP_ENV?: 'development' | 'staging' | 'production';
    APP_NAME?: string;
    APP_VERSION?: string;
    API_URL?: string;
    API_TIMEOUT?: string;
    SOCKET_URL?: string;
    GOOGLE_MAPS_API_KEY?: string;
    PAYMENT_GATEWAY_PROVIDER?: 'RAZORPAY' | 'STRIPE' | 'CASH_ON_DELIVERY';
    RAZORPAY_KEY_ID?: string;
    SENTRY_DSN?: string;
    ENABLE_ANALYTICS?: string;
    SUPPORT_PHONE?: string;
    SUPPORT_EMAIL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
