import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const NOTIFICATION_SETTINGS_KEY = "notificationSettings";
const PRIVACY_SETTINGS_KEY = "privacySettings";

const DEFAULT_NOTIFICATION_SETTINGS = {
  dailyCheckInReminder: true,
  supportRequestUpdates: true,
  wellnessInsights: true,
  generalAnnouncements: false,
};

// consent_settings table se match karta hai - kaunsa data type share karna hai
const DEFAULT_PRIVACY_SETTINGS = {
  location: true,
  wearableData: false,
  hrData: true,
};

// Backend endpoint (jab ready ho): GET /personnel/me/notification-settings
export async function getNotificationSettings() {
  if (USE_MOCK_DATA) {
    const stored = await SecureStore.getItemAsync(NOTIFICATION_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_SETTINGS;
  }
  return apiRequest("/personnel/me/notification-settings");
}

// Backend endpoint (jab ready ho): PUT /personnel/me/notification-settings
export async function updateNotificationSettings(settings) {
  if (USE_MOCK_DATA) {
    await SecureStore.setItemAsync(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    return { success: true };
  }
  return apiRequest("/personnel/me/notification-settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

// Backend endpoint (jab ready ho): GET /personnel/me/privacy-settings
export async function getPrivacySettings() {
  if (USE_MOCK_DATA) {
    const stored = await SecureStore.getItemAsync(PRIVACY_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PRIVACY_SETTINGS;
  }
  return apiRequest("/personnel/me/privacy-settings");
}

// Backend endpoint (jab ready ho): PUT /personnel/me/privacy-settings
// Body shape maps directly to the consent_settings table (per data_type)
export async function updatePrivacySettings(settings) {
  if (USE_MOCK_DATA) {
    await SecureStore.setItemAsync(PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
    return { success: true };
  }
  return apiRequest("/personnel/me/privacy-settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
