import { makeAutoObservable, runInAction } from "mobx";
import { IChargeTypeRepository } from "../../data/repositories/IChargeTypeRepository";
import { ChargeType, NewChargeType } from "../../domain/entities/ChargeType";

export interface ChargeTypeUIState {
  chargeTypes: ChargeType[];
  loading: boolean;
  error: string | null;
}

export class ChargeTypeViewModel {
  state: ChargeTypeUIState = {
    chargeTypes: [],
    loading: false,
    error: null,
  };

  constructor(private repo: IChargeTypeRepository) {
    makeAutoObservable(this);
  }

  /**
   * Validates and ensures unique `type` names.
   */
  private async validateChargeType(
    chargeType: NewChargeType,
    existingId?: number
  ) {
    if (!chargeType.type || !chargeType.type.trim()) {
      throw new Error("Charge type name is required");
    }

    if (chargeType.selected !== "true" && chargeType.selected !== "false") {
      throw new Error('Selected must be "true" or "false"');
    }

    // Ensure uniqueness (case-insensitive)
    const allChargeTypes = await this.repo.getAllChargeTypes();
    const duplicate = allChargeTypes.find(
      (ct) =>
        ct.type.trim().toLowerCase() === chargeType.type.trim().toLowerCase() &&
        ct.id !== existingId
    );

    if (duplicate) {
      throw new Error(
        `A charge type named "${chargeType.type}" already exists.`
      );
    }
  }

  async fetchChargeTypes() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const data = await this.repo.getAllChargeTypes();
      runInAction(() => {
        this.state.chargeTypes = data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to fetch charge types";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  async addChargeType(chargeType: NewChargeType) {
    try {
      await this.validateChargeType(chargeType);
      const id = await this.repo.addChargeType(chargeType);
      await this.fetchChargeTypes();
      return id;
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to add charge type";
      });
      throw err;
    }
  }

  async updateChargeType(id: number, chargeType: NewChargeType) {
    try {
      await this.validateChargeType(chargeType, id);
      await this.repo.updateChargeType(id, chargeType);
      await this.fetchChargeTypes();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to update charge type";
      });
      throw err;
    }
  }

  async deleteChargeType(id: number) {
    try {
      await this.repo.deleteChargeType(id);
      await this.fetchChargeTypes();
    } catch (err: any) {
      runInAction(() => {
        this.state.error = err.message || "Failed to delete charge type";
      });
      throw err;
    }
  }

  get uiState() {
    return { ...this.state };
  }
}
