"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DEFAULT_PRESETS, EXERCISE_PRESETS } from "../data/exercise-presets";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ExerciseProgress = {
  dates: string[];
  weights: number[];
};

type ExerciseHistory = {
  [key: string]: ExerciseProgress;
};

export default function Progress() {
  const [muscleGroup, setMuscleGroup] = useState<keyof typeof DEFAULT_PRESETS>("chest");
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>({});
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    // TODO: Implement workout history functionality
    const workouts: any[] = [];
    const history: ExerciseHistory = {};

    // Initialize history with all preset exercises
    EXERCISE_PRESETS[muscleGroup].forEach((exercise: string) => {
      history[exercise] = {
        dates: [],
        weights: []
      };
    });

    setExerciseHistory(history);
    setSelectedExercise("");
  }, [muscleGroup]);

  const chartData = {
    labels: selectedExercise ? exerciseHistory[selectedExercise]?.dates.map(date => 
      new Date(date).toLocaleDateString()
    ) : [],
    datasets: [
      {
        label: `${selectedExercise} Weight Progress (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.weights : [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weight Progress Over Time'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Exercise Progress</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muscle Group
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => {
                  setMuscleGroup(e.target.value as keyof typeof DEFAULT_PRESETS);
                  setSelectedExercise("");
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                {Object.keys(DEFAULT_PRESETS).map(group => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Exercise</option>
                {EXERCISE_PRESETS[muscleGroup].map((exercise: string) => (
                  <option 
                    key={exercise} 
                    value={exercise}
                    disabled={!exerciseHistory[exercise]?.weights.length}
                  >
                    {exercise} {!exerciseHistory[exercise]?.weights.length ? "(No data)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedExercise && exerciseHistory[selectedExercise]?.weights.length > 0 ? (
            <div>
              <Line data={chartData} options={chartOptions} />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Latest Weight</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {exerciseHistory[selectedExercise].weights[exerciseHistory[selectedExercise].weights.length - 1]} kg
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {(exerciseHistory[selectedExercise].weights[exerciseHistory[selectedExercise].weights.length - 1] - 
                      exerciseHistory[selectedExercise].weights[0]).toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {selectedExercise 
                ? "No weight data available for the selected exercise" 
                : "Select an exercise to view progress"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 