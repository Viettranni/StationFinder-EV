import { makeAutoObservable, runInAction } from "mobx";
import { IChargingStationRepository } from "../../data/repositories/IChargingStationRepository";
import { RemoteChargingStationRepository } from "../../data/repositories/RemoteChargingStationRepository";
import { IChargeTypeRepository } from "../../data/repositories/IChargeTypeRepository";
import { ResponseChargingStation } from "../../data/local/dao/ResponseChargingStation";
import {
  ChargingStation,
  NewChargingStation,
} from "../../domain/entities/ChargingStation";

export interface ChargingStationUIState {
  availableStations: ResponseChargingStation[];
  filteredStations: ResponseChargingStation[];
  selectedStation: ResponseChargingStation | null;
  savedStation: ChargingStation | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedStatus: string;
  selectedConnectors: string[];
}

export class ChargingStationViewModel {
  private state: ChargingStationUIState = {
    availableStations: [],
    filteredStations: [],
    selectedStation: null,
    savedStation: null,
    loading: false,
    error: null,
    searchQuery: "",
    selectedStatus: "all",
    selectedConnectors: [],
  };

  constructor(
    private readonly localRepo: IChargingStationRepository,
    private readonly remoteRepo: RemoteChargingStationRepository,
    private readonly chargeTypeRepo: IChargeTypeRepository // repository to save connectors
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ======================== UTIL ========================
  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private formatConnectorName(type: string) {
    switch (type.toLowerCase()) {
      case "ccs":
        return "CCS";
      case "chademo":
        return "CHAdeMO";
      case "type2":
        return "Type 2";
      default:
        return this.capitalize(type);
    }
  }

  // ======================== COMPUTED ========================
  get statuses() {
    const uniqueStatuses = Array.from(
      new Set(
        this.state.availableStations
          .map((s) => s.statusType?.toLowerCase().trim())
          .filter((s): s is string => !!s && s.length > 0)
      )
    ).sort();

    return [
      { id: "all", name: "All" },
      ...uniqueStatuses.map((s) => ({ id: s, name: this.capitalize(s) })),
    ];
  }

  get connectorTypes() {
    const connectors = new Set<string>();

    this.state.availableStations.forEach((s) => {
      if (s.amountCCS > 0) connectors.add("ccs");
      if (s.amountCHAdeMO > 0) connectors.add("chademo");
      if (s.amountType2 > 0) connectors.add("type2");
    });

    const list = Array.from(connectors).sort();

    return [
      { id: "all", name: "All" },
      ...list.map((c) => ({ id: c, name: this.formatConnectorName(c) })),
    ];
  }

  // ======================== REMOTE FETCH ========================
  async fetchAvailableStations() {
    runInAction(() => {
      this.state.loading = true;
      this.state.error = null;
    });

    try {
      const data = await this.remoteRepo.getAllStations();
      runInAction(() => {
        this.state.availableStations = data;
        this.state.filteredStations = data;
      });
    } catch (err) {
      runInAction(() => {
        this.state.error =
          err instanceof Error ? err.message : "Failed to fetch stations";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  async fetchSavedStation() {
    runInAction(() => {
      this.state.loading = true;
      this.state.error = null;
    });

    try {
      const stations = await this.localRepo.getAllStations();
      const parsedStations = stations.map((s) => ({
        ...s,
        photos: s.photos ? JSON.parse(s.photos) : [],
        comments: s.comments ? JSON.parse(s.comments) : [],
      }));

      runInAction(() => {
        this.state.savedStation = parsedStations[0] ?? null;
      });
    } catch (err) {
      runInAction(() => {
        this.state.error =
          err instanceof Error ? err.message : "Failed to fetch saved station";
      });
    } finally {
      runInAction(() => {
        this.state.loading = false;
      });
    }
  }

  async fetchSavedConnectors() {
    const saved = await this.chargeTypeRepo.getAllChargeTypes();
    runInAction(() => {
      this.state.selectedConnectors = saved.map((c) => c.type.toLowerCase());
    });
  }

  // ======================== FILTERING ========================
  setSearchQuery(query: string) {
    runInAction(() => {
      this.state.searchQuery = query;
      this.applyFilters();
    });
  }

  setSelectedStatus(status: string) {
    runInAction(() => {
      this.state.selectedStatus = status.toLowerCase();
      this.applyFilters();
    });
  }

  // multi-select connectors
  setSelectedConnectors(connectors: string[]) {
    runInAction(() => {
      this.state.selectedConnectors = connectors.map((c) => c.toLowerCase());
      this.applyFilters();
    });

    // sync to database
    this.syncSelectedConnectorsToDb().catch(console.error);
  }

  private async syncSelectedConnectorsToDb() {
    const selected = this.state.selectedConnectors;

    // Fetch all existing charge types
    const existing = await this.chargeTypeRepo.getAllChargeTypes();
    const existingNames = existing.map((e) => e.type.toLowerCase());

    // Add new ones
    for (const connector of selected) {
      if (!existingNames.includes(connector)) {
        await this.chargeTypeRepo.addChargeType({ type: connector });
      }
    }

    // Remove deselected ones
    for (const connector of existing) {
      if (!selected.includes(connector.type.toLowerCase())) {
        await this.chargeTypeRepo.deleteChargeType(connector.id);
      }
    }
  }

  private applyFilters() {
    const query = this.state.searchQuery.toLowerCase();
    const status = this.state.selectedStatus.toLowerCase();
    const connectors = this.state.selectedConnectors.map((c) =>
      c.toLowerCase()
    );

    const filtered = this.state.availableStations.filter((s) => {
      const matchesQuery =
        query === "" ||
        s.stationName?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || s.statusType.toLowerCase() === status;

      const matchesConnector =
        connectors.length === 0 ||
        connectors.includes("all") ||
        connectors.some(
          (c) =>
            (c === "ccs" && s.amountCCS > 0) ||
            (c === "chademo" && s.amountCHAdeMO > 0) ||
            (c === "type2" && s.amountType2 > 0)
        );

      return matchesQuery && matchesStatus && matchesConnector;
    });

    runInAction(() => {
      this.state.filteredStations = filtered;
    });
  }

  // ======================== SELECTION ========================
  selectStation(station: ResponseChargingStation) {
    runInAction(() => {
      this.state.selectedStation = station;
    });
  }

  clearSelection() {
    runInAction(() => {
      this.state.selectedStation = null;
    });
  }

  // ======================== VALIDATION ========================
  private validateStation(station: NewChargingStation) {
    if (!station.stationName) throw new Error("Station name is required");
    if (station.latitude < -90 || station.latitude > 90)
      throw new Error("Latitude must be between -90 and 90");
    if (station.longitude < -180 || station.longitude > 180)
      throw new Error("Longitude must be between -180 and 180");
    if (!station.createdAt) throw new Error("createdAt is required");
  }

  // ======================== SAVE/DELETE ========================
  async saveSelectedStation() {
    const selected = this.state.selectedStation;
    if (!selected) throw new Error("No station selected");

    const newStation: NewChargingStation = {
      acmId: selected.acmId ?? 0,
      stationName: selected.stationName,
      address: selected.address ?? "",
      amountCCS: selected.amountCCS ?? 0,
      amountCHAdeMO: selected.amountCHAdeMO ?? 0,
      amountType2: selected.amountType2 ?? 0,
      latitude: selected.latitude,
      longitude: selected.longitude,
      statusType: selected.statusType ?? "unknown",
      openingHours: selected.openingHours ?? "",
      photos: Array.isArray(selected.photos)
        ? JSON.stringify(selected.photos)
        : "",
      comments: Array.isArray(selected.comments)
        ? JSON.stringify(selected.comments)
        : "",
      createdAt: selected.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.validateStation(newStation);

    const existing = await this.localRepo.getAllStations();
    if (existing.length > 0) await this.localRepo.deleteStation(existing[0].id);

    const id = await this.localRepo.addStation(newStation);
    await this.fetchSavedStation();

    return id;
  }

  async deleteSavedStation() {
    const saved = this.state.savedStation;
    if (!saved) return;

    await this.localRepo.deleteStation(saved.id);

    runInAction(() => {
      this.state.savedStation = null;
    });
  }

  // ======================== UI STATE ========================
  get uiState() {
    return this.state;
  }
}
