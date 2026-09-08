import * as SecureStore from "expo-secure-store";
import { apiRequest } from "./client";
import { USE_MOCK_DATA } from "./config";

const NOTIFICATION_SETTINGS_KEY = "notificationSettings";

const DEFAULT_NOTIFICATION_SETTINGS = {
  dailyCheckInReminder: true,
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
