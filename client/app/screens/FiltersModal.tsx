import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plug } from "lucide-react-native";

export type PlugOption = {
  value: string;
  label: string;
  description?: string;
};

export type FilterState = {
  plugs: string[];
  showOnlyAvailable: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
  plugOptions: PlugOption[];
};

const FiltersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialFilters,
  onApply,
  plugOptions,
}) => {
  const [local, setLocal] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) setLocal(initialFilters);
  }, [isOpen, initialFilters]);

  const cols = useMemo(() => (plugOptions.length <= 4 ? 2 : 3), [plugOptions.length]);
  const tileWidth = cols === 2 ? "48%" : "31.5%";

  const togglePlug = (value: string) => {
    setLocal((prev) => {
      const exists = prev.plugs.includes(value);
      return { ...prev, plugs: exists ? prev.plugs.filter((p) => p !== value) : [...prev.plugs, value] };
    });
  };

  const reset = () => setLocal(initialFilters);
  const apply = () => {
    onApply(local);
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <SafeAreaView edges={["bottom"]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.headerBtn}>
              <Text style={styles.linkText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Map settings</Text>
            <Pressable onPress={reset} hitSlop={12} style={styles.headerBtn}>
              <Text style={styles.linkText}>Reset</Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: "80%" }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plugs */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Plugs</Text>

              <View style={styles.tileWrap}>
                {plugOptions.map((opt) => {
                  const selected = local.plugs.includes(opt.value);
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => togglePlug(opt.value)}
                      style={[
                        styles.tile,
                        { width: tileWidth },
                        selected ? styles.tileSelected : styles.tileDefault,
                      ]}
                    >
                      {selected && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>✓</Text>
                        </View>
                      )}

                      <View style={[styles.iconCircle, selected ? styles.iconCircleSel : styles.iconCircleDef]}>
                        <Plug size={24} color={selected ? "#FFFFFF" : "#6B7280"} />
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[styles.tileLabel, selected && styles.tileLabelSel]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Availability */}
            <View style={{ marginTop: 20 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Show only available</Text>
                <Switch
                  value={local.showOnlyAvailable}
                  onValueChange={(v) => setLocal((p) => ({ ...p, showOnlyAvailable: v }))}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.primaryBtn} onPress={apply}>
              <Text style={styles.primaryText}>Apply</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FiltersModal;

/* styles */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: { padding: 4, minWidth: 60, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  linkText: { color: "#059669", fontWeight: "600" },

  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },

  tileWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    height: 116,
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tileDefault: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  tileSelected: {
    borderColor: "#34D399",
    backgroundColor: "rgba(52,211,153,0.08)",
    shadowColor: "#10B981",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleDef: { backgroundColor: "#F3F4F6" },
  iconCircleSel: { backgroundColor: "#10B981" },
  tileLabel: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  tileLabelSel: { color: "#111827" },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
