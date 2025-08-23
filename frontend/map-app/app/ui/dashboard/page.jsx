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

// Connect Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch route_requests & route_results with join
      const { data: requests, error: reqError } = await supabase.from("route_requests").select("id, vehicle_id, driver_age");
      const { data: results, error: resError } = await supabase.from("route_results").select("request_id, eta_minutes_ml, eta_completion_time_ml, legs");

      if (reqError || resError) {
        console.error(reqError || resError);
        setLoading(false);
        return;
      }

      // Merge data by request_id
      const joined = results.map(r => ({
        ...r,
        ...requests.find(req => req.id === r.request_id)
      }));

      if (!joined.length) {
        setStats({});
        setLoading(false);
        return;
      }

      // --- Analytics ---
      const avgETA = joined.reduce((sum, r) => sum + (Number(r.eta_minutes_ml) || 0), 0) / joined.length;
      const etaCategory = avgETA < 30 ? "Good" : avgETA <= 60 ? "Average" : "Not Good";

      const vehicleCounts = {};
      const ageCounts = {};
      const legCounts = {};
      let totalCompletion = 0;
      let validCompletionCount = 0;

      joined.forEach((row) => {
        if (row.vehicle_id) vehicleCounts[row.vehicle_id] = (vehicleCounts[row.vehicle_id] || 0) + 1;
        if (row.driver_age) ageCounts[row.driver_age] = (ageCounts[row.driver_age] || 0) + 1;

        if (row.legs && Array.isArray(row.legs)) {
          row.legs.forEach((leg) => {
            if (leg.name) legCounts[leg.name] = (legCounts[leg.name] || 0) + 1;
          });
        } else if (row.legs && typeof row.legs === "object") {
          // if legs is object with segments array
          Object.values(row.legs).forEach((segment) => {
            if (segment.name) legCounts[segment.name] = (legCounts[segment.name] || 0) + 1;
          });
        }

        if (row.eta_completion_time_ml) {
          totalCompletion += new Date(row.eta_completion_time_ml).getTime();
          validCompletionCount++;
        }
      });

      const avgCompletion = validCompletionCount ? new Date(totalCompletion / validCompletionCount).toLocaleString() : "N/A";
      const topLegs = Object.entries(legCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const goodCount = joined.filter(r => r.eta_minutes_ml < 30).length;
      const avgCount = joined.filter(r => r.eta_minutes_ml >= 30 && r.eta_minutes_ml <= 60).length;
      const badCount = joined.filter(r => r.eta_minutes_ml > 60).length;

      setStats({
        avgETA,
        etaCategory,
        vehicleCounts,
        ageCounts,
        topLegs,
        avgCompletion
      });
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading Dashboard...</p>;
  if (!stats || !Object.keys(stats).length) return <p className="p-4">No dashboard data available</p>;

  // Chart Data
  const vehicleChart = {
    labels: Object.keys(stats.vehicleCounts),
    datasets: [{ label: "Trips per Vehicle", data: Object.values(stats.vehicleCounts), backgroundColor: "rgba(54,162,235,0.7)" }]
  };
  const ageChart = {
    labels: Object.keys(stats.ageCounts),
    datasets: [{ label: "Drivers by Age", data: Object.values(stats.ageCounts), backgroundColor: "rgba(255,99,132,0.7)" }]
  };
  const legsChart = {
    labels: stats.topLegs.map(([leg]) => leg),
    datasets: [{ label: "Top Legs", data: stats.topLegs.map(([,count])=>count), backgroundColor: "rgba(75,192,192,0.7)" }]
  };
    const etaCategoryChart = {
    labels: ["Good (<30min)", "Average (30–60min)", "Not Good (>60min)"],
    datasets: [{
        data: [
        stats.goodCount,
        stats.avgCount,
        stats.badCount
        ],
      backgroundColor: ["rgba(34,197,94,0.7)","rgba(253,224,71,0.7)","rgba(239,68,68,0.7)"]
    }]
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Delivery & Logistics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Average ETA">{stats.avgETA.toFixed(2)} min ({stats.etaCategory})</Card>
        <Card title="Avg ML Completion Time">{stats.avgCompletion}</Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Vehicle Usage"><Bar data={vehicleChart} /></ChartCard>
        <ChartCard title="Driver Age Distribution"><Bar data={ageChart} /></ChartCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Top 5 Most Common Legs"><Pie data={legsChart} /></ChartCard>
        <ChartCard title="ETA Category Breakdown"><Pie data={etaCategoryChart} /></ChartCard>
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
