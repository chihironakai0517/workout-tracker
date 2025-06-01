"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkouts } from "../utils/storage";
import { WorkoutHistory } from "../types";

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workoutData = getWorkouts();
    setWorkouts(workoutData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/workout/sync"
              className="px-3 py-2 text-sm text-purple-500 hover:text-purple-600 transition-colors"
            >
              Sync
            </Link>
            <Link
              href="/workout/progress"
              className="px-3 py-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              Progress
            </Link>
            <Link
              href="/workout/new"
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              New Workout
            </Link>
            <Link
              href="/"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center text-gray-500 py-8">
              <h2 className="text-xl font-medium mb-2">No workout records yet</h2>
              <p className="mb-4">Start your fitness journey by recording your first workout!</p>
              <Link
                href="/workout/new"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create First Workout
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(workout.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/workout/details?id=${workout.id}`}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-600">Total Exercises</h4>
                    <p className="text-xl font-bold text-gray-900">
                      {workout.muscleGroups.reduce((total, group) => total + group.exercises.length, 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-600">Muscle Groups</h4>
                    <p className="text-xl font-bold text-gray-900">
                      {workout.muscleGroups.filter(group => group.exercises.length > 0).length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-600">Total Calories</h4>
                    <p className="text-xl font-bold text-gray-900">
                      {workout.totalCalories} kcal
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="font-medium mb-2">Muscle Groups Trained:</h4>
                  <div className="flex flex-wrap gap-2">
                    {workout.muscleGroups
                      .filter(group => group.exercises.length > 0)
                      .map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                        >
                          {group.name} ({group.exercises.length})
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
