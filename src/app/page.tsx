"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWorkoutSummaries, getWorkouts } from './workout/utils/storage';
import { WorkoutSummary, WorkoutHistory, Exercise } from './workout/types';

// Health tracking icons using heroicons paths
const HEALTH_LINKS = [
  {
    href: "/health/measurements",
    title: "Body Stats",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    description: "Track weight, body fat, and measurements"
  },
  {
    href: "/health/meal",
    title: "Meal",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
      </svg>
    ),
    description: "Log meals and track macros"
  },
  {
    href: "/health/goals",
    title: "Goals",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
    description: "Set and track your targets"
  },
  {
    href: "/health/summary",
    title: "Summary",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    description: "View your progress"
  }
];

const formatDateLocal = (date: Date) => {
  // YYYY-MM-DD in local time (avoids UTCずれ)
  return date.toLocaleDateString('en-CA');
};

export default function Home() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [workoutMap, setWorkoutMap] = useState<Map<string, WorkoutHistory[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(new Date());
  const [monthCells, setMonthCells] = useState<{ date: Date; inMonth: boolean; hasWorkout: boolean; isToday: boolean; isSelected: boolean; }[]>([]);

  const buildMonthGrid = (cursor: Date) => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startDay = start.getDay();
    const totalDays = end.getDate();
    const cells: { date: Date; inMonth: boolean; hasWorkout: boolean; isToday: boolean; isSelected: boolean; }[] = [];

    // Leading blanks (previous month)
    for (let i = 0; i < startDay; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDay - i));
      const key = formatDateLocal(d);
      cells.push({
        date: d,
        inMonth: false,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const key = formatDateLocal(dayDate);
      cells.push({
        date: dayDate,
        inMonth: true,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    // Trailing blanks to fill last week
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() + i + 1);
      const key = formatDateLocal(d);
      cells.push({
        date: d,
        inMonth: false,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    return cells;
  };

  useEffect(() => {
    const summaries = getWorkoutSummaries();
    setWorkouts(summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const data = getWorkouts();
    const map = new Map<string, WorkoutHistory[]>();
    data.forEach(w => {
      const key = w.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(w);
    });
    setWorkoutMap(map);
    setMonthCells(buildMonthGrid(new Date()));
  }, []);

  useEffect(() => {
    setMonthCells(buildMonthGrid(monthCursor));
  }, [selectedDate, workoutMap, monthCursor]);

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      'Chest': 'bg-red-100 text-red-800',
      'Back': 'bg-blue-100 text-blue-800',
      'Shoulders': 'bg-green-100 text-green-800',
      'Arms': 'bg-purple-100 text-purple-800',
      'Legs': 'bg-orange-100 text-orange-800',
      'Abs': 'bg-pink-100 text-pink-800',
      'Cardio': 'bg-yellow-100 text-yellow-800'
    };
    return colors[muscleGroup] || 'bg-gray-100 text-gray-800';
  };

  const summarizeWorkouts = (entries: WorkoutHistory[]) => {
    let exerciseCount = 0;
    let setCount = 0;
    entries.forEach(workout => {
      workout.muscleGroups.forEach(group => {
        group.exercises.forEach(exercise => {
          exerciseCount += 1;
          if ((exercise as any).sets) {
            setCount += (exercise as any).sets;
          } else {
            setCount += 1;
          }
        });
      });
    });
    return { exerciseCount, setCount };
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const goToPrevMonth = () => {
    const next = new Date(monthCursor);
    next.setMonth(monthCursor.getMonth() - 1);
    setMonthCursor(next);
  };

  const goToNextMonth = () => {
    const next = new Date(monthCursor);
    next.setMonth(monthCursor.getMonth() + 1);
    setMonthCursor(next);
  };

  const selectedDateKey = formatDateLocal(selectedDate);
  const selectedEntries = workoutMap.get(selectedDateKey) || [];
  const selectedSummary = summarizeWorkouts(selectedEntries);

  const formatExerciseDetail = (exercise: Exercise) => {
    if (exercise.type === 'weight') {
      return `${exercise.weight} kg x ${exercise.reps} reps`;
    }
    return `${exercise.duration} min, ${exercise.distance} km, ${exercise.calories} kcal`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Workout Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Workouts</h2>
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
              </div>
            </div>

            {/* Schedule: Mini month + week detail */}
            <div className="mb-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={goToPrevMonth} className="text-sm text-gray-600 hover:text-gray-900 px-2">←</button>
                    <div className="text-sm font-semibold text-gray-900">
                      {monthCursor.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={goToNextMonth} className="text-sm text-gray-600 hover:text-gray-900 px-2">→</button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-600 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-1 font-semibold">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthCells.map((cell, idx) => {
                      const key = `${formatDateLocal(cell.date)}-${idx}`;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectDate(cell.date)}
                          className={`relative py-2 text-sm rounded-md transition-all duration-150
                            ${cell.inMonth ? 'text-gray-900' : 'text-gray-400'}
                            ${cell.isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}
                            ${cell.hasWorkout ? 'border border-blue-200' : 'border border-transparent'}
                          `}
                        >
                          <span className="font-medium">{cell.date.getDate()}</span>
                          {cell.hasWorkout && !cell.isSelected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}
                          {cell.isToday && !cell.isSelected && (
                            <span className="absolute top-1 right-1 text-[10px] text-blue-500">today</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Selected Day</h4>
                    <span className="text-xs text-gray-500">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {selectedEntries.length > 0 ? (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      <div className="flex justify-between text-xs text-gray-700 px-1">
                        <span>Workouts: {selectedEntries.length}</span>
                        <span>Exercises: {selectedSummary.exerciseCount}</span>
                        <span>Sets: {selectedSummary.setCount}</span>
                      </div>
                      {selectedEntries.map((workout, idx) => {
                        const groups = workout.muscleGroups.filter(g => g.exercises.length > 0);
                        return (
                          <div key={`${workout.id}-${idx}`} className="border rounded-md p-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900">Workout {idx + 1}</span>
                              <span className="text-xs text-gray-600">{workout.totalCalories} kcal</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {groups.length > 0 ? groups.map((group, gidx) => (
                                <span key={gidx} className={`text-[11px] px-2 py-0.5 rounded-full ${getMuscleGroupColor(group.name)}`}>
                                  {group.name} ({group.exercises.length})
                                </span>
                              )) : <span className="text-xs text-gray-500">No exercises</span>}
                            </div>
                            {groups.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {groups.map((group, gidx) => (
                                  <div key={`${workout.id}-${gidx}`} className="border border-dashed border-gray-200 rounded-md p-2 bg-white">
                                    <div className="text-xs font-semibold text-gray-800 mb-1">{group.name}</div>
                                    <div className="space-y-1">
                                      {group.exercises.map((ex, eidx) => (
                                        <div key={`${workout.id}-${gidx}-${eidx}`} className="text-xs text-gray-700 flex justify-between">
                                          <span className="font-medium">{ex.name}</span>
                                          <span className="text-gray-600">{formatExerciseDetail(ex as Exercise)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-6 text-center">
                      No workout recorded for this day.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Health</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {HEALTH_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    {link.icon}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
