import { useApp } from "@/state/AppProvider";
import { Spend } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function Home() {
    const { state } = useApp(); // salaryMonthly, spends[] stored here

    const [futureDate, setFutureDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [remainingSalary, setRemainingSalary] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);

    const monthlySalary = state.salaryMonthly || 0;
    const spends = state.spends || [];

    const isSpendActiveInThisMonthYear = (emi: Spend, date: Date) => {
        const start = new Date(emi.startDate);
        const end = new Date(emi.endDate != null ? emi.endDate : date.setDate(date.getDate() + 1));
        return (start <= date && date <= end) || (date.getMonth() === end.getMonth() && date.getFullYear() === end.getFullYear());
    };

    // ---------------------------------------------
    // Calculate remaining salary for selected date
    // ---------------------------------------------
    const calculateRemaining = () => {
        const spendsTotalOnDate = spends
            .filter(sp => isSpendActiveInThisMonthYear(sp, futureDate))
            .reduce((sum, sp) => sum + Number(sp.amount || 0), 0);

        setRemainingSalary(monthlySalary - spendsTotalOnDate);
    };

    const prepareChartData = () => {
        const activeSpends = spends.filter(sp => isSpendActiveInThisMonthYear(sp, futureDate));

        const categoryTotals: Record<string, number> = {
            EMI: 0,
            SAVING: 0,
            OTHER: 0
        };

        let totalSpent = 0;
        activeSpends.forEach(sp => {
            const amount = Number(sp.amount || 0);
            if (categoryTotals[sp.type] !== undefined) {
                categoryTotals[sp.type] += amount;
            } else {
                categoryTotals['OTHER'] += amount;
            }
            totalSpent += amount;
        });

        const remaining = Math.max(0, monthlySalary - totalSpent);

        // Colors
        const colors: Record<string, string> = {
            EMI: '#FF6B6B',    // Red/Coral
            SAVING: '#4ECDC4', // Teal
            OTHER: '#FFE66D',  // Yellow
            Remaining: '#1A535C' // Dark Teal/Blue
        };

        const rawData = [
            { value: categoryTotals.EMI, color: colors.EMI, text: 'EMI', label: 'EMI' },
            { value: categoryTotals.SAVING, color: colors.SAVING, text: 'Savings', label: 'Savings' },
            { value: categoryTotals.OTHER, color: colors.OTHER, text: 'Other', label: 'Other' },
            { value: remaining, color: colors.Remaining, text: 'Remaining', label: 'Remaining' }
        ];

        // Filter out 0 values
        const finalData = rawData.filter(d => d.value > 0);
        setChartData(finalData);
    };

    useEffect(() => {
        calculateRemaining();
        prepareChartData();
    }, [futureDate, state]);

    const renderLegend = () => {
        const base = monthlySalary > 0 ? monthlySalary : (chartData.reduce((acc, item) => acc + item.value, 0) || 1);
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                {chartData.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, marginRight: 6 }} />
                        <Text style={{ fontSize: 12, color: '#333' }}>{item.label} ({Math.round((item.value / base) * 100)}%)</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView
            style={{
                flex: 1,
                padding: 20,
                backgroundColor: "#F7F9FC",
            }}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* HEADER: TITLE + DATE PICKER */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: "700", color: '#2D3436' }}>
                    Overview
                </Text>
                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#FFF",
                        borderRadius: 20,
                        borderColor: "#D0D4DC",
                        borderWidth: 1,
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A73E8" }}>
                        {futureDate.toDateString()} ▾
                    </Text>
                </TouchableOpacity>
            </View>

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

            {/* SALARY CARDS ROW */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                {/* MONTHLY SALARY CARD */}
                <View
                    style={{
                        flex: 1,
                        padding: 16,
                        backgroundColor: "#E5F1FF",
                        borderRadius: 16,
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: '#5F6368', marginBottom: 4 }}>Monthly Salary</Text>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A73E8" }}>
                        ₹{monthlySalary}
                    </Text>
                </View>

                {/* REMAINING SALARY CARD */}
                <View
                    style={{
                        flex: 1,
                        padding: 16,
                        backgroundColor: remainingSalary >= 0 ? "#E6F7E9" : "#FCE8E6",
                        borderRadius: 16,
                        justifyContent: 'center',
                        borderColor: remainingSalary >= 0 ? "transparent" : "#FAD2CF",
                        borderWidth: remainingSalary >= 0 ? 0 : 1
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: '#5F6368', marginBottom: 4 }}>Remaining</Text>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: remainingSalary >= 0 ? "#0E8A3E" : "#D93025",
                        }}
                    >
                        ₹{remainingSalary}
                    </Text>
                </View>
            </View>

            {/* CHART SECTION */}
            <View style={{
                backgroundColor: '#FFF',
                padding: 20,
                borderRadius: 24,
                alignItems: 'center',
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 4
            }}>
                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 24, alignSelf: 'flex-start', color: '#2D3436' }}>
                    Spending Breakdown
                </Text>

                {chartData.length > 0 ? (
                    <>
                        <PieChart
                            data={chartData}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={100}
                            innerRadius={70}
                            innerCircleColor={'#FFF'}
                            centerLabelComponent={() => {
                                const totalUsed = monthlySalary - remainingSalary;
                                const base = monthlySalary > 0 ? monthlySalary : (totalUsed || 1);
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 24, color: '#2D3436', fontWeight: '800' }}>
                                            {Math.round((totalUsed / base) * 100)}%
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#95A5A6', fontWeight: '600' }}>Used</Text>
                                    </View>
                                );
                            }}
                        />
                        {renderLegend()}
                    </>
                ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#999', fontSize: 16 }}>No spending data yet</Text>
                    </View>
                )}
            </View>

            {/* CATEGORY DETAILS */}
            <View>
                <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16, color: '#2D3436' }}>
                    Category Details
                </Text>

                {['EMI', 'SAVING', 'OTHER'].map((cat) => {
                    const categorySpends = spends.filter(sp =>
                        isSpendActiveInThisMonthYear(sp, futureDate) && sp.type === cat
                    );

                    if (categorySpends.length === 0) return null;

                    const total = categorySpends.reduce((sum, sp) => sum + Number(sp.amount || 0), 0);
                    const base = monthlySalary > 0 ? monthlySalary : (chartData.reduce((acc, item) => acc + item.value, 0) || 1);
                    const percentage = Math.round((total / base) * 100);

                    // Colors mapping
                    const colors: Record<string, string> = {
                        EMI: '#FF6B6B',
                        SAVING: '#4ECDC4',
                        OTHER: '#FFE66D'
                    };
                    const color = colors[cat] || '#ccc';

                    return (
                        <View key={cat} style={{
                            backgroundColor: '#FFF',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2
                        }}>
                            {/* Header Row: Name, Total, Percentage */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                {/* Left: Name */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, marginRight: 8 }} />
                                    <Text style={{ fontSize: 16, fontWeight: "600" }}>{cat === 'SAVING' ? 'Savings' : cat}</Text>
                                </View>

                                {/* Center: Total Amount */}
                                <Text style={{ fontSize: 16, fontWeight: "700", flex: 1, textAlign: 'center' }}>₹{total}</Text>

                                {/* Right: Percentage */}
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 14, fontWeight: "600", color: '#666' }}>{percentage}%</Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={{ height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                                <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: color }} />
                            </View>

                            {/* Individual Spends */}
                            <View style={{ marginTop: 12, paddingTop: 4 }}>
                                {categorySpends.map((spend, idx) => {
                                    const spendPercentage = Math.round((Number(spend.amount || 0) / base) * 100);
                                    return (
                                        <View key={idx} style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: 12,
                                            borderTopWidth: 1,
                                            borderTopColor: '#F5F7FA'
                                        }}>
                                            {/* Left: Name */}
                                            <Text style={{ fontSize: 15, color: '#2D3436', fontWeight: '500', flex: 1, textAlign: 'left' }}>
                                                {spend.title}
                                            </Text>

                                            {/* Middle: Amount */}
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: '#2D3436', flex: 1, textAlign: 'center' }}>
                                                ₹{spend.amount}
                                            </Text>

                                            {/* Right: Percentage */}
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <View style={{
                                                    backgroundColor: color + '15',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 3,
                                                    borderRadius: 6
                                                }}>
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: color }}>
                                                        {spendPercentage}%
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </View>


        </ScrollView>
    );
}
