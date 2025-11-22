import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { AppProvider } from "../state/AppProvider";

export default function Layout() {
    return (
        <AppProvider>
            <Tabs
                screenOptions={{
                    headerShown: true,
                    tabBarShowLabel: true,

                    // --- Tab Bar Style ---
                    tabBarStyle: {
                        position: "absolute",
                        height: 70,
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        borderRadius: Platform.OS === "ios" ? 18 : 0,
                        marginHorizontal: Platform.OS === "ios" ? 16 : 0,
                        marginBottom: Platform.OS === "ios" ? 24 : 0,
                        backgroundColor: "#fff",
                    },

                    tabBarActiveTintColor: "#007AFF",
                    tabBarInactiveTintColor: "#8A8A8A",

                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: "600",
                        marginBottom: 4,
                    },

                    tabBarItemStyle: {
                        paddingVertical: 4,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarLabel: "Home",
                        tabBarIcon: ({ color, size }) => (
                            <AntDesign name="home" size={22} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="spends"
                    options={{
                        title: "Spends",
                        tabBarLabel: "Spends",
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="payments" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        tabBarLabel: "Settings",
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="settings-outline" size={22} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </AppProvider>
    );
}
