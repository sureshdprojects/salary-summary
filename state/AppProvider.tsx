// src/state/AppProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loadState, saveState } from "../storage/storage";
import { AppState, Spend } from "../types/types";

// If you don't want to add uuid library, use Date.now().toString() for IDs.

const DEFAULT_STATE: AppState = {
    salaryMonthly: 0,
    spends: [],
    version: 1,
};

type AppContextType = {
    state: AppState;
    setSalary: (amt: number) => void;
    addSpend: (s: Omit<Spend, "id" | "createdAt">) => void;
    updateSpend: (id: string, patch: Partial<Spend>) => void;
    removeSpend: (id: string) => void;
    reloadState: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(DEFAULT_STATE);
    const [ready, setReady] = useState(false);

    // load once
    useEffect(() => {
        (async () => {
            const s = await loadState<AppState>();
            if (s) setState({ ...DEFAULT_STATE, ...s });
            setReady(true);
        })();
    }, []);

    // save when state changes (debounce)
    useEffect(() => {
        if (!ready) return;
        const id = setTimeout(() => saveState(state), 300);
        return () => clearTimeout(id);
    }, [state, ready]);

    const setSalary = useCallback((amt: number) => {
        setState(prev => ({ ...prev, salaryMonthly: Number(amt) }));
    }, []);

    const addSpend = useCallback((s: Omit<Spend, "id" | "createdAt">) => {
        const spend: Spend = {
            ...s,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        setState(prev => ({ ...prev, spends: [spend, ...prev.spends] }));
    }, []);

    const updateSpend = useCallback((id: string, patch: Partial<Spend>) => {
        setState(prev => ({
            ...prev,
            spends: prev.spends.map(sp => sp.id === id ? { ...sp, ...patch } : sp)
        }));
    }, []);

    const removeSpend = useCallback((id: string) => {
        setState(prev => ({ ...prev, spends: prev.spends.filter(s => s.id !== id) }));
    }, []);

    const reloadState = useCallback(async () => {
        const s = await loadState<AppState>();
        if (s) setState({ ...DEFAULT_STATE, ...s });
    }, []);

    return (
        <AppContext.Provider
            value={{ state, setSalary, addSpend, updateSpend, removeSpend, reloadState }}
        >
            {children}
        </AppContext.Provider>
    );
};

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}