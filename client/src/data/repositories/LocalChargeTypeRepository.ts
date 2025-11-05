import { IChargeTypeRepository } from "./IChargeTypeRepository";
import { IChargeTypeDao } from "../local/dao/IChargeTypeDao";
import { ChargeType, NewChargeType } from "../../domain/entities/ChargeType";

export class LocalChargeTypeRepository implements IChargeTypeRepository {
  constructor(private readonly dao: IChargeTypeDao) {}

  getAllChargeTypes(): Promise<ChargeType[]> {
    return this.dao.getAll();
  }

  getChargeTypeById(id: number): Promise<ChargeType | null> {
    return this.dao.getById(id);
  }

  addChargeType(chargeType: Partial<NewChargeType>): Promise<number> {
    return this.dao.insert(chargeType);
  }

  updateChargeType(
    id: number,
    chargeType: Partial<Omit<ChargeType, "id">>
  ): Promise<void> {
    return this.dao.update(id, chargeType);
  }

  deleteChargeType(id: number): Promise<void> {
    return this.dao.delete(id);
  }
}
