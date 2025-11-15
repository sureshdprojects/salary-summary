// src/storage/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
const APP_KEY = "EMI_APP_STATE_V1";

export async function loadState<T>(): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(APP_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch (e) {
        console.warn("Failed to load state", e);
        return null;
    }
}

export async function saveState<T>(state: T): Promise<void> {
    try {
        await AsyncStorage.setItem(APP_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn("Failed to save state", e);
    }
}

export async function clearState(): Promise<void> {
    try { await AsyncStorage.removeItem(APP_KEY); } catch {}
}