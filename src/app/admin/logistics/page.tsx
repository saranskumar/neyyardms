"use client";

import { useState } from "react";
import { MapPin, Truck } from "lucide-react";

// Import the actual route and trip pages as components
const RoutesContent = () => {
    const RoutesPage = require("../routes/page").default;
    return <RoutesPage />;
};

const TripsContent = () => {
    const TripsPage = require("../trips/page").default;
    return <TripsPage />;
};

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState<"routes" | "trips">("routes");

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Logistics Management</h1>
                <p className="text-zinc-500">Manage routes and trips</p>
            </div>

            {/* Swipeable Tabs */}
            <div className="flex gap-2 bg-white rounded-xl border border-zinc-200 p-1">
                <button
                    onClick={() => setActiveTab("routes")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "routes"
                            ? "text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                    style={activeTab === "routes" ? { backgroundColor: "#3E2758" } : {}}
                >
                    <MapPin size={18} />
                    Routes
                </button>
                <button
                    onClick={() => setActiveTab("trips")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "trips"
                            ? "text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                    style={activeTab === "trips" ? { backgroundColor: "#3E2758" } : {}}
                >
                    <Truck size={18} />
                    Trips
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === "routes" && <RoutesContent />}
                {activeTab === "trips" && <TripsContent />}
            </div>
        </div>
    );
}
