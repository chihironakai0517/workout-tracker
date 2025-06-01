"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutById } from "../utils/storage";
import { WorkoutHistory, Exercise } from "../types";

export default function WorkoutDetailPage() {
  const [workout, setWorkout] = useState<WorkoutHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutId, setWorkoutId] = useState<string>("");

  useEffect(() => {
    // Get workout ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setWorkoutId(id);
      const workoutData = getWorkoutById(id);
      setWorkout(workoutData);
    }
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

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Workout Not Found</h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">The requested workout could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatExerciseDetails = (exercise: Exercise) => {
    if (exercise.type === 'weight') {
      return `${exercise.weight}kg x ${exercise.reps} reps x ${exercise.sets} sets`;
    } else {
      return `${exercise.duration} min, ${exercise.distance}km, ${exercise.calories} cal`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Workout Details - {new Date(workout.date).toLocaleDateString()}
          </h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-600">Date</h3>
              <p className="text-xl font-bold text-blue-900">
                {new Date(workout.date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-600">Total Exercises</h3>
              <p className="text-xl font-bold text-green-900">
                {workout.muscleGroups.reduce((total, group) => total + group.exercises.length, 0)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-600">Total Calories</h3>
              <p className="text-xl font-bold text-orange-900">
                {workout.totalCalories} kcal
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercises by Muscle Group</h2>

          <div className="space-y-6">
            {workout.muscleGroups.map((group) => (
              group.exercises.length > 0 && (
                <div key={group.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                    {group.name}
                  </h3>
                  <div className="space-y-3">
                    {group.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatExerciseDetails(exercise)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {exercise.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
