// app/spends.tsx
import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    Alert,
} from "react-native";
import { useApp } from "../state/AppProvider";
import {Spend, SpendType} from "../types/types";
import { MaterialIcons } from "@expo/vector-icons";

export default function Spends() {
    const { state, addSpend, removeSpend, updateSpend } = useApp(); // 👈 Added updateSpend support

    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);  // 👈 NEW
    const [editId, setEditId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState("");
    const [dayOfMonth, setDayOfMonth] = useState("");
    const [type, setType] = useState<SpendType>("EMI");
    const [note, setNote] = useState("");

    const amountRef = useRef<TextInput>(null);

    function resetForm() {
        setTitle("");
        setAmount("");
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate("");
        setDayOfMonth("");
        setType("EMI");
        setNote("");
        setEditId(null);
        setIsEdit(false);
    }

    function openAddModal() {
        resetForm();
        setModalVisible(true);
        setTimeout(() => amountRef.current?.focus(), 300);
    }

    function openEditModal(item: Spend) {
        setIsEdit(true);
        setEditId(item.id);

        setTitle(item.title);
        setAmount(String(item.amount));
        setStartDate(item.startDate);
        setEndDate(item.endDate ?? "");
        setDayOfMonth(item.dayOfMonth ? String(item.dayOfMonth) : "");
        setType(item.type);
        setNote(item.note ?? "");

        setModalVisible(true);
        setTimeout(() => amountRef.current?.focus(), 300);
    }

    function closeModal() {
        setModalVisible(false);
        Keyboard.dismiss();
        resetForm();
    }

    function onSave() {
        if (!title.trim()) return Alert.alert("Missing Title", "Please enter a title");

        if (!amount) return Alert.alert("Missing Amount", "Please enter an amount");

        const amt = Number(amount);
        if (isNaN(amt) || amt <= 0) return Alert.alert("Invalid Amount", "Amount must be positive");

        if (isEdit && editId) {
            updateSpend(editId, {
                title: title.trim(),
                amount: amt,
                startDate,
                endDate: endDate ? endDate : null,
                dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
                type,
                note: note.trim(),
            });
        } else {
            addSpend({
                title: title.trim(),
                amount: amt,
                startDate,
                endDate: endDate ? endDate : null,
                dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
                type,
                note: note.trim(),
            } as any);
        }

        closeModal();
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>

                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <Text style={styles.addBtnText}>+ Add EMI / Spend / Saving</Text>
                </TouchableOpacity>

                <FlatList
                    data={state.spends}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const start = new Date(item.startDate);
                        const end = item.endDate ? new Date(item.endDate) : null;

                        const now = new Date();
                        const totalMonths = end
                            ? (end.getFullYear() - start.getFullYear()) * 12 +
                            (end.getMonth() - start.getMonth()) + 1
                            : null;

                        const completedMonths =
                            now < start
                                ? 0
                                : (now.getFullYear() - start.getFullYear()) * 12 +
                                (now.getMonth() - start.getMonth()) + 1;

                        const progress =
                            totalMonths && totalMonths > 0
                                ? Math.min(completedMonths / totalMonths, 1)
                                : 0;

                        return (
                            <View style={styles.cardContainer}>

                                <View style={{ flex: 1 }}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>

                                        <View style={{ flexDirection: "row" }}>
                                            <TouchableOpacity
                                                style={{ marginRight: 12 }}
                                                onPress={() => openEditModal(item)}
                                            >
                                                <MaterialIcons name="edit" size={22} color="#007AFF" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => removeSpend(item.id)}
                                            >
                                                <MaterialIcons name="delete" size={22} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.itemAmount}>₹ {item.amount.toLocaleString()}</Text>

                                    <View style={
                                        {
                                            backgroundColor: item.type === "SAVING" ? "#E6F7E9" : item.type === "EMI" ? "#FFE9D6" : "#FFF9D9",
                                            alignSelf: "flex-start",
                                            paddingVertical: 4,
                                            paddingHorizontal: 10,
                                            borderRadius: 8,
                                            marginTop: 8,
                                        }
                                    }>
                                        <Text style={
                                            {
                                                color: item.type === "SAVING" ? "#0E8A3E" : item.type === "EMI" ? "#D96A00" : "#C8A100",
                                                fontSize: 12,
                                                fontWeight: "600"
                                            }
                                        }>
                                            {item.type}
                                        </Text>
                                    </View>

                                    <Text style={styles.itemMeta}>
                                        {item.startDate}
                                        {item.endDate ? ` → ${item.endDate}` : " • Ongoing"}
                                    </Text>

                                    {totalMonths ? (
                                        <View style={{ marginTop: 12 }}>
                                            <Text style={styles.emiText}>
                                                EMI {completedMonths}/{totalMonths}
                                            </Text>

                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                                            </View>
                                        </View>
                                    ) : (
                                        <Text style={styles.ongoingText}>Ongoing • No end date</Text>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyText}>No spends added yet.</Text>
                    )}
                />
            </View>

            {/* MODAL */}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                    <KeyboardAvoidingView
                        behavior={Platform.select({ ios: "padding", android: undefined })}
                        style={{ flex: 1 }}
                    >
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.modalContainer}
                        >
                            <Text style={styles.modalTitle}>
                                {isEdit ? "Edit Spend / EMI" : "Add Spend / EMI"}
                            </Text>

                            <Text style={styles.label}>Title</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeRow}>
                                {["EMI", "SAVING", "OTHER"].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                                        onPress={() => setType(t as SpendType)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeText,
                                                type === t && { color: "white", fontWeight: "700" },
                                            ]}
                                        >
                                            {t}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                ref={amountRef}
                                style={styles.input}
                                value={amount}
                                keyboardType="numeric"
                                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ""))}
                            />

                            <Text style={styles.label}>Start Date</Text>
                            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

                            <Text style={styles.label}>End Date (optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={endDate}
                                onChangeText={setEndDate}
                            />

                            <Text style={styles.label}>Day of Month (optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={dayOfMonth}
                                keyboardType="numeric"
                                onChangeText={(t) => setDayOfMonth(t.replace(/[^0-9]/g, ""))}
                            />

                            <Text style={styles.label}>Note (optional)</Text>
                            <TextInput
                                style={[styles.input, { height: 70 }]}
                                value={note}
                                onChangeText={setNote}
                                multiline
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { padding: 16, flex: 1 },
    title: { fontSize: 26, fontWeight: "700", marginBottom: 16 },

    addBtn: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    addBtnText: { color: "white", fontWeight: "700", fontSize: 16 },

    emptyText: { marginTop: 20, color: "#777", textAlign: "center" },

    cardContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    sideStrip: {
        width: 6,
        backgroundColor: "#007AFF",
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
        marginRight: 14,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    itemTitle: { fontSize: 18, fontWeight: "700", color: "#222" },

    itemAmount: { marginTop: 6, fontSize: 16, fontWeight: "600", color: "#007AFF" },

    itemMeta: { color: "#666", marginTop: 6, fontSize: 13 },

    typeTag: {
        backgroundColor: "#E7F0FF",
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    typeTagText: { fontSize: 12, fontWeight: "600", color: "#007AFF" },

    emiText: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 4 },

    progressBar: {
        height: 8,
        backgroundColor: "#e5e5e5",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: "#007AFF" },

    ongoingText: { marginTop: 12, fontSize: 13, color: "#777", fontStyle: "italic" },

    modalContainer: { padding: 16 },
    modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 20 },

    label: { marginTop: 16, marginBottom: 4, color: "#555" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
    },

    typeRow: { flexDirection: "row", marginTop: 4 },

    typeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: "#eee",
        borderRadius: 8,
        marginRight: 8,
    },
    typeBtnActive: { backgroundColor: "#007AFF" },
    typeText: { fontSize: 14, color: "#444" },

    modalButtons: { flexDirection: "row", marginTop: 24 },
    saveBtn: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginRight: 12,
    },
    saveText: { color: "white", fontWeight: "700" },

    cancelBtn: {
        backgroundColor: "#eee",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelText: { color: "#333", fontWeight: "600" },
});
