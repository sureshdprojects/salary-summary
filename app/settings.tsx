// app/settings.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useApp } from "../state/AppProvider";

export default function Settings() {
    const { state, setSalary } = useApp();

    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(String(state.salaryMonthly ?? 0));
    const inputRef = useRef<TextInput>(null);

    // keep UI synced when external changes happen (backup restore etc)
    useEffect(() => {
        setText(String(state.salaryMonthly ?? 0));
    }, [state.salaryMonthly]);

    function startEditing() {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 200);
    }

    function cancelEditing() {
        setText(String(state.salaryMonthly ?? 0));
        setEditing(false);
        Keyboard.dismiss();
    }

    function saveEditing() {
        const num = Number(text || 0);
        if (!isFinite(num) || num < 0) return;

        setSalary(Math.round(num));
        setEditing(false);
        Keyboard.dismiss();
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.select({ ios: "padding", android: undefined })}
        >
            <View style={styles.inner}>
                <Text style={styles.greeting}>Hi 👋</Text>

                {/* Salary Block */}
                <View style={styles.card}>
                    <Text style={styles.label}>Your Monthly Salary</Text>

                    {!editing && (
                        <View style={styles.row}>
                            <Text style={styles.salary}>₹ {Number(state.salaryMonthly).toLocaleString()}</Text>

                            <TouchableOpacity onPress={startEditing} style={styles.editBtn}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {editing && (
                        <View>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                value={text}
                                onChangeText={(t) => setText(t.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                                returnKeyType="done"
                                onSubmitEditing={saveEditing}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={saveEditing} style={styles.saveBtn}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={cancelEditing} style={styles.cancelBtn}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <Text style={styles.note}>
                        This salary will be used to calculate your monthly summary and remaining balance.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        padding: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
    },

    card: {
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    label: {
        fontSize: 15,
        color: "#555",
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    salary: {
        fontSize: 32,
        fontWeight: "700",
        color: "#222",
    },

    editBtn: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editText: {
        color: "#fff",
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        fontSize: 20,
        marginTop: 6,
    },

    buttonRow: {
        flexDirection: "row",
        marginTop: 16,
    },

    saveBtn: {
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        marginRight: 10,
    },
    saveText: {
        color: "white",
        fontWeight: "600",
    },

    cancelBtn: {
        backgroundColor: "#eee",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
    },
    cancelText: {
        color: "#333",
        fontWeight: "600",
    },

    note: {
        marginTop: 14,
        fontSize: 13,
        color: "#666",
    },
});
