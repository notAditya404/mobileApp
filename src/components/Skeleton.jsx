import { useEffect, useRef } from "react";
import { Animated } from "react-native";

// Generic pulsing placeholder block - har screen ke skeleton loading
// layouts isi ek component se bante hain (bas size/shape alag hoti hai)
export function Skeleton({ className, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-slate-200 rounded-lg ${className ?? ""}`}
      style={[{ opacity }, style]}
    />
  );
}
