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
import { DEFAULT_PRESETS, getExercisePresets } from "../data/exercise-presets";
import { getWorkouts } from "../utils/storage";
import { WorkoutHistory, WeightExercise } from "../types";

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
  const [exercisePresets, setExercisePresets] = useState(DEFAULT_PRESETS);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setExercisePresets(getExercisePresets());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const workouts = getWorkouts();
    const history: ExerciseHistory = {};

    // Initialize history with all preset exercises
    exercisePresets[muscleGroup].forEach((exercise: string) => {
      history[exercise] = {
        dates: [],
        weights: []
      };
    });

    // Populate history with actual workout data
    workouts.forEach((workout: WorkoutHistory) => {
      workout.muscleGroups.forEach(group => {
        if (group.id === muscleGroup) {
          group.exercises.forEach(exercise => {
            if (exercise.type === 'weight' && history[exercise.name]) {
              const weightExercise = exercise as WeightExercise;
              // Calculate maximum weight for this exercise on this date
              const maxWeight = weightExercise.weight;

              // Find if this date already exists
              const existingDateIndex = history[exercise.name].dates.indexOf(workout.date);
              if (existingDateIndex >= 0) {
                // If date exists, keep the higher weight
                history[exercise.name].weights[existingDateIndex] = Math.max(
                  history[exercise.name].weights[existingDateIndex],
                  maxWeight
                );
              } else {
                // Add new date and weight
                history[exercise.name].dates.push(workout.date);
                history[exercise.name].weights.push(maxWeight);
              }
            }
          });
        }
      });
    });

    // Sort by date for each exercise
    Object.keys(history).forEach(exerciseName => {
      const combined = history[exerciseName].dates.map((date, index) => ({
        date,
        weight: history[exerciseName].weights[index]
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      history[exerciseName] = {
        dates: combined.map(item => item.date),
        weights: combined.map(item => item.weight)
      };
    });

    setExerciseHistory(history);
    setSelectedExercise("");
  }, [muscleGroup, exercisePresets, isClient]);

  const chartData = {
    labels: selectedExercise ? exerciseHistory[selectedExercise]?.dates.map(date =>
      new Date(date).toLocaleDateString()
    ) : [],
    datasets: [
      {
        label: `${selectedExercise} Weight Progress (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.weights : [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true
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
        },
        beginAtZero: false
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  const getProgressStats = () => {
    if (!selectedExercise || !exerciseHistory[selectedExercise]?.weights.length) {
      return null;
    }

    const weights = exerciseHistory[selectedExercise].weights;
    const latest = weights[weights.length - 1];
    const first = weights[0];
    const progress = latest - first;
    const progressPercentage = ((progress / first) * 100).toFixed(1);

    return {
      latest,
      first,
      progress,
      progressPercentage: progress > 0 ? `+${progressPercentage}%` : `${progressPercentage}%`,
      workoutCount: weights.length
    };
  };

  const stats = getProgressStats();

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
                {isClient && exercisePresets[muscleGroup].map((exercise: string) => (
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
              <div className="mb-6">
                <Line data={chartData} options={chartOptions} />
              </div>

              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-600">Latest Weight</h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.latest} kg
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-600">Total Progress</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.progress > 0 ? '+' : ''}{stats.progress.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-600">Progress %</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.progressPercentage}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-orange-600">Workouts</h3>
                    <p className="text-2xl font-bold text-orange-900">
                      {stats.workoutCount}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {selectedExercise
                ? "No weight data available for the selected exercise. Start recording workouts to see your progress!"
                : "Select an exercise to view progress"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
