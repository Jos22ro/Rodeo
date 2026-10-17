export interface Cow {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;
}

export interface Milking {
  id: string;
  cowId: string;
  date: string;
  shift: "morning" | "afternoon";
  liters: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;
}

export interface Dispatch {
  id: string;
  date: string;
  shift: "morning" | "afternoon" | null;
  liters: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;
}

export interface SyncQueueItem {
  id?: number;
  tableName: "cows" | "milkings" | "dispatches";
  recordId: string;
  operation: "insert" | "update" | "delete";
  createdAt: Date;
}
