import { ChargeType, NewChargeType } from "../../domain/entities/ChargeType";

export interface IChargeTypeRepository {
  getAllChargeTypes(): Promise<ChargeType[]>;
  getChargeTypeById(id: number): Promise<ChargeType | null>;
  addChargeType(chargeType: Partial<NewChargeType>): Promise<number>;
  updateChargeType(
    id: number,
    chargeType: Partial<Omit<ChargeType, "id">>
  ): Promise<void>;
  deleteChargeType(id: number): Promise<void>;
}
