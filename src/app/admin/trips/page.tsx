"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Truck, Plus, Calendar, Edit, X, CheckCircle } from "lucide-react";
import { toast } from "@/lib/utils";

interface Trip {
  id: number;
  route_id: number | null;
  salesman_id: string | null;
  vehicle_number: string | null;
  trip_date: string;
  status: "planned" | "active" | "completed";
  route?: { name: string };
  salesman?: { full_name: string };
}

interface Route {
  id: number;
  name: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function TripsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const queryClient = useQueryClient();

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          route:routes(name),
          salesman:users!trips_salesman_id_fkey(full_name)
        `)
        .order("trip_date", { ascending: false });
      if (error) throw error;
      return data as Trip[];
    }
  });

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Route[];
    }
  });

  const { data: salesmen } = useQuery({
    queryKey: ["salesmen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "salesman")
        .order("full_name");
      if (error) throw error;
      return data as User[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (trip: Partial<Trip>) => {
      const { data, error } = await supabase
        .from("trips")
        .insert([trip])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast("Trip created successfully");
      setShowModal(false);
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create trip");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...trip }: Partial<Trip> & { id: number }) => {
      const { data, error } = await supabase
        .from("trips")
        .update(trip)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast("Trip updated successfully");
      setShowModal(false);
      setEditingTrip(null);
    },
    onError: (error: any) => {
      toast(error.message || "Failed to update trip");
    }
  });

  const activeTrips = trips?.filter(t => t.status === "active").length || 0;
  const completedToday = trips?.filter(t =>
    t.status === "completed" &&
    t.trip_date === new Date().toISOString().split("T")[0]
  ).length || 0;
  const planned = trips?.filter(t => t.status === "planned").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Trips & Logistics</h1>
          <p className="text-zinc-500">Manage salesman trips and routes</p>
        </div>
        <button
          onClick={() => {
            setEditingTrip(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
          style={{ backgroundColor: "#3E2758" }}
        >
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Active Trips</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>{activeTrips}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Completed Today</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>{completedToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Planned</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>{planned}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold" style={{ color: "#3E2758" }}>All Trips</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: "#3E2758" + "20" }}>
                    <Truck size={24} style={{ color: "#3E2758" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold" style={{ color: "#3E2758" }}>
                        {trip.salesman?.full_name || "Unassigned"}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${trip.status === "active" ? "bg-green-100 text-green-700" :
                        trip.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {trip.route?.name || "No route"} • {trip.vehicle_number || "No vehicle"} • {new Date(trip.trip_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {trip.status === "planned" && (
                    <button
                      onClick={() => updateMutation.mutate({ id: trip.id, status: "active" })}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Start Trip"
                    >
                      <CheckCircle size={18} className="text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingTrip(trip);
                      setShowModal(true);
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} style={{ color: "#3E2758" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="mx-auto mb-4 text-zinc-300" size={48} />
            <p className="text-zinc-500">No trips yet</p>
            <p className="text-sm text-zinc-400 mt-1">Click "Create Trip" to assign a salesman to a route</p>
          </div>
        )}
      </div>

      {showModal && (
        <TripModal
          trip={editingTrip}
          routes={routes || []}
          salesmen={salesmen || []}
          onClose={() => {
            setShowModal(false);
            setEditingTrip(null);
          }}
          onSave={(trip) => {
            if (editingTrip) {
              updateMutation.mutate({ ...trip, id: editingTrip.id });
            } else {
              createMutation.mutate(trip);
            }
          }}
        />
      )}
    </div>
  );
}

function TripModal({
  trip,
  routes,
  salesmen,
  onClose,
  onSave
}: {
  trip: Trip | null;
  routes: Route[];
  salesmen: User[];
  onClose: () => void;
  onSave: (trip: Partial<Trip>) => void;
}) {
  const [formData, setFormData] = useState({
    route_id: trip?.route_id || null,
    salesman_id: trip?.salesman_id || null,
    vehicle_number: trip?.vehicle_number || "",
    trip_date: trip?.trip_date || new Date().toISOString().split("T")[0],
    status: trip?.status || "planned" as "planned" | "active" | "completed",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>
            {trip ? "Edit Trip" : "Create Trip"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Route</label>
            <select
              value={formData.route_id || ""}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              required
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Salesman</label>
            <select
              value={formData.salesman_id || ""}
              onChange={(e) => setFormData({ ...formData, salesman_id: e.target.value || null })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              required
            >
              <option value="">Select Salesman</option>
              {salesmen.map((salesman) => (
                <option key={salesman.id} value={salesman.id}>{salesman.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Vehicle Number</label>
            <input
              type="text"
              value={formData.vehicle_number}
              onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              placeholder="KL-01-AB-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Trip Date</label>
            <input
              type="date"
              value={formData.trip_date}
              onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
              style={{ backgroundColor: "#3E2758" }}
            >
              {trip ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
