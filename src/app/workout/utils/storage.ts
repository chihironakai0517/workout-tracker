import { WorkoutHistory, WorkoutSummary } from '../types';

const STORAGE_KEY = 'workout-history';

export const saveWorkout = (workout: WorkoutHistory): void => {
  const existingWorkouts = getWorkouts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingWorkouts, workout]));
};

export const getWorkouts = (): WorkoutHistory[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getWorkoutById = (id: string): WorkoutHistory | null => {
  const workouts = getWorkouts();
  return workouts.find(w => w.id === id) || null;
};

export const getWorkoutSummaries = (): WorkoutSummary[] => {
  return getWorkouts().map(workout => ({
    id: workout.id,
    date: workout.date,
    exerciseCount: workout.muscleGroups.reduce(
      (total, group) => total + group.exercises.length,
      0
    ),
    totalCalories: workout.totalCalories,
  }));
};

export const getLastWorkout = (): WorkoutHistory | null => {
  const workouts = getWorkouts();
  return workouts.length > 0 ? workouts[workouts.length - 1] : null;
}; 