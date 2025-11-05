// src/screens/ProviderScreen.tsx
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
} from "react-native";
import { observer } from "mobx-react-lite";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

import { Container } from "../../src/di/container";
import { Provider, NewProvider } from "../../src/domain/entities/Provider";

const ProviderScreen = observer(() => {
  const [vm, setVm] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const container = await Container.getInstance();
      setVm(container.providerViewModel);
      await container.providerViewModel.fetchProviders();
      setReady(true);
    })();
  }, []);

  if (!ready || !vm) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const saveProvider = async () => {
    if (!name.trim()) return Alert.alert("Validation", "Name is required");
    const provider: NewProvider = {
      name,
      selected: selected ? "true" : "false",
    };

    try {
      if (editingId) {
        await vm.updateProvider(editingId, provider);
        setEditingId(null);
      } else {
        await vm.addProvider(provider);
      }
      setName("");
      setSelected(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const startEdit = (p: Provider) => {
    setEditingId(p.id);
    setName(p.name);
    setSelected(p.selected === "true");
  };

  const deleteProvider = async (id: number) => {
    Alert.alert("Confirm", "Delete this provider?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => vm.deleteProvider(id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Provider }) => (
    <View style={styles.item}>
      <ThemedText>{item.name}</ThemedText>
      <ThemedText>Selected: {item.selected}</ThemedText>
      <View style={styles.buttons}>
        <Button title="Edit" onPress={() => startEdit(item)} />
        <Button
          title="Delete"
          color="red"
          onPress={() => deleteProvider(item.id)}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={vm.state.providers}
          keyExtractor={(i: Provider) => i.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="title" style={{ marginBottom: 8 }}>
                {editingId ? "Edit Provider" : "Add Provider"}
              </ThemedText>

              <TextInput
                placeholder="Provider Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <View style={styles.row}>
                <ThemedText>Selected</ThemedText>
                <Switch value={selected} onValueChange={setSelected} />
              </View>

              <Button
                title={editingId ? "Update" : "Add"}
                onPress={saveProvider}
              />

              {vm.state.loading && <ActivityIndicator style={{ margin: 10 }} />}
            </View>
          }
          ListHeaderComponentStyle={styles.centerHeader}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  centerHeader: {
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
    width: "100%",
    maxWidth: 400,
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
  buttons: { flexDirection: "row", gap: 8, marginTop: 8 },
});

export default ProviderScreen;
