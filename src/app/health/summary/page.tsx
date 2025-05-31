"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { WeeklySummary, MonthlySummary } from "../../types";
import { getWeeklySummary, getMonthlySummary } from "../utils/storage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Summary() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);

  useEffect(() => {
    if (view === "weekly") {
      const summary = getWeeklySummary(selectedDate);
      setWeeklySummary(summary);
    } else {
      const summary = getMonthlySummary(selectedDate.getFullYear(), selectedDate.getMonth());
      setMonthlySummary(summary);
    }
  }, [view, selectedDate]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === "weekly") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === "weekly") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const weightChartData = {
    labels: view === "weekly"
      ? Array.from({ length: 7 }, (_, i) => {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() + i);
          return date.toLocaleDateString();
        })
      : monthlySummary?.weeklyProgress.map(w => new Date(w.startDate).toLocaleDateString()),
    datasets: [
      {
        label: "Weight (kg)",
        data: view === "weekly"
          ? [weeklySummary?.averageWeight]
          : monthlySummary?.weeklyProgress.map(w => w.averageWeight),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      }
    ]
  };

  const nutritionChartData = {
    labels: ["Calories", "Protein", "Fat", "Carbs"],
    datasets: [
      {
        label: "Actual",
        data: view === "weekly"
          ? [
              weeklySummary?.averageCalories || 0,
              weeklySummary?.averageProtein || 0,
              weeklySummary?.averageFat || 0,
              weeklySummary?.averageCarbs || 0
            ]
          : [
              monthlySummary?.averageCalories || 0,
              monthlySummary?.averageProtein || 0,
              monthlySummary?.averageFat || 0,
              monthlySummary?.averageCarbs || 0
            ],
        backgroundColor: "rgba(75, 192, 192, 0.5)"
      },
      {
        label: "Goal",
        data: view === "weekly"
          ? [
              weeklySummary?.goalProgress.calories || 0,
              weeklySummary?.goalProgress.protein || 0,
              weeklySummary?.goalProgress.fat || 0,
              weeklySummary?.goalProgress.carbs || 0
            ]
          : [
              monthlySummary?.goalProgress.calories || 0,
              monthlySummary?.goalProgress.protein || 0,
              monthlySummary?.goalProgress.fat || 0,
              monthlySummary?.goalProgress.carbs || 0
            ],
        backgroundColor: "rgba(255, 99, 132, 0.5)"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Progress Overview"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Health Summary</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-x-2">
              <button
                onClick={() => setView("weekly")}
                className={`px-4 py-2 rounded-md ${
                  view === "weekly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setView("monthly")}
                className={`px-4 py-2 rounded-md ${
                  view === "monthly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Monthly
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                ←
              </button>
              <span className="text-gray-700">
                {view === "weekly"
                  ? `Week of ${selectedDate.toLocaleDateString()}`
                  : `${selectedDate.toLocaleString("default", { month: "long" })} ${selectedDate.getFullYear()}`
                }
              </span>
              <button
                onClick={handleNext}
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h2>
              <Line data={weightChartData} options={chartOptions} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Overview</h2>
              <Bar data={nutritionChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Weight</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? `${weeklySummary?.averageWeight?.toFixed(1) || "-"} kg`
                  : `${monthlySummary?.averageWeight?.toFixed(1) || "-"} kg`
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Body Fat</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? `${weeklySummary?.averageBodyFat?.toFixed(1) || "-"}%`
                  : `${monthlySummary?.averageBodyFat?.toFixed(1) || "-"}%`
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Calories</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? `${weeklySummary?.averageCalories?.toFixed(0) || "-"} kcal`
                  : `${monthlySummary?.averageCalories?.toFixed(0) || "-"} kcal`
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Water Intake</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? `${weeklySummary?.averageWaterIntake?.toFixed(0) || "-"} ml`
                  : `${monthlySummary?.averageWaterIntake?.toFixed(0) || "-"} ml`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}