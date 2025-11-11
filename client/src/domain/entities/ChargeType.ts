export interface ChargeType {
  id: number;
  type: string;
  selected: string; // "true" | "false"
}

export type NewChargeType = Omit<ChargeType, "id">;

export function createChargeType(
  partial: Partial<NewChargeType>
): NewChargeType {
  if (!partial.type) {
    throw new Error("Charge type is required");
  }

  return {
    type: partial.type,
    selected: partial.selected ?? "false",
  };
}
