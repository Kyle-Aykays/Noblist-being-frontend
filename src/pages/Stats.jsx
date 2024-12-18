import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import '../assets/css/login.css';
import '../assets/css/stats.css';
import "../output.css"; // Add styles if necessary
import Navbar from "../components/Navbar";
Chart.register(...registerables);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Stats = () => {
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState("");

  // Fetch stats data
  const fetchStats = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(`${backendUrl}/checklist/morning-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, checklistType: "Morning" }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStatsData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch stats");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (statsData) {
      renderCharts();
    }
  }, [statsData]);



  
  // Render charts
  const renderCharts = () => {
    const { totalTasks, completedTasks, pendingTasks, priorityStats, completionPercentage } = statsData;

    // Completion Doughnut Chart
    const ctxDoughnut = document.getElementById("completionChart");
    new Chart(ctxDoughnut, {
      type: "doughnut",
      data: {
        labels: ["Completed Tasks", "Pending Tasks"],
        datasets: [
          {
            data: [completedTasks, pendingTasks],
            backgroundColor: ["#fff", "#000"],
            hoverBackgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Completion Percentage: ${completionPercentage}%`,
          },
        },
      },
    });

    // Priority Bar Chart
    const ctxBar = document.getElementById("priorityChart");
    new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            label: "Priority Tasks",
            data: [priorityStats.high, priorityStats.medium, priorityStats.low],
            backgroundColor: ["#ef4444", "#FFC300", "#22c55e"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  return (
    <>
    <Navbar />
    <div className="stats-page p-6">
      <h1 className="text-3xl font-bold mb-4 m color-white">Stats Overview</h1>
      {error && <p className="text-red-500">{error}</p>}
      {statsData ? (
        <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completion Chart */}
          <div className="chart-wrapper">
            <canvas id="priorityChart" width="400" height="400"></canvas>
          </div>
          {/* Priority Chart */}
          <div className="chart-wrapper">
            <canvas id="completionChart" width="400" height="400"></canvas>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading stats...</p>
      )}
    </div>
    </>
  );
};

export default Stats;
