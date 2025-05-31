"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EXERCISE_PRESETS, DEFAULT_PRESETS } from "../data/exercise-presets";
import { Exercise, WeightExercise, CardioExercise, MuscleGroup, WorkoutHistory } from "../types";
import { METS_VALUES, calculateCalories } from "../utils/calories";
import { v4 as uuidv4 } from "uuid";
import { saveWorkout, getLastWorkout } from "../utils/storage";
import { addCustomExercise } from "../data/exercise-presets";
import { getLatestMeasurement } from "../../health/utils/storage";
import Timer from "../components/Timer";

const DEFAULT_WEIGHT = 70;

const muscleGroupsData = [
  { id: "chest", name: "Chest", exercises: [] },
  { id: "back", name: "Back", exercises: [] },
  { id: "shoulders", name: "Shoulders", exercises: [] },
  { id: "arms", name: "Arms", exercises: [] },
  { id: "legs", name: "Legs", exercises: [] },
  { id: "abs", name: "Abs", exercises: [] },
  { id: "cardio", name: "Cardio", exercises: [] },
];

const isCardioExercise = (exercise: Exercise): exercise is CardioExercise => {
  return exercise.type === "cardio";
};

const createInitialExercise = (isCardio: boolean): Exercise => {
  return isCardio
    ? {
        type: "cardio",
        name: "",
        duration: 0,
        distance: 0,
        calories: 0,
      }
    : {
        type: "weight",
        name: "",
        weight: 0,
        reps: 0,
        sets: 1,
      };
};

export default function NewWorkout() {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(muscleGroupsData);
  const [activeGroup, setActiveGroup] = useState<string>("chest");
  const [newExercise, setNewExercise] = useState<Exercise>(() => createInitialExercise(false));
  const [cardioInputs, setCardioInputs] = useState({
    duration: 0,
    distance: 0,
  });
  const [workoutDate, setWorkoutDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showCustomExerciseInput, setShowCustomExerciseInput] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [lastWorkout, setLastWorkout] = useState<WorkoutHistory | null>(null);
  const [userWeight, setUserWeight] = useState<number>(DEFAULT_WEIGHT);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const last = getLastWorkout();
    setLastWorkout(last);

    const latestMeasurement = getLatestMeasurement();
    if (latestMeasurement) {
      setUserWeight(latestMeasurement.weight);
    }
  }, []);

  useEffect(() => {
    if (!isCardioExercise(newExercise) || !cardioInputs.duration || !cardioInputs.distance) return;

    const { name } = newExercise;
    const { duration, distance } = cardioInputs;
    
    if (name && METS_VALUES[name as keyof typeof METS_VALUES]) {
      const speedKmH = (distance / (duration / 60));
      const mets = METS_VALUES[name as keyof typeof METS_VALUES].calculate(speedKmH);
      const calories = calculateCalories(mets, duration, userWeight);
      
      setNewExercise(prev => {
        if (!isCardioExercise(prev)) return prev;
        return {
          ...prev,
          duration,
          distance,
          calories,
        };
      });
    }
  }, [cardioInputs, newExercise.name, userWeight]);

  const addExercise = (groupId: string) => {
    if (!newExercise.name) return;

    setMuscleGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, exercises: [...group.exercises, { ...newExercise }] }
          : group
      )
    );

    const isCardio = groupId === "cardio";
    setNewExercise(createInitialExercise(isCardio));
    if (isCardio) {
      setCardioInputs({ duration: 0, distance: 0 });
    }

    setShowTimer(true);
  };

  const removeExercise = (groupId: string, index: number) => {
    setMuscleGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              exercises: group.exercises.filter((_, i) => i !== index),
            }
          : group
      )
    );
  };

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    const isCardio = groupId === "cardio";
    setNewExercise(createInitialExercise(isCardio));
    if (isCardio) {
      setCardioInputs({ duration: 0, distance: 0 });
    }
  };

  const handleSaveWorkout = () => {
    const totalCalories = muscleGroups
      .flatMap(group => group.exercises)
      .reduce((total: number, exercise: Exercise) => {
        if (exercise.type === "cardio") {
          return total + exercise.calories;
        }
        return total;
      }, 0);

    const workout: WorkoutHistory = {
      id: uuidv4(),
      date: workoutDate,
      muscleGroups,
      totalCalories,
    };

    saveWorkout(workout);
    window.location.href = "/";
  };

  const handleAddCustomExercise = () => {
    if (customExerciseName.trim()) {
      const muscleGroupKey = activeGroup as keyof typeof DEFAULT_PRESETS;
      addCustomExercise(muscleGroupKey, customExerciseName.trim());
      setCustomExerciseName("");
      setShowCustomExerciseInput(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">New Workout</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Date
            </label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          {lastWorkout && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Previous Workout ({new Date(lastWorkout.date).toLocaleDateString()})
              </h3>
              <div className="text-sm text-gray-600">
                <p>Total Calories: {lastWorkout.totalCalories} kcal</p>
                <p>
                  Exercise Count:{" "}
                  {lastWorkout.muscleGroups.reduce(
                    (total: number, group: MuscleGroup) => total + group.exercises.length,
                    0
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {muscleGroups.map(group => (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    activeGroup === group.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Exercise
              </h3>
              <button
                onClick={() => setShowCustomExerciseInput(!showCustomExerciseInput)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {showCustomExerciseInput ? "Cancel" : "Add Custom Exercise"}
              </button>
            </div>

            {showCustomExerciseInput ? (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Enter new exercise name"
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                  onClick={handleAddCustomExercise}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newExercise.name}
                onChange={e =>
                  setNewExercise(prev => ({ ...prev, name: e.target.value }))
                }
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select Exercise</option>
                {EXERCISE_PRESETS[activeGroup as keyof typeof DEFAULT_PRESETS].map(
                  (exercise: string) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  )
                )}
              </select>

              {activeGroup === "cardio" ? (
                <>
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={cardioInputs.duration || ""}
                    onChange={e =>
                      setCardioInputs(prev => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Distance (km)"
                    value={cardioInputs.distance || ""}
                    onChange={e =>
                      setCardioInputs(prev => ({
                        ...prev,
                        distance: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={isCardioExercise(newExercise) ? newExercise.calories : 0}
                    disabled
                    className="border rounded-md px-3 py-2 bg-gray-50"
                  />
                  {cardioInputs.duration > 0 && cardioInputs.distance > 0 && (
                    <div className="col-span-4 text-sm text-gray-600">
                      Speed: {(cardioInputs.distance / (cardioInputs.duration / 60)).toFixed(1)} km/h
                    </div>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={(newExercise as WeightExercise).weight || ""}
                    onChange={e =>
                      setNewExercise(prev => ({
                        ...(prev as WeightExercise),
                        weight: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={(newExercise as WeightExercise).reps || ""}
                    onChange={e =>
                      setNewExercise(prev => ({
                        ...(prev as WeightExercise),
                        reps: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Sets"
                    value={(newExercise as WeightExercise).sets || ""}
                    onChange={e =>
                      setNewExercise(prev => ({
                        ...(prev as WeightExercise),
                        sets: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                </>
              )}
            </div>
            <button
              onClick={() => addExercise(activeGroup)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Exercise
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recorded Exercises
            </h3>
            {muscleGroups.map(group => (
              <div
                key={group.id}
                className={group.id === activeGroup ? "block" : "hidden"}
              >
                {group.exercises.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No exercises recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {group.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <span className="font-medium">{exercise.name}</span>
                          {exercise.type === "cardio" ? (
                            <>
                              <span>{exercise.duration} min</span>
                              <span>{exercise.distance} km</span>
                              <span>{exercise.calories} kcal</span>
                            </>
                          ) : (
                            <>
                              <span>{exercise.weight} kg</span>
                              <span>{exercise.reps} reps</span>
                              <span>{exercise.sets} sets</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => removeExercise(group.id, index)}
                          className="ml-4 text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveWorkout}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save Workout
            </button>
          </div>
        </div>
      </div>
      {showTimer && <Timer onClose={() => setShowTimer(false)} />}
    </div>
  );
} 