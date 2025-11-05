import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import { Container } from "../../src/di/container";
import { Provider, NewProvider } from "../../src/domain/entities/Provider";
import {
  ChargeType,
  NewChargeType,
} from "../../src/domain/entities/ChargeType";

type CombinedItem = Provider | ChargeType;

const ExploreScreen = observer(() => {
  const [providerVm, setProviderVm] = useState<any>(null);
  const [chargeVm, setChargeVm] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const [mode, setMode] = useState<"provider" | "charge">("provider");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    (async () => {
      const container = await Container.getInstance();
      setProviderVm(container.providerViewModel);
      setChargeVm(container.chargeTypeViewModel);
      await Promise.all([
        container.providerViewModel.fetchProviders(),
        container.chargeTypeViewModel.fetchChargeTypes(),
      ]);
      setReady(true);
    })();
  }, []);

  if (!ready || !providerVm || !chargeVm) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const currentVm = mode === "provider" ? providerVm : chargeVm;
  const items =
    mode === "provider"
      ? providerVm.state.providers
      : chargeVm.state.chargeTypes;

  const saveItem = async () => {
    if (!name.trim()) return Alert.alert("Validation", "Name is required");
    try {
      if (mode === "provider") {
        const provider: NewProvider = {
          name,
          selected: selected ? "true" : "false",
        };
        if (editingId) await providerVm.updateProvider(editingId, provider);
        else await providerVm.addProvider(provider);
      } else {
        const chargeType: NewChargeType = {
          type: name,
          selected: selected ? "true" : "false",
        };
        if (editingId) await chargeVm.updateChargeType(editingId, chargeType);
        else await chargeVm.addChargeType(chargeType);
      }
      setName("");
      setSelected(false);
      setEditingId(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const startEdit = (item: CombinedItem) => {
    setEditingId(item.id);
    if ("name" in item) setName(item.name);
    else setName(item.type);
    setSelected(item.selected === "true");
  };

  const deleteItem = async (id: number) => {
    Alert.alert("Confirm", "Delete this item?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () =>
          mode === "provider"
            ? await providerVm.deleteProvider(id)
            : await chargeVm.deleteChargeType(id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: CombinedItem }) => {
    const label = "name" in item ? item.name : item.type;
    return (
      <View style={styles.item}>
        <ThemedText style={styles.itemTitle}>{label}</ThemedText>
        <ThemedText>Selected: {item.selected}</ThemedText>
        <View style={styles.buttons}>
          <Button title="Edit" onPress={() => startEdit(item)} />
          <Button
            title="Delete"
            color="red"
            onPress={() => deleteItem(item.id)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.container}>
            <View style={styles.modeSwitch}>
              <Button
                title="Providers"
                onPress={() => setMode("provider")}
                color={mode === "provider" ? "#007AFF" : undefined}
              />
              <Button
                title="Charge Types"
                onPress={() => setMode("charge")}
                color={mode === "charge" ? "#007AFF" : undefined}
              />
            </View>

            <ThemedText type="title" style={styles.headerTitle}>
              {editingId
                ? mode === "provider"
                  ? "Edit Provider"
                  : "Edit Charge Type"
                : mode === "provider"
                ? "Add Provider"
                : "Add Charge Type"}
            </ThemedText>

            <TextInput
              placeholder={
                mode === "provider" ? "Provider Name" : "Charge Type"
              }
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <ThemedText>Selected</ThemedText>
              <Switch value={selected} onValueChange={setSelected} />
            </View>

            <Button title={editingId ? "Update" : "Add"} onPress={saveItem} />

            {currentVm.state.loading && (
              <ActivityIndicator style={{ marginTop: 10 }} />
            )}

            <FlatList
              data={items}
              keyExtractor={(i: CombinedItem) => i.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: 60, // pushes content down to make top buttons tappable
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    justifyContent: "flex-start",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modeSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
    width: "100%",
    maxWidth: 400,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
    marginVertical: 8,
  },
  item: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    justifyContent: "space-between",
  },
  listContainer: {
    alignItems: "center",
    paddingBottom: 50,
  },
});

export default ExploreScreen;
