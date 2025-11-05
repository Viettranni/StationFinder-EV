import { ChargeType, NewChargeType } from "../../../domain/entities/ChargeType";

export interface IChargeTypeDao {
  getAll(): Promise<ChargeType[]>;
  getById(id: number): Promise<ChargeType | null>;
  insert(chargeType: Partial<NewChargeType>): Promise<number>;
  update(
    id: number,
    chargeType: Partial<Omit<ChargeType, "id">>
  ): Promise<void>;
  delete(id: number): Promise<void>;
}
