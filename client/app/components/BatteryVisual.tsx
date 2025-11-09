import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Zap } from "lucide-react-native";

interface BatteryVisualProps {
  percentage: number;
  isDark: boolean;
}

const BatteryVisual: React.FC<BatteryVisualProps> = ({
  percentage,
  isDark,
}) => {
  const getColor = (percent: number) => {
    if (percent >= 80) return "#10B981";
    if (percent >= 50) return "#22C55E";
    if (percent >= 20) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(percentage);
  const backgroundCircle = isDark ? "#374151" : "#E5E7EB";

  const radius = 120;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Dynamic circle size for proper centering
  const circleSize = radius + strokeWidth;

  return (
    <View style={styles.batteryContainer}>
      <Svg
        width={2 * circleSize}
        height={2 * circleSize}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={circleSize}
          cy={circleSize}
          r={radius}
          stroke={backgroundCircle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={circleSize}
          cy={circleSize}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>

      <View
        style={[
          styles.batteryCenter,
          {
            width: 2 * circleSize,
            height: 2 * circleSize,
            transform: [
              { translateX: -circleSize },
              { translateY: -circleSize },
            ],
          },
        ]}
      >
        <Zap size={48} color={color} fill={color} style={{ marginBottom: 8 }} />
        <Text style={[styles.batteryText, { color }]}>{percentage}%</Text>
        <Text
          style={[
            styles.batteryLabel,
            { color: isDark ? "#D1D5DB" : "#6B7280" },
          ]}
        >
          Battery Level
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  batteryContainer: { alignItems: "center", marginVertical: 32 },
  batteryCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  batteryText: { fontSize: 48, fontWeight: "bold" },
  batteryLabel: { fontSize: 16, marginTop: 4 },
});

export default BatteryVisual;
