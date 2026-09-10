import { View, Text } from "react-native";

// High/Moderate/Low risk pill - shown wherever a screen displays a
// personnel's risk level (Home, Wellness). Works the same whether the
// score came from the real ML model or (until it's connected) the
// heuristic engine - both send back the same High/Moderate/Low vocabulary.
const RISK_COLORS = { High: "#dc2626", Moderate: "#d97706", Low: "#16a34a" };

export function RiskBadge({ level }) {
  if (!level) return null;
  const color = RISK_COLORS[level] ?? "#64748b";
  return (
    <View
      className="self-start rounded-full px-2.5 py-1 mt-2"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Text className="text-xs font-semibold" style={{ color }}>
        {level} Risk
      </Text>
    </View>
  );
}
