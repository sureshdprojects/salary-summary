// src/types.ts
export type ID = string;

export type SpendType = "EMI" | "SAVING" | "OTHER";

export interface Spend {
    id: ID;
    title: string;              // "Car EMI"
    amount: number;             // monthly amount
    startDate: string;          // ISO date e.g. "2025-11-15"
    endDate?: string | null;    // ISO date or null for ongoing
    dayOfMonth?: number;        // optional — if you want a payment day
    type: SpendType;
    note?: string;
    createdAt: string;          // ISO
}

export interface AppState {
    salaryMonthly: number;      // 0 if not set
    spends: Spend[];
    version?: number;
}