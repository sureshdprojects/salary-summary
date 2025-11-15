import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "../state/AppProvider";
import {Spend} from "@/types/types"; // <-- Your hook

export default function Home() {
    const { state } = useApp(); // salaryMonthly, spends[] stored here

    const [futureDate, setFutureDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [remainingSalary, setRemainingSalary] = useState(0);

    const monthlySalary = state.salaryMonthly || 0;
    const spends = state.spends || [];

    // ---------------------------------------------
    // Determines if an EMI is active on selected date
    // ---------------------------------------------
    const isEmiActiveOnDate = (emi: Spend, date: Date) => {
        const start = new Date(emi.startDate);
        const end = new Date(emi.endDate != null ? emi.endDate : new Date());
        return start <= date && date <= end;
    };

    const isSpendActiveOnDate = (emi: Spend, date: Date) => {
        const start = new Date(emi.startDate);
        // console.log("ednd", emi.endDate, "title" + emi.title)
        const end = new Date(emi.endDate != null ? emi.endDate : date.setDate(date.getDate()+1));
        // console.log(emi.title,"start: " + start,"end: " + end,"Date: " + date,"Con:" + (start <= date && date <= end))
        return start <= date && date <= end;
    };

    // ---------------------------------------------
    // Calculate remaining salary for selected date
    // ---------------------------------------------
    const calculateRemaining = () => {
        const spendsTotalOnDate = spends
            .filter(sp => isSpendActiveOnDate(sp, futureDate))
            .reduce((sum, sp) => sum + Number(sp.amount || 0), 0);

        setRemainingSalary(monthlySalary - spendsTotalOnDate);
    };

    useEffect(() => {
        calculateRemaining();
    }, [futureDate, state]);

    return (
        <ScrollView
            style={{
                flex: 1,
                padding: 20,
                backgroundColor: "#F7F9FC",
            }}
        >
            {/* TITLE */}
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
                Salary Overview
            </Text>

            {/* MONTHLY SALARY CARD */}
            <View
                style={{
                    padding: 20,
                    backgroundColor: "#E5F1FF",
                    borderRadius: 12,
                    marginBottom: 20,
                }}
            >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Monthly Salary</Text>
                <Text style={{ fontSize: 26, fontWeight: "700", color: "#1A73E8" }}>
                    ₹{monthlySalary}
                </Text>
            </View>

            {/* FUTURE DATE PICKER */}
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={{
                    padding: 16,
                    backgroundColor: "#FFF",
                    borderRadius: 12,
                    borderColor: "#D0D4DC",
                    borderWidth: 1,
                    marginBottom: 20,
                }}
            >
                <Text style={{ fontSize: 14, color: "#555" }}>Select Future Date</Text>
                <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 6 }}>
                    {futureDate.toDateString()}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={futureDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setFutureDate(selectedDate);
                    }}
                />
            )}

            {/* REMAINING SALARY CARD */}
            <View
                style={{
                    padding: 20,
                    backgroundColor: "#E6F7E9",
                    borderRadius: 12,
                    marginTop: 10,
                    borderColor: "#B6E3C1",
                    borderWidth: 1,
                }}
            >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    Remaining Salary on
                </Text>
                <Text style={{ fontSize: 15, marginBottom: 10 }}>
                    {futureDate.toDateString()}
                </Text>

                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "800",
                        color: remainingSalary >= 0 ? "#0E8A3E" : "red",
                    }}
                >
                    ₹{remainingSalary}
                </Text>
            </View>
        </ScrollView>
    );
}
