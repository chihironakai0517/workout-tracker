"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Meal, DailyNutrition } from "../../types";
import { getDailyNutrition, addMeal, updateWaterIntake, updateMeal, deleteMeal } from "../utils/storage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Nutrition() {
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<DailyNutrition | null>(null);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    type: "breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: currentDate
  });
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const data = getDailyNutrition(currentDate);
    setDailyData(data);
  }, [currentDate]);

  const calculateCaloriesFromPFC = (protein: number, fat: number, carbs: number): number => {
    return Math.round((protein * 4) + (fat * 9) + (carbs * 4));
  };

  const handleMacroChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    macro: 'protein' | 'fat' | 'carbs',
    meal: Meal | Partial<Meal>
  ) => {
    const value = Number(e.target.value);
    const updatedMeal = { ...meal, [macro]: value };
    
    // Calculate total calories from macros
    const calories = calculateCaloriesFromPFC(
      updatedMeal.protein || 0,
      updatedMeal.fat || 0,
      updatedMeal.carbs || 0
    );

    if (editingMeal) {
      setEditingMeal({ ...updatedMeal, calories } as Meal);
    } else {
      setNewMeal({ ...updatedMeal, calories } as Partial<Meal>);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeal.type && newMeal.calories !== undefined) {
      addMeal(newMeal as Omit<Meal, "id">);
      const updatedData = getDailyNutrition(currentDate);
      setDailyData(updatedData);
      setNewMeal({
        type: "breakfast",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: currentDate
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
      updateMeal(currentDate, editingMeal);
      const updatedData = getDailyNutrition(currentDate);
      setDailyData(updatedData);
      setEditingMeal(null);
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    if (confirm("Are you sure you want to delete this meal?")) {
      deleteMeal(currentDate, mealId);
      const updatedData = getDailyNutrition(currentDate);
      setDailyData(updatedData);
    }
  };

  const handleWaterIntakeChange = (value: number) => {
    updateWaterIntake(currentDate, value);
    const updatedData = getDailyNutrition(currentDate);
    setDailyData(updatedData);
  };

  const macroChartData = {
    labels: ['Protein', 'Fat', 'Carbs'],
    datasets: [
      {
        data: [
          dailyData?.totalProtein || 0,
          dailyData?.totalFat || 0,
          dailyData?.totalCarbs || 0
        ],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 206, 86)',
          'rgb(54, 162, 235)'
        ]
      }
    ]
  };

  const mealCaloriesData = {
    labels: dailyData?.meals.map(m => m.name) || [],
    datasets: [
      {
        label: 'Calories per Meal',
        data: dailyData?.meals.map(m => m.calories) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Tracking</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Macronutrient Distribution</h2>
            <Doughnut data={macroChartData} options={chartOptions} />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total Calories: {dailyData?.totalCalories || 0} kcal
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Calories by Meal</h2>
            <Bar data={mealCaloriesData} options={chartOptions} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingMeal ? "Edit Meal" : "Add New Meal"}
          </h2>
          <form onSubmit={editingMeal ? handleEditSubmit : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type
              </label>
              <select
                value={editingMeal ? editingMeal.type : newMeal.type}
                onChange={(e) => {
                  if (editingMeal) {
                    setEditingMeal({ ...editingMeal, type: e.target.value as Meal["type"] });
                  } else {
                    setNewMeal(prev => ({ ...prev, type: e.target.value as Meal["type"] }));
                  }
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                value={editingMeal ? editingMeal.calories : newMeal.calories}
                className="w-full border rounded-md px-3 py-2 bg-gray-50"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">
                Calculated from PFC values (P: 4kcal/g, F: 9kcal/g, C: 4kcal/g)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                value={editingMeal ? editingMeal.protein : newMeal.protein}
                onChange={(e) => handleMacroChange(e, 'protein', editingMeal || newMeal)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fat (g)
              </label>
              <input
                type="number"
                value={editingMeal ? editingMeal.fat : newMeal.fat}
                onChange={(e) => handleMacroChange(e, 'fat', editingMeal || newMeal)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                value={editingMeal ? editingMeal.carbs : newMeal.carbs}
                onChange={(e) => handleMacroChange(e, 'carbs', editingMeal || newMeal)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-between">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {editingMeal ? "Update Meal" : "Add Meal"}
              </button>
              {editingMeal && (
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Water Intake</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={dailyData?.waterIntake || 0}
              onChange={(e) => handleWaterIntakeChange(Number(e.target.value))}
              className="w-24 border rounded-md px-3 py-2"
              placeholder="ml"
            />
            <button
              onClick={() => handleWaterIntakeChange((dailyData?.waterIntake || 0) + 250)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add 250ml
            </button>
            <div className="text-sm text-gray-600">
              Total: {dailyData?.waterIntake || 0}ml
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Meals</h2>
          {!dailyData?.meals.length ? (
            <p className="text-center text-gray-500 py-4">
              No meals recorded yet
            </p>
          ) : (
            <div className="space-y-4">
              {dailyData.meals.map(meal => (
                <div
                  key={meal.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingMeal(meal)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Calories</p>
                      <p>{meal.calories}</p>
                    </div>
                    <div>
                      <p className="font-medium">Protein</p>
                      <p>{meal.protein}g</p>
                    </div>
                    <div>
                      <p className="font-medium">Fat</p>
                      <p>{meal.fat}g</p>
                    </div>
                    <div>
                      <p className="font-medium">Carbs</p>
                      <p>{meal.carbs}g</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 