import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// App ka primary color - active tab (icon + label) isi color mein dikhega
const ACTIVE_COLOR = "#2563eb";
const INACTIVE_COLOR = "#94a3b8";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Har screen apna khud ka header banayegi (design mein custom
        // header dikhaye gaye hain), isliye navigator ka default header hide.
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      {/* AI Insights abhi kisi bhi platform pe use nahi ho raha - tab bar
          se hata diya hai. href: null Expo Router mein tab ko bar se
          exclude karta hai (sirf <Tabs.Screen> hata dene se tab abhi bhi
          default title ke sath dikhta rehta, kyunki file-based routing
          ke through ai-insights.jsx route apne aap discover ho jaata hai).
          Wapas chalu karna ho to yeh options wala block hata dena. */}
      <Tabs.Screen
        name="ai-insights"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="headset" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
