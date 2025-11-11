import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface BatterySliderProps {
  value: number;
  onChange: (value: number) => void;
  isDark: boolean;
}

const BatterySlider: React.FC<BatterySliderProps> = ({
  value,
  onChange,
  isDark,
}) => {
  const getColor = (percent: number) => {
    if (percent >= 80) return "#10B981";
    if (percent >= 50) return "#22C55E";
    if (percent >= 20) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(value);
  const trackColor = isDark ? "#4B5563" : "#E5E7EB";

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      <Slider
        minimumValue={0}
        maximumValue={100}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={trackColor}
        thumbTintColor={color}
        step={1}
        style={{ width: "100%", height: 40 }}
      />
      <View style={styles.sliderLabels}>
        <Text
          style={[
            styles.sliderLabel,
            { color: isDark ? "#D1D5DB" : "#6B7280" },
          ]}
        >
          0%
        </Text>
        <Text
          style={[
            styles.sliderLabel,
            { color: isDark ? "#D1D5DB" : "#6B7280" },
          ]}
        >
          50%
        </Text>
        <Text
          style={[
            styles.sliderLabel,
            { color: isDark ? "#D1D5DB" : "#6B7280" },
          ]}
        >
          100%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabel: { fontSize: 14 },
});

export default BatterySlider;
