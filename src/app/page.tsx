"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWorkoutSummaries, getWorkouts } from './workout/utils/storage';
import { WorkoutSummary, WorkoutHistory } from './workout/types';

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

type CalendarDay = {
  date: string;
  dayOfWeek: string;
  dayNumber: number;
  hasWorkout: boolean;
  muscleGroups: string[];
};

export default function Home() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    const summaries = getWorkoutSummaries();
    setWorkouts(summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Generate calendar for last 2 weeks
    generateCalendar();
  }, []);

  const generateCalendar = () => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const workoutData = getWorkouts();

    // Create a map of workout dates to muscle groups
    const workoutMap = new Map<string, string[]>();
    workoutData.forEach(workout => {
      const muscleGroups = workout.muscleGroups
        .filter(group => group.exercises.length > 0)
        .map(group => group.name);
      workoutMap.set(workout.date, muscleGroups);
    });

    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();

      const hasWorkout = workoutMap.has(dateString);
      const muscleGroups = hasWorkout ? workoutMap.get(dateString) || [] : [];

      days.push({
        date: dateString,
        dayOfWeek,
        dayNumber,
        hasWorkout,
        muscleGroups
      });
    }

    setCalendarDays(days);
  };

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

                                    {/* Calendar */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Last 2 Weeks</h3>
              <div className="grid grid-cols-7 gap-0 border border-gray-300 rounded-lg overflow-hidden">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2 bg-gray-50 border-r border-gray-300 last:border-r-0">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={day.date}
                    className={`relative p-1 text-center min-h-[70px] transition-all duration-200 hover:bg-gray-50 ${
                      day.hasWorkout
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                        : 'bg-white'
                    } ${(index + 7) % 7 !== 6 ? 'border-r border-gray-300' : ''} ${
                      index < 7 ? 'border-b border-gray-300' : ''
                    }`}
                  >
                    <div className={`text-sm font-bold ${
                      day.hasWorkout ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {day.dayNumber}
                    </div>
                    {day.hasWorkout && (
                      <div className="mt-1 space-y-0.5">
                        {day.muscleGroups.slice(0, 2).map((group, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm ${getMuscleGroupColor(group)}`}
                          >
                            {group}
                          </div>
                        ))}
                        {day.muscleGroups.length > 2 && (
                          <div className="text-xs text-gray-600 font-medium">
                            +{day.muscleGroups.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
