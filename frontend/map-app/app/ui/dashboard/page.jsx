"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: rows, error } = await supabase.from("deliveries").select("*");
        if (error) throw error;
        if (alive) setData(rows || []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load dashboard data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;
  if (!data.length) return <p className="p-4">No data available</p>;

  // --- Analytics Calculations ---
  const avgETA = data.reduce((acc, r) => acc + (r.eta_minutes_ml || 0), 0) / data.length;
  const etaCategory = avgETA < 30 ? "Good" : avgETA <= 60 ? "Average" : "Not Good";

  const vehicleCounts = {};
  const ageCounts = {};
  const legCounts = {};
  let totalCompletion = 0;

  data.forEach((row) => {
    vehicleCounts[row.vehicle_id] = (vehicleCounts[row.vehicle_id] || 0) + 1;
    ageCounts[row.driver_age] = (ageCounts[row.driver_age] || 0) + 1;
    if (Array.isArray(row.legs)) {
      row.legs.forEach((l) => legCounts[l] = (legCounts[l] || 0) + 1);
    }
    totalCompletion += row.eta_completion_time_ml || 0;
  });

  const avgCompletion = totalCompletion / data.length;
  const mostCommonLegs = Object.entries(legCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Chart Data
  const vehicleChart = {
    labels: Object.keys(vehicleCounts),
    datasets: [{ label: "Trips per Vehicle", data: Object.values(vehicleCounts), backgroundColor: "rgba(54,162,235,0.7)" }]
  };
  const ageChart = {
    labels: Object.keys(ageCounts),
    datasets: [{ label: "Driver Count by Age", data: Object.values(ageCounts), backgroundColor: "rgba(255,99,132,0.7)" }]
  };
  const legsChart = {
    labels: mostCommonLegs.map(([l]) => l),
    datasets: [{ label: "Top 5 Legs", data: mostCommonLegs.map(([,c])=>c), backgroundColor: "rgba(75,192,192,0.7)" }]
  };
  const etaCategoryChart = {
    labels: ["Good (<30min)","Average (30-60min)","Not Good (>60min)"],
    datasets: [{
      label: "ETA Category",
      data: [
        data.filter(r => r.eta_minutes_ml < 30).length,
        data.filter(r => r.eta_minutes_ml >= 30 && r.eta_minutes_ml <= 60).length,
        data.filter(r => r.eta_minutes_ml > 60).length,
      ],
      backgroundColor: ["rgba(34,197,94,0.7)","rgba(253,224,71,0.7)","rgba(239,68,68,0.7)"]
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-screen-2xl">
        <h1 className="text-3xl font-black mb-6">Dashboard Analytics</h1>

        {/* Numeric summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Average ETA">{avgETA.toFixed(2)} min ({etaCategory})</Card>
          <Card title="Avg ML Completion">{avgCompletion.toFixed(2)} min</Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Vehicle Usage"><Bar data={vehicleChart} /></ChartCard>
          <ChartCard title="Driver Age Distribution"><Bar data={ageChart} /></ChartCard>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Top 5 Legs"><Pie data={legsChart} /></ChartCard>
          <ChartCard title="ETA Categories"><Pie data={etaCategoryChart} /></ChartCard>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
