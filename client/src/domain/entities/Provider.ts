export interface Provider {
  id: number;
  name: string;
  selected: string; // "true" | "false"
}

export type NewProvider = Omit<Provider, "id">;

export function createProvider(partial: Partial<NewProvider>): NewProvider {
  if (!partial.name) {
    throw new Error("Provider name is required");
  }

  return {
    name: partial.name,
    selected: partial.selected ?? "false",
  };
}
